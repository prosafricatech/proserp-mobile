import { api } from './client';
import type { CurrentUserResponse, LoginResponse } from '../auth/types';

// These hit API_BASE_URL directly — the same backend endpoints that live-repo's
// /api/** BFF routes proxy to (e.g. /api/auth/getuser -> GET /getuser).
export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const { data } = await api.post<LoginResponse>('/login', credentials);
    if (!data?.token || !data?.authUser?.user?.id) {
      throw new Error('Invalid login credentials');
    }
    return data;
  },

  // Web: SignupForm -> /api/auth/register. The backend may or may not log the user in
  // straight away; when it returns a token we start a session (see AuthProvider.signUp).
  async register(values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) {
    const { data } = await api.post<Partial<LoginResponse>>('/register', values);
    return data;
  },

  // Web: EmailVerificationNotice -> /api/auth/verification-notification (needs the bearer token).
  async resendVerificationEmail(email: string) {
    const { data } = await api.post<{ message?: string }>('/email/verification-notification', {
      email,
    });
    return data;
  },

  // Web: ResetPassword (no token in URL) -> /api/auth/recover-email. Emails a reset link.
  async requestPasswordReset(email: string) {
    const { data } = await api.post<{ message?: string }>('/recover-password', { email });
    return data;
  },

  // Web: ResetPasswordForm -> /api/auth/reset-password.
  async resetPassword(values: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const { data } = await api.post<{ message?: string }>('/reset-password', values);
    return data;
  },

  // skipSessionCheck: used when this call IS the session check (see AuthProvider).
  async getCurrentUser(options: { skipSessionCheck?: boolean } = {}) {
    const { data } = await api.get<CurrentUserResponse>('/getuser', {
      skipSessionCheck: options.skipSessionCheck,
    });
    return data;
  },

  // Returns a NEW token scoped to the organization. The web BFF swaps it into the
  // session cookie (src/app/api/organizations/[id]/load/route.ts); we must replace
  // the stored token too, or later requests keep using the old org's token.
  async loadOrganization(organizationId: string) {
    const { data } = await api.put<LoginResponse>(`/organizations/${organizationId}/load`, {
      organization_id: organizationId,
    });
    if (!data?.token || !data?.authOrganization?.organization?.id) {
      throw new Error('Invalid organization data received');
    }
    return data;
  },
};
