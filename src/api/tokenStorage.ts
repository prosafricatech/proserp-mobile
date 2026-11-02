import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore is the mobile replacement for live-repo's httpOnly next-auth cookie.
// Only small secrets live here: the bearer token and the active organization id.
// Profile data (authUser/authOrganization) is re-fetched from GET /getuser on boot,
// the same way JumboAuthProvider's refreshAuth() does.
const TOKEN_KEY = 'proserp.token';
const ORGANIZATION_ID_KEY = 'proserp.organizationId';

// expo-secure-store has no web implementation. Web is only a dev preview, and a browser
// has no safe place for a raw bearer token: localStorage/sessionStorage are readable by
// any script on the page (XSS). So on web the token lives in memory only and a page
// reload signs you out. Never ship this web build — ProsERP web keeps the token in an
// httpOnly cookie via its Next.js BFF, which is the right design for browsers.
const memory = new Map<string, string>();
if (Platform.OS === 'web') {
  // Earlier dev builds persisted the token in localStorage; remove any leftover copy.
  try {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
    globalThis.localStorage?.removeItem(ORGANIZATION_ID_KEY);
  } catch {}
}
const store =
  Platform.OS === 'web'
    ? {
        getItemAsync: async (key: string) => memory.get(key) ?? null,
        setItemAsync: async (key: string, value: string) => void memory.set(key, value),
        deleteItemAsync: async (key: string) => void memory.delete(key),
      }
    : SecureStore;

export type StoredSession = {
  token: string | null;
  organizationId: string | null;
};

export const tokenStorage = {
  async load(): Promise<StoredSession> {
    const [token, organizationId] = await Promise.all([
      store.getItemAsync(TOKEN_KEY),
      store.getItemAsync(ORGANIZATION_ID_KEY),
    ]);
    return { token, organizationId };
  },

  async save({ token, organizationId }: StoredSession): Promise<void> {
    await Promise.all([
      token ? store.setItemAsync(TOKEN_KEY, token) : store.deleteItemAsync(TOKEN_KEY),
      organizationId
        ? store.setItemAsync(ORGANIZATION_ID_KEY, organizationId)
        : store.deleteItemAsync(ORGANIZATION_ID_KEY),
    ]);
  },

  async clear(): Promise<void> {
    await this.save({ token: null, organizationId: null });
  },
};
