# Claude Code instructions

Read [`AGENTS.md`](./AGENTS.md) for Expo SDK, tooling, and environment-specific instructions. The rules below record the mobile adaptations of company conventions shared with `live-repo`.

## Porting features from live-repo

- Before porting a feature, inspect the corresponding web component, service, dictionary entries, permission constants, module constants, and visibility rules. Preserve the web behavior for permissions, subscriptions, and data mapping unless the mobile product intentionally differs.
- Treat React Native as a mobile client, not as a Next.js BFF. Do not add pretend `/api` route handlers or assume SSR exists in this app. Screens and forms call feature services, which call the shared backend client.
- Adapt web UI patterns to React Native and the libraries already used here. Do not copy MUI, Next.js, browser-only APIs, or desktop layouts into mobile screens.

## Navigation and menu

- This app uses React Navigation. Navigators and their route parameter types live in `src/navigation/`; screens live in `src/screens/`. Do not introduce Expo Router routes unless the project is deliberately migrated.
- Keep menu structure and route metadata in `src/navigation/moduleRegistry.ts`; keep permission/subscription gates and menu filtering in `src/navigation/menuPermissions.ts`, keyed by menu item ID.
- Keep menu icon names in `src/navigation/menuIcons.ts` as a typed semantic registry, mirroring live-repo's `utilities/constants/icons.tsx`. Menu nodes store `MenuIconKey` values, not icon-library strings; resolve them when rendering the drawer.
- Keep menu labels in `src/i18n/en/menu.ts` and `src/i18n/sw/menu.ts`. Resolve them with `menuLabel()`; do not put translated text or inline language pairs in the registry.
- Keep route/report IDs stable across locales. Never use translated labels as React keys, route identity, or analytics identity.
- Do not expose internal delivery-plan metadata such as `hatua` in routes or customer-facing screens. Use product-facing states such as “Coming soon” when a destination is not implemented.

## Permissions and subscriptions

- Use `PERMISSIONS.X` from `src/constants/permissions.ts` and `MODULES.X` from `src/constants/modules.ts`. Do not inline permission or subscription strings in UI code.
- Use `useAuth()` access helpers (`checkOrganizationPermission` and `organizationHasSubscribed`) and preserve web any-of semantics for permission arrays. Keep menu gates in `menuPermissions.ts`; keep feature/card/action gates beside the UI they control.
- Keep ProsControl/platform-admin permissions in `src/constants/prosControlPermissions.ts`; do not mix them with organization permissions.

## API and data flow

- Shared Axios transport, auth and organization headers, timeouts, and common error handling belong in `src/api/client.ts`. Shared multipart helpers belong in `src/api/upload.ts`.
- Endpoint paths, HTTP methods, request/response types, and feature-specific mapping belong in service files under `src/api/`. Screens, forms, and UI components must not call Axios/fetch directly or contain backend URLs.
- Use TanStack Query for screen data lifecycle. Use camelCase query keys, include every changing query parameter in the key, and invalidate the narrowest relevant key after mutations. Reuse feature hooks/keys when multiple screens share a query.
- Follow the web mutation outcomes in mobile form: show localized success/error feedback, close completed forms, map server validation errors to fields where applicable, and invalidate affected queries.
- For large features, group services by module/resource, for example `src/api/modules/procurement/purchaseOrders/services.ts`. Do not rename existing service files as unrelated cleanup.

## Localization and UI

- All user-facing strings, including labels, empty/loading/error states, dialogs, and validation messages, belong in both `src/i18n/en/index.ts` and `src/i18n/sw/index.ts`. The Swahili dictionary is typed against the English `Dictionary`; keep keys and placeholders aligned.
- Do not hardcode translated strings in JSX or select language-specific copy with inline conditionals. Use the active dictionary.
- Prefer stable, readable component code, clear spacing, and named query/mutation sections so a developer can identify lifecycle and intent quickly.
- Keep date handling on dayjs and use shared dashboard formatting helpers where available. Preserve backend date formats expected by each service.
- Use React Native Paper and the project's theme providers/styles for consistent cross-platform UI. Respect safe areas, accessibility roles/labels, and mobile touch targets.

## Verification

- Before finishing code changes, run `npx expo lint` and `npx tsc --noEmit` (or the package-manager equivalent described in `AGENTS.md`). Do not add tests unless requested.

## Security follow-ups — pending before production readiness

- [ ] Verify on the backend that every protected endpoint enforces user permissions, organization scope, and resource ownership. Mobile permission checks only control UI visibility and are not an authorization boundary. The backend has not been audited as part of this repository review.
- [ ] Confirm the backend token expiration and refresh policy, and add server-side token revocation to logout if the API supports it. Mobile logout currently clears local credentials only.
- [ ] Enforce HTTPS for production API base URLs and verify the API URL configured in each EAS environment. Permit HTTP only for an explicit local-development case.
- [ ] Review the current `npm audit --omit=dev` moderate findings (`glob`/`minimatch`, `node-forge`, and `uuid` via `exceljs`) and select updates compatible with this Expo SDK. Do not use `npm audit fix --force` without reviewing its proposed breaking downgrades.

Keep these items marked pending until their implementation or backend verification is recorded. Lint and typecheck passing does not close this security review.
