import * as SecureStore from 'expo-secure-store';

// SecureStore is the mobile replacement for httpOnly next-auth cookie.
// Only small secrets live here: the bearer token and the active organization id.
// Profile data (authUser/authOrganization) is re-fetched from GET /getuser on boot,
// the same way JumboAuthProvider's refreshAuth() does.
const TOKEN_KEY = 'proserp.token';
const ORGANIZATION_ID_KEY = 'proserp.organizationId';

// The app targets iOS and Android only: SecureStore = iOS Keychain / Android Keystore.
const store = SecureStore;

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
