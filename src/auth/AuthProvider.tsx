import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { setApiSession, setUnauthorizedHandler } from '../api/client';
import { tokenStorage } from '../api/tokenStorage';
import * as perms from './permissions';
import type { AuthOrganization, AuthUser, CurrentUserResponse, LoginResponse } from './types';

// Mobile port of live-repo's JumboAuthProvider. Differences from the web version:
// - storage is async (SecureStore) so there is an explicit 'loading' status on boot
// - the bearer token is ours to hold; there is no next-auth cookie
// - "onlyAuthAccessData" route lists are replaced by RootNavigator rendering
//   different screens per status (the React Navigation auth-flow pattern)

type Status = 'loading' | 'signedOut' | 'signedIn' | 'bootError';

type AuthState = {
  status: Status;
  authUser: AuthUser | null;
  authOrganization: AuthOrganization | null;
};

export type SignUpValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

export type AuthContextType = AuthState & {
  isEmailVerified: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  // Resolves true when the backend logged the new user in, false when they must sign in.
  signUp: (values: SignUpValues) => Promise<boolean>;
  loadOrganization: (organizationId: string) => Promise<void>;
  // After creating an organization: adopt the org-scoped token the backend returned.
  adoptOrganization: (data: LoginResponse) => Promise<void>;
  refreshAuth: () => Promise<CurrentUserResponse>;
  signOut: () => Promise<void>;
  retryBoot: () => void;
  checkPermission: (permissions: string | string[], mustHaveAll?: boolean) => boolean;
  checkOrganizationPermission: (permissions: string | string[], mustHaveAll?: boolean) => boolean;
  hasOrganizationRole: (roles: string | string[], mustHaveAll?: boolean) => boolean;
  organizationHasSubscribed: (modules: string | string[], mustHaveAll?: boolean) => boolean;
  moduleSetting: (setting: { module_id: string; id: string }) => any;
};

const AuthContext = createContext<AuthContextType | null>(null);

