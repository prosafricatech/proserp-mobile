# Learning React Native by Building "ProsERP Mobile" — A Case Study Guide

**Goal:** learn React Native (RN) by building a real companion mobile app for ProsERP, instead of a toy to-do app. You already know React, hooks, `@tanstack/react-query`, Axios, and this codebase's domain (HR, Accounts, Organization, ProsControl). This guide maps that existing knowledge onto RN and gives you a concrete, staged roadmap using real ProsERP features as milestones.

This is a *learning path*, not a spec. Each phase names the RN concept to learn, why that ProsERP feature is a good vehicle for learning it, and the specific trap(s) this codebase will set for a mobile client.

---

## 0. The one architectural fact that changes everything

Before writing any RN code, understand how `live-repo` currently authenticates, because **your mobile app cannot use the same mechanism**:

- Login happens via NextAuth `CredentialsProvider` ([route.js](../src/app/api/auth/[...nextauth]/route.js)): it calls the real backend's `POST /login` with email/password, and the backend returns `{ authUser, authOrganization, token }` — a plain **bearer token**.
- NextAuth then wraps that bearer `token` inside a signed, `httpOnly` JWT **cookie** (`next-auth.session-token`).
- Every `/api/**` BFF route (e.g. [organizations/route.ts](../src/app/api/organizations/route.ts)) calls `getAuthHeaders(request)` ([apiUtils.ts:114](../src/lib/utils/apiUtils.ts#L114)), which reads that httpOnly cookie server-side via `getToken()`, pulls `accessToken` out of it, and only then sets `Authorization: Bearer <token>` + `X-OrganizationId: <org id>` on the outgoing request to the real backend.

A React Native app has no browser, so it never participates in that cookie session. **Calling `https://<prosERP-host>/api/organizations` from RN will always 401** — not a bug to debug, just the wrong target.

**The good news:** the real backend underneath is already a plain bearer-token REST API (`API_BASE_URL`, Laravel-shaped). That is exactly the auth style RN apps are built for. Your mobile app's correct architecture is:

```
RN app ──POST /login (email, password)──> API_BASE_URL directly
       <── { authUser, authOrganization, token } ──
RN app stores `token` in SecureStore/Keychain
RN app attaches on every request:
   Authorization: Bearer <token>
   X-OrganizationId: <authOrganization.organization.id>
```

i.e. you **re-implement `getAuthHeaders` client-side**, in RN, instead of going through the Next.js BFF at all. This is actually a more standard mobile pattern than what the web app does — the web app only needs the cookie dance because browsers can't be trusted to hold a raw bearer token safely in JS-accessible storage; RN's SecureStore/Keychain solves that problem natively. Decide this on day one and don't try to reuse `/api/**` — it will cost you more time than it saves.

(If later you *want* a BFF layer for mobile too — e.g. to hide `API_BASE_URL` or add server-side caching — that's a legitimate Phase-2 architecture exercise, not a Phase-0 requirement. Learn direct-to-backend first.)

---

## 1. Setup: what to install and why

| Choice | Pick | Why for a learner |
|---|---|---|
| Framework | **Expo (managed workflow)**, TypeScript template | Skips native Xcode/Android Studio config; `expo-secure-store`, `expo-notifications`, `expo-location`, camera etc. all ship as managed packages — you need several of these for ProsERP features below |
| Navigation | **React Navigation** (`@react-navigation/native` + stack + bottom-tabs) | The RN-world equivalent of Next.js's file-based App Router you already use in `live-repo`'s [src/app](../src/app) |
| Data fetching | **`@tanstack/react-query`** — same library already in [package.json](../package.json) | Zero new concepts: same `useQuery`/`useMutation`/`queryClient.invalidateQueries` you already use across every ProsERP module (e.g. `*-services.js` + React Query pattern seen in HR, Accounts) |
| HTTP client | **Axios** — same library already in use | You're already familiar with interceptor-based header injection from this codebase's `axios.create()` patterns ([auth route](../src/app/api/auth/[...nextauth]/route.js#L20)) — you'll write the same kind of interceptor, just attaching the SecureStore token instead of forwarding a cookie |
| UI kit | **React Native Paper** (Material Design, closest mental model to MUI) or **Tamagui** if you want more control | You already think in MUI (`sx`, `Autocomplete`, `DataGrid`); Paper's component names and theming API will feel familiar |
| Secure storage | **`expo-secure-store`** | Mobile equivalent of the httpOnly cookie — this is where the bearer token lives, never in plain AsyncStorage |

---

## 2. Core concept mapping (what transfers from `live-repo`, what doesn't)

| You already know (web/MUI) | RN equivalent | Note |
|---|---|---|
| `<div>`, `<span>`, CSS/`sx` | `<View>`, `<Text>`, `StyleSheet.create()` | **All layout is Flexbox, always** — no grid, no inline CSS, every bit of text must be inside `<Text>` |
| Next.js file-based routes (`src/app/**`) | React Navigation `Stack.Navigator` / `Tab.Navigator` screens | You define the navigation tree in code, not via folders |
| `JumboAuthProvider` ([JumboAuthProvider.tsx](../src/app/providers/JumboAuthProvider.tsx)) — context + `localStorage` + `checkPermission`/`checkOrganizationPermission`/`organizationHasSubscribed` | Same Context/reducer shape, but swap `localStorage.getItem('authData')` for `expo-secure-store`, and the whole thing becomes `async` (SecureStore reads are promises, `localStorage` reads aren't) | **Port this file's permission-check logic almost verbatim** — `checkPermission`, `hasOrganizationRole`, `organizationHasSubscribed` are pure functions over data already in the token/profile response; they don't care what storage backs them |
| MUI `Autocomplete` provider/debounced selectors | `FlatList`-backed custom dropdown, or a library like `react-native-paper`'s `Menu`/`Searchbar` combo | No native autocomplete widget; you build list+filter yourself |
| MUI `DataGrid` / list tables | `FlatList` or `SectionList` | No table component; pagination becomes `onEndReached` infinite-scroll, which is a *new* concept worth deliberately practicing |
| MUI `Dialog` | RN `Modal`, or a bottom-sheet library (`@gorhom/bottom-sheet`) | Bottom sheets are the mobile-native replacement for most "popup form" UX you're used to from web dialogs |
| Firebase Web Messaging (`getToken(messaging, …)` in `JumboAuthProvider.tsx:362`) | `expo-notifications` (push token registration + foreground/background handlers) | Same FCM backend concept, different client SDK; the backend's push-notification endpoints you've already seen across HR/Approvals should work unchanged once you send the Expo/FCM token the same way the web app sends its `fcm_token` |
| Browser `navigator.geolocation` ([JumboAuthProvider.tsx:344](../src/app/providers/JumboAuthProvider.tsx#L344)) | `expo-location` | Same idea, explicit runtime permission prompts are mandatory and more visible than on web |

---

## 3. Staged roadmap — build these in order

### Phase 1 — Auth shell (the hard, foundational part)
**RN concepts learned:** navigation guards, secure storage, Axios interceptors, async Context initialization, environment config per build.
**Build:** Login screen → `POST /login` directly against `API_BASE_URL` → store `{token, authUser, authOrganization}` in SecureStore → ported `AuthProvider` exposing `checkPermission`/`organizationHasSubscribed` → a protected navigator that redirects to Login when no token (mirrors `onlyAuthAccessData`/`onlyNotAuthAccessData` in [JumboAuthProvider.tsx:38-45](../src/app/providers/JumboAuthProvider.tsx#L38-L45)) → organization switcher calling the same `loadOrganization` concept ([organizationServices](../src/components/organizations/organizationServices.js) is your reference for the request shape).
**Trap to notice:** the backend expects `X-OrganizationId` on almost every authenticated call once an org is loaded — forgetting it is the RN equivalent of the bugs already documented in `docs/organization.md`'s "must be your loaded org" gate.

### Phase 2 — One read-only list + detail module
Pick something simple and self-contained to practice `FlatList`, pagination, pull-to-refresh, and a detail screen before tackling anything with forms. Good candidates, easiest first:
1. **Organization Users list** (simple, already understood from `docs/organization.md`) — list + tap-to-view profile.
2. **HR: Employee directory** — adds an avatar/photo field (`photo_path`), a good excuse to learn RN's `Image` + caching story (`expo-image`).

### Phase 3 — A real write flow with forms
**RN concepts learned:** forms without MUI (`react-hook-form` works unchanged in RN — same library, different input components), validation, optimistic mutation with React Query, offline-aware submission.
**Build: HR Leave Request** (from the MyHr self-service portal you already documented) — a form (leave type, date range, reason) that `POST`s and then shows up in a "My Requests" list with status (pending/approved/rejected), reusing the approval-chain `process_type` concept you already understand from `docs/human-resources.md` and `docs/accounts-and-finance.md`.
**Why this one:** it's CRUD-complete (create, list, status), has a natural second screen (approval detail) for later, and has zero destructive/financial risk if you get it wrong while learning.

### Phase 4 — The genuinely "mobile-native" feature
This is the one ProsERP feature that is *better built mobile-first than web*, and the best RN-specific learning milestone:
**Build: Attendance clock-in/out with GPS.**
- Learn `expo-location` foreground permission flow, one-shot position fetch, and (optionally) background location if you want to go further.
- Learn camera usage (`expo-camera` / `expo-image-picker`) if you want to add a selfie-punch, mirroring how field-workforce apps usually harden GPS clock-ins against spoofing.
- The web app already captures `latitude`/`longitude`/`geolocation_accuracy` as `TokenMetadata` ([JumboAuthProvider.tsx:48-53](../src/app/providers/JumboAuthProvider.tsx#L48-L53)) — this is your proof the backend already accepts this shape; you're not inventing a new API contract, just a new, better client for an existing one.

### Phase 5 — Push notifications end-to-end
**RN concepts learned:** `expo-notifications` registration, foreground vs background handling, deep-linking a tapped notification into a specific screen (React Navigation linking config).
**Build:** wire up the Approval inbox (the generic `process_type` approval-chain pattern spanning Imprest/Loans/Leave/Payroll/Procurement) so a pending-approval push opens directly to that request's detail/approve screen. This is the single feature that will teach you the most about RN navigation's deep-linking model, because you're navigating *from outside the app*, not from a button tap inside it.

### Phase 6 — Offline resilience (mobile concern with no web equivalent)
Web ProsERP has no offline story at all — mobile users will have one by default (elevators, field sites, poor connectivity), so this is a deliberately new skill, not a port of anything:
- React Query's persistence + `NetInfo`-based `onlineManager` to queue mutations (e.g. a leave request or attendance punch made offline) and auto-flush on reconnect.
- Decide, per feature, whether "offline-queued" is even safe (attendance punch: probably fine with a client timestamp; financial transactions: almost certainly not something to attempt offline — a good discussion point, not just a code exercise).

### Phase 7 — Build & release
**RN concepts learned:** EAS Build profiles, environment separation (`app.config.js` + EAS secrets as the RN analogue of `.env`/`NEXT_PUBLIC_*` split you already use), OTA updates via `expo-updates`, and basic store submission (even just internal/TestFlight distribution is enough to learn the pipeline).

---

## 4. Suggested order of real ProsERP modules to target, by learning value

| Order | Module | New RN skill it forces | Reuses from your existing ProsERP knowledge |
|---|---|---|---|
| 1 | Auth + Org switch | SecureStore, interceptors, nav guards | `JumboAuthProvider.tsx` logic, `organizationServices` |
| 2 | Org Users / HR Employee directory | `FlatList`, pagination, image caching | `docs/organization.md`, `docs/human-resources.md` masters |
| 3 | HR Leave Request | Forms (`react-hook-form`), mutations, status badges | Leave lifecycle + approval-chain pattern |
| 4 | Attendance clock-in | Location, camera, permission UX | Existing `TokenMetadata` geolocation contract |
| 5 | Approvals inbox | Push notifications, deep-linking | Cross-module `process_type` pattern (`docs/*.md` findings) |
| 6 | Payslip viewer (read-only) | PDF/file viewing (`expo-print`/`react-native-pdf`), file download to device storage | `docs/human-resources.md` Payroll Runs & Payslips section |

Deliberately **not** a good first mobile target: Ledgers/Journal Vouchers/Bank Reconciliation (`docs/accounts-and-finance.md`). They're dense multi-field forms with real financial consequences and the cancel-reverses-via-journal lifecycle — save them for after Phase 3–5 give you a solid RN forms/offline foundation; getting a financial transaction form wrong while still learning RN is a bad place to make mistakes.

---

## 5. Concrete pitfalls this specific backend will hand you

- **No cookie session on mobile** (§0) — budget real time for writing and testing the Axios interceptor + 401-refresh/logout flow; it's the one piece of plumbing every other screen depends on.
- **`X-OrganizationId` header** required once an org is loaded — same gate documented three separate times across the web app in `docs/organization.md`; port the check, don't rediscover the bug.
- **Permission catalog is two-tier** (`PERMISSIONS.*` org-level vs `PROS_CONTROL_PERMISSIONS.*` platform-level, per `docs/pros-control.md`) — a mobile app aimed at ordinary org users only ever needs the first tier; don't build ProsControl screens into a customer-facing mobile app.
- **`MODULES.*` subscription gating has no server-side route-level re-check on web** (noted across `docs/organization.md` and `docs/accounts-and-finance.md`) — don't assume the backend will reject a request just because a module isn't subscribed; you must replicate the same `organizationHasSubscribed()` client-side gate in RN, or risk shipping a mobile screen for a feature the org never licensed.
- **Two independent gross-to-net payroll formulas exist in the web codebase** (`docs/human-resources.md`) — if you ever build a payslip calculator client-side instead of just rendering what the API returns, pick one source of truth; don't invent a third.

---

## 6. How to actually use this guide

Don't try to read this top-to-bottom and then start coding. Build Phase 1, get it fully working against the real backend (even against a staging/sandbox org), then come back and read the next phase. Each phase is sized to be a single focused weekend-to-week project, not a sprint — the point is depth on each RN concept, not speed through the list.
