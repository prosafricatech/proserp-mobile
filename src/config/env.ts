const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and restart `npx expo start -c`.'
  );
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
};