const signedOutState: AuthState = { status: 'signedOut', authUser: null, authOrganization: null };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ ...signedOutState, status: 'loading' });
  const [bootAttempt, setBootAttempt] = useState(0);
  const checkingSession = useRef(false);

  // The backend sends organization ids as numbers even though our types say string.
  // SecureStore only accepts strings ("Invalid value provided to SecureStore"), and a
  // header value should be a string too, so normalise once, here, for every caller.
  const persistSession = useCallback(
    async (token: string, rawOrganizationId: string | number | null) => {
      const organizationId =
        rawOrganizationId === null || rawOrganizationId === undefined
          ? null
          : String(rawOrganizationId);
      setApiSession({ token: String(token), organizationId });
      await tokenStorage.save({ token: String(token), organizationId });
    },
    []
  );

  const resetAuth = useCallback(async () => {
    setApiSession({ token: null, organizationId: null });
    queryClient.clear();
    setState(signedOutState);
    await tokenStorage.clear();
  }, [queryClient]);

  const applyOrganizationResponse = useCallback(
    async (data: LoginResponse) => {
      const organizationId = data.authOrganization?.organization?.id ?? null;
      await persistSession(data.token, organizationId);
      // Data cached under the previous organization must not leak into this one.
      queryClient.clear();
      setState({
        status: 'signedIn',
        authUser: data.authUser,
        authOrganization: data.authOrganization ?? null,
      });
    },
    [persistSession, queryClient]
  );

  const loadOrganization = useCallback(
    async (organizationId: string) => {
      const data = await authApi.loadOrganization(organizationId);
      await applyOrganizationResponse(data);
    },
    [applyOrganizationResponse]
  );

  // Mirrors LoginForm.jsx: login, then if the user has a default org, load it
  // so we hold an org-scoped token; otherwise the navigator shows the org picker.
  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      const data = await authApi.login(credentials);
      const organizationId = data.authOrganization?.organization?.id ?? null;
      await persistSession(data.token, organizationId);

      if (organizationId) {
        try {
          await loadOrganization(organizationId);
          return;
        } catch {
          // Fall through to the org picker rather than failing the whole login.
        }
      }

      setState({ status: 'signedIn', authUser: data.authUser, authOrganization: null });
    },
    [persistSession, loadOrganization]
  );

  // Mirrors JumboAuthProvider.signUp: POST /register; if the backend returns a session,
  // keep it — RootNavigator then shows the verify-email screen until the email is verified.
  const signUp = useCallback(
    async (values: SignUpValues) => {
      const data = await authApi.register(values);
      if (!data?.token || !data?.authUser?.user) return false;
      const organizationId = data.authOrganization?.organization?.id ?? null;
      await persistSession(data.token, organizationId);
      setState({
        status: 'signedIn',
        authUser: data.authUser,
        authOrganization: data.authOrganization ?? null,
      });
      return true;
    },
    [persistSession]
  );

  const refreshAuth = useCallback(async () => {
    const data = await authApi.getCurrentUser();
    if (!data?.authUser?.user?.email) {
      throw new Error('Invalid user data received');
    }
    setState({
      status: 'signedIn',
      authUser: data.authUser,
      authOrganization: data.authOrganization ?? null,
    });
    return data;
  }, []);

  // Note: like the web app, logout only drops the token locally; there is no
  // backend logout call, so the token stays valid server-side until it expires.
  const signOut = resetAuth;

  useEffect(() => {
    // Some request got a 401. Like web's middleware (GET /api/auth/status → /getuser), ask
    // the backend whether the session is still valid, and sign out only if it isn't.
    // One check at a time: several requests failing together cause a single /getuser.
    setUnauthorizedHandler(async () => {
      if (checkingSession.current) return;
      checkingSession.current = true;
      try {
        await authApi.getCurrentUser({ skipSessionCheck: true });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await resetAuth();
        }
      } finally {
        checkingSession.current = false;
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [resetAuth]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      let stored;
      try {
        stored = await tokenStorage.load();
      } catch {
        stored = { token: null, organizationId: null };
      }
      if (!stored.token) {
        if (!cancelled) setState(signedOutState);
        return;
      }

      setApiSession(stored);
      try {
        await refreshAuth();
      } catch (error) {
        if (cancelled) return;
        // 401 is handled by the interceptor (resetAuth). Anything else — usually
        // no network — should not throw away a token that may still be valid.
        const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401;
        if (!isUnauthorized) {
          setState({ ...signedOutState, status: 'bootError' });
        }
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [bootAttempt, refreshAuth]);

  const retryBoot = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading' }));
    setBootAttempt((n) => n + 1);
  }, []);

  // Web's authMiddleware sends users with a null email_verified_at to /auth/verifyEmail.
  // Only an explicit null counts as unverified: if a response omits the field we let the
  // user through, and GET /getuser on the next boot settles it.
  const isEmailVerified = state.authUser?.user?.email_verified_at !== null;

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      isEmailVerified,
      signIn,
      signUp,
      loadOrganization,
      adoptOrganization: applyOrganizationResponse,
      refreshAuth,
      signOut,
      retryBoot,
      checkPermission: (p, all) => perms.checkPermission(state.authUser, p, all),
      checkOrganizationPermission: (p, all) =>
        perms.checkOrganizationPermission(state.authOrganization, p, all),
      hasOrganizationRole: (r, all) => perms.hasOrganizationRole(state.authUser, r, all),
      organizationHasSubscribed: (m, all) =>
        perms.organizationHasSubscribed(state.authOrganization, m, all),
      moduleSetting: (s) => perms.moduleSetting(state.authOrganization, s),
    }),
    [
      state,
      isEmailVerified,
      signIn,
      signUp,
      loadOrganization,
      applyOrganizationResponse,
      refreshAuth,
      signOut,
      retryBoot,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
