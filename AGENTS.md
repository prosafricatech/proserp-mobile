This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## API and services structure

- Keep shared HTTP transport in `src/api/client.ts` (Axios configuration, auth and organization headers, timeouts, and common error handling). Keep shared upload helpers in `src/api/upload.ts`.
- Keep all backend endpoint definitions and request/response mapping out of screens, forms, and UI components. UI code must call service functions; service functions call the shared client.
- Store API services under `src/api/`: auth services in `src/api/auth/services.ts`, and feature services under `src/api/modules/<module>/<resource>/services.ts` for large modules (for example, `processApproval/requisitions/services.ts` and `procurement/purchaseOrders/services.ts`). A small feature may use `src/api/modules/<module>/services.ts` until it needs splitting by resource.
- A service owns endpoint paths, HTTP methods, params/body, response types, and feature-specific request/response mapping. Name functions by intent, such as `listRequisitions`, `createRequisition`, and `approveRequisition`.
- Screens/forms may use TanStack Query for query and mutation lifecycle, but should not contain backend URLs or call Axios/fetch directly. Keep query keys and reusable query hooks close to the feature UI when they grow beyond simple screen-level use.
- Do not create client-side files that imitate Next.js `/api` route handlers. This app has no server-side handler layer; services call the configured backend through `client.ts`. If a server-side BFF is needed, implement it in a real server environment.
- Keep the directory convention consistent for new features. Do not rename existing service files as part of unrelated work.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
