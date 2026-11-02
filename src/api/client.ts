import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

// Client-side replacement for live-repo's getAuthHeaders() (src/lib/utils/apiUtils.ts).
// The web app adds these headers server-side from the next-auth cookie; here we hold
// the session in memory (hydrated from SecureStore by AuthProvider) and add them per request.

// Per-request flag: the session check itself must not trigger another session check.
declare module 'axios' {
  interface AxiosRequestConfig {
    skipSessionCheck?: boolean;
  }
}

type Session = { token: string | null; organizationId: string | null };

const session: Session = { token: null, organizationId: null };
let onUnauthorized: (() => void) | null = null;

export const setApiSession = (next: Session) => {
  session.token = next.token;
  session.organizationId = next.organizationId;
};

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

const timezone = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
})();

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Timezone': timezone,
  },
});

api.interceptors.request.use((config) => {
  // Multipart uploads: drop our default JSON Content-Type so the platform (browser or RN's
  // networking layer) sets `multipart/form-data; boundary=…` itself. Setting it by hand
  // leaves out the boundary and the server can't parse the body — the same reason
  // live-repo's BFF deletes Content-Type before forwarding FormData.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  if (session.organizationId) {
    config.headers['X-OrganizationId'] = session.organizationId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A 401 on one request doesn't prove the session is over (web never signs out on it:
    // it only checks GET /getuser). So we only *report* it; AuthProvider verifies the
    // session before signing out. A 401 without a token (POST /login) is just bad credentials.
    const sentToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && sentToken && !error.config?.skipSessionCheck) {
      if (__DEV__) {
        const method = error.config?.method?.toUpperCase();
        console.warn(`[api] 401 from ${method} ${error.config?.url}: verifying the session`);
      }
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

// Field errors from a Laravel validation response, as { field: firstMessage }.
// Most endpoints use { errors: {...} } (422); POST /register uses { validation_errors: {...} }
// (400).
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError(error)) return {};
  const data = error.response?.data as any;
  const bag: Record<string, string[] | string> | undefined =
    data?.errors ?? data?.validation_errors;
  if (!bag || typeof bag !== 'object') return {};
  return Object.fromEntries(
    Object.entries(bag).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : String(messages),
    ])
  );
};

// Laravel-style error bodies: { message } or { errors | validation_errors: { field: [msg] } }.
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // No HTTP response at all: DNS/TLS/CORS/timeout. In dev, surface the real cause.
      if (__DEV__) {
        const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
        console.warn('[api] request failed without response', error.code, error.message, url);
        return `Cannot reach the server (${error.code ?? 'no code'}: ${error.message}) — ${url}`;
      }
      return 'Cannot reach the server. Check your connection.';
    }
    const data = error.response.data as any;
    const firstFieldError = Object.values(getFieldErrors(error))[0];
    return firstFieldError || data?.message || data?.error || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};
