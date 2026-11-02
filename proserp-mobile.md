# ProsERP Mobile: Kitabu cha Maendeleo

> Kitabu chetu cha safari ya kujifunza React Native kwa kujenga ProsERP Mobile.
> Kila hatua tukiimaliza, inaongezwa hapa kama sura mpya: tulichojenga, kwa nini, na tulichojifunza njiani.
>
> - Mpango kamili wa safari: [react-native-learning-path.md](react-native-learning-path.md)
> - Web app tunayoiga: `/Users/willbardmloka/projects/live-repo` (branch `main`)

---

## Maendeleo kwa ufupi

| Hatua | Kazi | Hali | Tarehe | Sura |
|---|---|---|---|---|
| 1 | Auth Shell: login, signup, verify email, forgot/reset password, SecureStore, interceptors, org switch, theme ya web | ✅ Imekamilika | 2026-11-02 | [Sura ya 1](#sura-ya-1-phase-1--auth-shell) |
| 2 | App Shell: drawer menu yenye gating, dashboard kamili ya web, profile, notifications, organizations (orodha + create/edit) | ✅ Imekamilika | 2026-11-02 | [Sura ya 2](#sura-ya-2-hatua-2--app-shell) |
| 3 | UI Kits + Masters (currencies, units, banks, stakeholders, cost centers) | ⏳ Inayofuata | — | — |
| 4 | Process Approval: requisitions, approvals, retirements + push notifications | ⬜ | — | — |
| 5 | HR Self-Service (MyHr): leave, loans, contracts, payslips, imprest | ⬜ | — | — |
| 🚀 | **Release ya kwanza ya ndani** (TestFlight / Internal testing) | ⬜ | — | — |
| 6 | HR Management: employees, attendance, org chart, HR masters, dashboard | ⬜ | — | — |
| 7 | Payroll: periods, runs, approvals, PAYE, bank file, Excel export | ⬜ | — | — |
| 8 | Procurement & Supply: products, stores, POs, GRN (barcode), RFQs | ⬜ | — | — |
| 9 | Point of Sale: sales counter, receipts, proformas, outlets, price lists | ⬜ | — | — |
| 10 | Accounts & Finance: transactions, bills, invoices, ledgers, budgets, reports | ⬜ | — | — |
| 11 | Project Management: projects, claims, certificates, reports | ⬜ | — | — |
| 12 | Field Ops (offline-first): Fuel Station, Bio Production, Manufacturing | ⬜ | — | — |
| 13 | Assets, Asset Bookings, Files Shelf, SMS, Audit, Organization admin | ⬜ | — | — |
| 14 | Production release: EAS, OTA updates, crash reporting, App/Play Store | ⬜ | — | — |

---

## Yaliyomo

- [Muhtasari wa Siku ya 2026-11-02](#muhtasari-wa-siku-ya-2026-11-02)
- [Mpango Kazi: Kujenga ProsERP Mobile Kamili](#mpango-kazi-kujenga-proserp-mobile-kamili)
- [Sura ya 1: Phase 1 — Auth Shell](#sura-ya-1-phase-1--auth-shell)
- [Sura ya 2: Hatua 2 — App Shell](#sura-ya-2-hatua-2--app-shell)

---

## Muhtasari wa Siku ya 2026-11-02

> Siku ya kwanza ya mradi. Hapa ni picha nzima kwenye ukurasa mmoja; kila kipengele kina link ya maelezo ya kina.

### Safari ya siku, kwa mpangilio

1. **Msingi wa mradi:** Expo + TypeScript, React Navigation, Paper, React Query, Axios. App inaongea na **Laravel moja kwa moja** (`/login`, `/getuser`…), si kupitia BFF ya Next.js. Simu haiwezi kutumia cookie ya NextAuth. → [Sura 1 §0–5](#sura-ya-1-phase-1--auth-shell)
2. **Auth kamili kama web:** login, signup, verify email, forgot/reset password; token kwenye SecureStore; interceptor inaongeza `Authorization` + `X-OrganizationId`; login yenye muonekano wa web (NoirPro, rangi, en/sw). → Sura 1 §7–9, §15
3. **Mpango Kazi:** tulisoma live-repo yote (pages 125, mistari ~330k, routes ~900) na kupanga **Hatua 14** zinazojenga ProsERP yote huku ukijifunza RN. → [Mpango Kazi](#mpango-kazi-kujenga-proserp-mobile-kamili)
4. **App Shell (Hatua 2):** drawer yenye menu na gating ya web (`moduleRegistry`), dashboard, notifications, profile, organizations (orodha, create, edit). → [Sura 2](#sura-ya-2-hatua-2--app-shell)
5. **Full parity:** ulikataa form iliyoacha vitu na dashboard iliyobuni vitu, na kanuni ikazaliwa: *uwezo kamili kama web, muonekano tu ndio unabadilika.* → Mpango Kazi B3, Sura 2 §1
6. **Ulinganisho na web kwenye simu:** header (☰ ← ⟳ · 🌙 🔔 avatar), kiduara cha user, sidebar yenye search, Select za outlined, legend, pies za Highcharts na menyu ya ☰. → Sura 2 §3
7. **Usalama:** token kwenye DevTools, siri kwenye app (hakuna), BFF ya web dhidi ya simu, na **routes 6 za SMS za web zisizo na ukaguzi**. → Sura 1 §16, Mpango Kazi §D2
8. **Ubora wa code:** Prettier (`npm run format`), templates za PDF zimepangwa. → Sura 2 §8b

### Kanuni za mradi zilizowekwa leo

| Kanuni | Kwa nini |
|---|---|
| Web (`live-repo main`) ndiyo chanzo cha ukweli | Tunasoma component na BFF route kabla ya kujenga skrini |
| **Full parity:** kila field, setting na hatua ya process | Mtumiaji asihamie web kumaliza kazi |
| Hakuna kubuni vitu ambavyo web haina | Simu na web zifanane |
| Hakuna siri ndani ya app; Laravel inaidhinisha kila request | `EXPO_PUBLIC_*` inaonekana kwa kila mtu |
| Usiwe mkali kuliko web (k.m. 401 → kagua `/getuser` kwanza) | Kuepuka kumtoa mtumiaji nje bila sababu |
| Data za majaribio zifanane na za kweli (id za namba!) | Mock ya `'o1'` ilificha bug ya SecureStore |
| Usipush / usi-commit bila ruhusa | Repo ni ya `prosafricatech` |
| Code iliyopangwa (`npm run format`) | Developer mwingine aweze kusoma |
| Kila hatua inaandikwa kwenye kitabu hiki | Kitabu cha maendeleo |

### Masomo makubwa ya React Native ya leo

| Somo | Mahali |
|---|---|
| SecureStore dhidi ya cookie; async storage → "loading" status | Sura 1 §3, §7 |
| Axios interceptors (request + response) | Sura 1 §4 |
| Navigation guard kwa kusajili screens kulingana na status | Sura 1 §8 |
| `<View>`/`<Text>`, Flexbox, `StyleSheet`, `KeyboardAvoidingView` | Sura 1 §9 |
| react-hook-form + `Controller` + yup | Sura 1 §15 |
| `useMutation`, `useInfiniteQuery`, `invalidateQueries` | Sura 1 §15, Sura 2 §6 |
| Stale closure kwenye callbacks za async | Sura 1 §15 |
| Nested navigators (Drawer ndani ya Stack), `NavigatorScreenParams` | Sura 2 picha kubwa |
| Runtime permissions, `FormData` ya mafaili (simu dhidi ya web) | Sura 2 §6, §7 |
| Charts (gifted-charts), SVG text, `react-native-view-shot` | Sura 2 §3–4 |
| Hermes ≠ browser: polyfills za global (exceljs) | Sura 2 §9 |
| `Portal` ya Paper iko nje ya context ya Auth | Sura 2 §3 |
| Metro config, alias za modules, lazy `import()` | Sura 2 §9 |

### Hali halisi mwisho wa siku

| | |
|---|---|
| **Code** | Files 69 za TypeScript (~13,000 mistari). Typecheck safi, Prettier safi, expo-doctor 20/20 |
| **Imejaribiwa kwenye simu yako** | Login, SecureStore (id za namba), na kosa la exceljs/Hermes. Mengi mengine yamejaribiwa kwenye **mock** ya browser tu |
| **Ya kujaribu kwenye simu** | Tooltip ya pie, Excel/PDF share, picha ya profile, kuunda/kuhariri organization kwa account halisi, ku-load org → dashboard, mtumiaji asiye na org |
| **Inasubiri backend/web** | Maswali 8 (§G), hasa: kufuta tokens zilizovuja (12077, 12109, 12110), na routes za SMS |
| **Git** | `origin` imewekwa; **hakuna commit wala push** |
| **Inayofuata** | Hatua 3: ListScreen kit + Masters CRUD + Jest |

---

## Mpango Kazi: Kujenga ProsERP Mobile Kamili

> Uliandaliwa: 2026-11-02, baada ya kusoma live-repo `main` yote.
> Lengo: kujenga ProsERP yote kwenye simu, huku kila hatua ikikufundisha ujuzi mpya wa React Native.
> Mpango huu unachukua nafasi ya roadmap ya §3–4 ya [react-native-learning-path.md](react-native-learning-path.md). Sehemu nyingine za doc hiyo bado ni sahihi.

### A. Tulichogundua kwenye live-repo `main`

**Ukubwa wa kazi:** pages 125, mistari ~330,000 ya components, na BFF API routes ~900. Kuna modules 12 zinazolipiwa (`MODULES` kwenye `src/utilities/constants/modules.ts`), pamoja na ProsControl (admin wa jukwaa).

| Module | Pages | Mistari ya web | API routes | Thamani kwenye simu |
|---|---|---|---|---|
| Human Resources (pamoja na Payroll, MyHr) | 23 | 64,663 | ~247 | ⭐⭐⭐ self-service, approvals |
| Project Management | 6 | 35,048 | ~85 | ⭐⭐ ufuatiliaji wa site |
| Accounts & Finance | 14 | 33,089 | ~123 | ⭐⭐ kuangalia, kulipa, invoices |
| Procurement & Supply | 10 | 32,400 | ~70 | ⭐⭐⭐ GRN kwa barcode, stock |
| Point of Sale | 6 | 27,781 | ~60 | ⭐⭐⭐ kuuza kwa simu |
| Process Approval | 4 | 22,755 | ~25 | ⭐⭐⭐ ku-approve popote |
| Fuel Station | 5 | 22,371 | ~24 | ⭐⭐⭐ dippings, shifts (field) |
| Manufacturing | 3 | 11,185 | ~17 | ⭐⭐ batches |
| Bio Production | 13 | 7,712 | ~15 | ⭐⭐⭐ rekodi za kila siku shambani |
| Masters (currencies, units, banks, stakeholders) | 5 | 7,004 + 5,023 | ~77 | ⭐ zinahitajika na forms zote |
| Organizations | 4 | 6,942 | ~22 | ⭐⭐ |
| Dashboard | 1 | 6,390 | — | ⭐⭐⭐ |
| Assets + Asset Bookings | 5 | 4,951 | ~26 | ⭐⭐ QR scan, kalenda |
| Files Shelf, SMS, Audit, Access Control | 5 | ~4,000 | ~20 | ⭐ |
| ProsControl (admin wa jukwaa) | 8 | 7,288 | ~45 | ✖ si ya app ya wateja |

**Mambo 7 muhimu yaliyogunduliwa:**

1. **Process Approval ni mshipa wa mfumo mzima.** `PROCESS_TYPES` (`src/utilities/constants/processTypes.ts`) zinaunganisha modules: PURCHASE, PAYMENT, IMPREST, IMPREST RETIREMENT, LEAVE REQUEST, PAYROLL, LOAN, SUBCONTRACT CERTIFICATE, PROJECT PAYMENT CLAIM, STOCK ADJUSTMENT. Ndiyo maana inajengwa mapema (Hatua 4).
2. **Gating ya menu imeandikwa kwa mkono** ndani ya `src/components/sidebar/Sidebar.js` (`if (organizationHasSubscribed(...))`, `checkOrganizationPermission(...)`). Kwenye mobile tutaifanya **declarative**: kila item ya menu itataja `module` + `permissions` zake, na function moja itachuja.
3. **Attendance haina GPS clock-in.** Backend inahifadhi rekodi za HR (`date`, `type`, `hours_worked`). Geolocation iliyopo kwenye `JumboAuthProvider` ni metadata ya login tu. Kwa hiyo Phase 4 ya learning path (GPS clock-in) **inahitaji endpoint mpya kutoka backend**.
4. **VFD** (`src/components/vfd/VFDProvider.jsx`) ni pole display ya POS inayotumia Web Serial API, ambayo haipo kwenye simu. Mbadala wa baadaye ni Bluetooth.
5. **Masters zinahitajika na kila form**: stakeholders, products, stores, ledgers, currencies, measurement units, cost centers. Zinajengwa kwanza (Hatua 3) kama "selectors" zinazotumika kila mahali.
6. **Folder ya `docs/*.md`** inayotajwa kwenye learning path haipo kwenye `main`.
7. **Libraries nyingi za web hazifanyi kazi kwenye RN** (tazama jedwali C).

### B. Kanuni za mpango

1. **Kila hatua = kazi halisi + ujuzi mmoja mpya wa RN.** Hujifunzi kwa mazoezi ya kubuni, unajifunza kwa kujenga ProsERP.
2. **Vifaa (kits) kwanza, modules baadaye.** Hatua 2–3 zinajenga misingi (navigation, ListScreen, FormKit). Baada ya hapo, kila module mpya ni ~70% kutumia kits na ~30% mantiki yake. Kasi itaongezeka kadri tunavyoendelea.
3. **Uwezo kamili, muonekano wa simu (full parity).** Kila kitu kinachowezekana kwenye web kinawezekana kwenye simu: kila field, kila setting, kila hatua ya process. Mtumiaji hapaswi kuhamia web ili kumaliza kazi aliyoianza kwenye simu. **Kinachobadilika ni muonekano tu:** jedwali refu linakuwa kadi + detail screen, dialog inakuwa bottom sheet au screen, `<input type="color">` inakuwa ColorField. **Hakuna kubuni vitu ambavyo web haina, wala kuacha vilivyopo.** (Kanuni hii iliwekwa 2026-11-02 baada ya form ya organization kuacha logo/branding/settings, na dashboard kuongeza vitu visivyokuwepo web.)
4. **Dependencies kwanza.** Masters kabla ya forms zinazozichagua; Approvals kabla ya modules zinazotuma maombi kwenye approvals.
5. **Kila hatua inaisha na:** `tsc` safi, majaribio kwenye simu halisi dhidi ya `dev-api`, na **sura mpya kwenye kitabu hiki**.
6. **Web ndiyo chanzo cha ukweli.** Kabla ya kila skrini tunasoma component na BFF route husika kwenye `live-repo main`, ili kupata endpoint, request shape, na business rules halisi.

### C. Web libraries → mbadala wa React Native

| Kazi | Web (live-repo) | React Native | Hatua |
|---|---|---|---|
| UI | MUI | React Native Paper | 1 ✅ |
| Navigation ya menu | Sidebar ya Jumbo | `@react-navigation/drawer` | 2 |
| Charts | Highcharts, Recharts, MUI X Charts | `react-native-gifted-charts` | 2 |
| Orodha ndefu | JumboList / DataGrid | `FlatList` → `@shopify/flash-list` | 3 |
| Date pickers | MUI X Date Pickers | `react-native-paper-dates` | 3 |
| Popups | MUI Dialog, sweetalert2 | `@gorhom/bottom-sheet`, Paper `Dialog` | 3 |
| Notifications za ndani | notistack | Paper `Snackbar` | 3 |
| Namba za fedha | react-number-format | `Intl.NumberFormat` + masked input | 3 |
| PDF (kutengeneza) | `@react-pdf/renderer` | `expo-print` (HTML → PDF) + `expo-sharing` | 4 |
| Push notifications | Firebase web messaging | `expo-notifications` | 4 |
| Excel | exceljs | exceljs + `expo-file-system` + `expo-sharing` | 7 |
| Barcode / QR | — / qrcode | `expo-camera` (scanner), `react-native-qrcode-svg` | 8 |
| Kalenda | react-big-calendar | `react-native-calendars` | 13 |
| Kupakia mafaili | react-dropzone | `expo-document-picker`, `expo-image-picker` | 13 |
| Rich text | CKEditor, TipTap, EditorJS | Kuonyesha kwa WebView / maandishi ya kawaida | 13 |
| Ramani | Google Maps | `react-native-maps` (ikihitajika) | — |
| Org chart (tree) | MUI X Tree View | Tree component ya kujenga wenyewe | 6 |
| Offline | (hakuna) | React Query persist + NetInfo + mutation queue | 9, 12 |

### D. Muundo wa code utakaokua nasi

```
src/
├── api/                 ← client, tokenStorage (tayari)
├── auth/                ← AuthProvider, permissions (tayari)
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AppDrawer.tsx    ← drawer inayojengwa kutoka moduleRegistry
│   └── moduleRegistry.ts← menu ya declarative: { module, permissions, screen }
├── components/          ← kits za pamoja: ListScreen, FormKit, selectors, PDF, charts
├── modules/
│   ├── masters/         ← kila module: api/, screens/, components/, types.ts
│   ├── processApproval/
│   ├── humanResources/
│   ├── procurement/
│   ├── pos/
│   ├── accounts/
│   └── ...
├── i18n/                ← dictionaries zinazonakiliwa kutoka live-repo kwa script
└── theme/               ← (tayari)
```

`moduleRegistry.ts` ndiyo mbadala wa `menu-items.tsx` + `Sidebar.js`. Mfano:

```ts
{
  label: 'requisitions',
  module: MODULES.PROCESS_APPROVAL,
  permissions: [PERMISSIONS.REQUISITIONS_CREATE, PERMISSIONS.REQUISITIONS_READ],
  screen: 'Requisitions',
}
```

### D2. Usalama: BFF ya web dhidi ya app ya simu

Kwenye web, simu haiwezi kuiga `src/app/api/**` (BFF ya Next.js): **app ya simu haina "server side"**. Kila kitu kilicho ndani ya app kiko kwenye simu ya mtumiaji. Kwa hiyo swali ni: BFF ya web inalinda nini hasa, na simu inafanyaje?

| BFF ya web inafanya | Kwa nini | Kwenye simu |
|---|---|---|
| Inashika bearer token ndani ya **httpOnly cookie** | JavaScript ya browser isiweze kuisoma (XSS) | **SecureStore** (Keychain/Keystore). Simu haina XSS ya browser |
| Inaficha `API_BASE_URL` | Browser inaona `/api/...` tu | **Si kinga ya usalama.** Mtu mwenye session anaweza kuita `/api/...` za web ambazo zinafanya kazi zilezile. Ulinzi halisi ni **backend (Laravel)** kukagua token na permissions kwa kila request |
| Inashika **siri za server**: `NEXTAUTH_SECRET`, `SMS_USERNAME`/`SMS_PASSWORD` za NextSMS | Siri hizi zisifike kwa mteja | **Haziwekwi kwenye app kamwe.** App ina `EXPO_PUBLIC_API_BASE_URL` tu (imethibitishwa). Feature inayohitaji siri inapita kwenye backend |
| Inafanya kazi za server (Excel ndani ya Next routes) | Urahisi | Inafanyika kwenye simu (`exceljs`), kwa sababu haihitaji siri |

📌 **Kanuni za mradi:**
1. **Hakuna siri ndani ya app.** Chochote chenye `EXPO_PUBLIC_` kinaonekana na yeyote aliyepakua app.
2. **Kila request inaidhinishwa na Laravel.** Gating ya menu au skrini kwenye simu ni kwa muonekano tu, si ulinzi.
3. **Huduma za nje zenye credentials** (NextSMS, n.k.) zinaitwa na backend, si na simu.
4. Ikihitajika baadaye: **mobile BFF / API gateway** (kwa rate limiting, kuficha topology ya ndani, au kuhakikisha request inatoka kwenye app halali kupitia Play Integrity / App Attest). Hii ni Hatua 14, si ya sasa.

⚠️ **Ugunduzi kwenye web (wa kupeleka kwa timu ya web):** `src/proxy.ts` inaacha `/api` yote nje ya ukaguzi wa login (kwa sababu ya uploads kubwa), kwa hiyo kila route lazima ijikague yenyewe. Routes 6 za `src/app/api/prosControl/sms/*` (`send-single`, `send-multi-users`, `send-multi-messages`, `balance`, `logs`, `delivery-report`) **hazikagui session wala permission**, lakini zinatumia username/password ya NextSMS ya kampuni (`smsUtils.getSmsHeaders()`). Kwa jinsi code ilivyo, mtu yeyote anayejua URL anaweza kutuma SMS kwa gharama ya kampuni au kusoma logs, bila kuingia. (Imethibitishwa kwa kusoma code ya `main` tu; **haijajaribiwa** dhidi ya server.) Suluhisho: kila route ya SMS iite `getAuthHeaders(req)` na ikague permission ya ProsControl kabla ya kutumia credentials.

### E. Hatua kwa undani

Ukubwa: **S** = siku chache · **M** = wiki ~1 · **L** = wiki 2–3 · **XL** = mwezi+. Ni makadirio ya kujifunza huku tukijenga, si ahadi.

#### Hatua 2 — App Shell (M)
- **Tutajenga:** drawer menu inayojengwa kutoka `moduleRegistry` (inachuja kwa `organizationHasSubscribed` + `checkOrganizationPermission`); kichwa cha drawer chenye user + org switcher; Dashboard yenye kadi za modules (HR, Accounts, POS, Procurement, Fuel); Profile (photo, change password); Notifications list; **kuunda organization** (mtumiaji mpya wa signup hana org yoyote, na bila hili hawezi kuendelea zaidi ya skrini ya "Choose organization").
- **Ujuzi wa RN:** nested navigators (Drawer ndani ya Stack), `react-native-reanimated` + `gesture-handler`, charts za kwanza, `expo-image` kwa avatars.
- **Web ya kusoma:** `src/utilities/constants/menu-items.tsx`, `src/components/sidebar/Sidebar.js`, `src/components/dashboard/`, `src/components/profile/`, `src/components/notifications/`.

#### Hatua 3 — UI Kits + Masters (L)
- **Tutajenga kits:**
  - `ListScreen`: `useInfiniteQuery` + FlatList + search yenye debounce + filters kwenye bottom sheet + pull-to-refresh + empty/error states.
  - `FormKit`: TextField, NumberField, MoneyField, DateField, Select, AsyncAutocomplete (selector inayotafuta kwenye server), Switch, inayotumia `react-hook-form` + `yup` (kama web).
  - `ConfirmDialog`, `Snackbar`, `DetailScreen` pattern.
  - Selectors za pamoja: `StakeholderSelector`, `CurrencySelector`, `UnitSelector`, `CostCenterSelector`.
- **Tutazitumia kwenye Masters:** currencies, measurement units, banks, stakeholders + groups, cost centers (CRUD kamili).
- **Ujuzi wa RN:** `useInfiniteQuery` + `onEndReached`, bottom sheets, mutations + `invalidateQueries`, optimistic updates, **Jest + React Native Testing Library** (tests za kwanza: `permissions.ts`, `color.ts`).
- **Web ya kusoma:** `@jumbo/components/JumboList/`, `@jumbo/vendors/react-hook-form/`, `src/components/masters/`, `src/components/sharedComponents/`.

#### Hatua 4 — Process Approval + Push Notifications (L)
- **Tutajenga:** Requisitions (zangu / zinazosubiri mimi), detail ya requisition, kuunda requisition (product items + ledger items + vendors + additional costs), **approve / reject kwa comment**, Retirements, Approved requisitions (read), Approval chains (read), PDF ya requisition (share).
- **Push notifications (Phase 5 ya learning path):** usajili wa token, kutuma `fcm_token` kupitia `update-authTokenMetadata`, kubofya notification kunafungua requisition husika (deep linking).
- **Ujuzi wa RN:** `useFieldArray` (rows zinazoongezeka), deep linking config, `expo-notifications`, `expo-print` + `expo-sharing`.
- **Web ya kusoma:** `src/components/processApproval/` (yote), `src/utilities/constants/processTypes.ts`.

#### Hatua 5 — HR Self-Service / MyHr (M)
- **Tutajenga:** account statement, contracts, imprest accounts, maombi yangu ya likizo (Phase 3 ya learning path), maombi ya mkopo, payslips (PDF).
- **Ujuzi wa RN:** top tabs (`@react-navigation/material-top-tabs`), date range picker, kuonyesha PDF.
- **Web ya kusoma:** `src/components/humanResources/myHr/`, `leaveRequests` (ndani ya HR), `loanRequests/`.

#### 🚀 Release ya kwanza ya ndani
Baada ya Hatua 5, app inakuwa na thamani halisi (approvals + self-service). Tunajifunza **EAS Build** na kugawa kwa watumiaji wachache kupitia TestFlight / Play Internal Testing ili kupata maoni mapema.

#### Hatua 6 — HR Management (L)
- **Tutajenga:** Employees directory + profile yenye sections (`employeeProfileSections`), Attendance (kuingiza rekodi kama web), Org chart, usimamizi wa leave/loan requests, HR dashboard, HR masters (departments, designations, public holidays, leave types, allowance/deduction/overtime/employer-contribution types).
- **GPS clock-in:** ikiwa backend itaongeza endpoint, tunaijenga hapa (`expo-location` + `expo-camera` selfie).
- **Ujuzi wa RN:** sections ndefu za profile (`SectionList`), tree view ya kujenga wenyewe, permissions za runtime (location/camera).
- **Web ya kusoma:** `src/components/humanResources/` (isipokuwa payroll).

#### Hatua 7 — Payroll (L)
- **Tutajenga:** payroll periods, payroll runs (kuangalia, ku-approve), PAYE tax bands, bank file, payroll report.
- **Ujuzi wa RN:** kuonyesha data pana kwenye skrini ndogo (summary cards + horizontal scroll), **Excel export** kwenye simu.
- **Web ya kusoma:** `payrollPeriods/`, `payrollRuns/`, `payeTaxBands/`, `bankFile/`, `src/lib/excel/exporters/payroll.tsx`.
- ⚠️ Web ina formula mbili za gross-to-net; tunaonyesha kile API inarudisha, **hatuhesabu upya** kwenye app.

#### Hatua 8 — Procurement & Supply (XL)
- **Tutajenga:** products + categories, stores + stock levels, purchase orders, **GRN (kupokea mzigo) kwa barcode scanning**, consumptions, inventory transfer, stock adjustment, RFQs, approved purchases, reports.
- **Ujuzi wa RN:** `expo-camera` barcode scanner, forms ngumu zenye items nyingi, performance ya orodha kubwa (FlashList).
- **Web ya kusoma:** `src/components/procurement/`, `src/components/productAndServices/`, `src/components/shared/pickers/`.

#### Hatua 9 — Point of Sale (XL)
- **Tutajenga:** sales counter (cart, quick add, barcode, malipo), sale receipt (PDF / share; printer ya Bluetooth baadaye), proformas, delivery notes, outlets, price lists, POS settings, reports.
- **Offline (mwanzo wa Phase 6 ya learning path):** mauzo yanaweza kuhifadhiwa bila mtandao na kutumwa yakirudi, ikiwa backend inaruhusu.
- **Ujuzi wa RN:** `useMemo`/`React.memo` kwa performance, React Query persist + NetInfo, mutation queue.
- **Web ya kusoma:** `src/components/pos/` (hasa `counter/`).

#### Hatua 10 — Accounts & Finance (XL)
- **Tutajenga:** transactions, approved payments / payroll / loans (kulipa), supplier bills, customer invoices (+ PDF), ledgers, ledger groups, user ledgers, budgets, recurring transactions, financial reports (income statement, ledger statement, AP/AR aging, debtors/creditors) kwa kusoma + Excel, bank reconciliation (layout ya tablet).
- **Ujuzi wa RN:** layouts za tablet (`useWindowDimensions`), kuonyesha reports za fedha, `Intl` kwa fedha.
- ⚠️ Ni module ya hatari kubwa: forms za fedha zinajengwa baada ya kits na approvals kukomaa (kama learning path §4 inavyoshauri).
- **Web ya kusoma:** `src/components/accounts/`, `src/lib/excel/exporters/`.

#### Hatua 11 — Project Management (L)
- **Tutajenga:** projects list + detail (tabs: WBS, budgets, claims, inventory), project categories, payment claims + subcontract certificates (zinaingia kwenye approvals), reports.
- **Ujuzi wa RN:** detail screens zenye tabs nyingi, kutumia upya kila kit tulichojenga.
- **Web ya kusoma:** `src/components/projectManagement/`.

#### Hatua 12 — Field Operations, offline-first (XL)
- **Tutajenga:**
  - **Fuel Station:** sales shifts, dippings, stations, price lists, reports.
  - **Bio Production:** daily rounds (feeding, mortality, weights, costs, harvests, produce, measurements), batches, farms, production units, species templates, measurement parameters, dashboard.
  - **Manufacturing:** batches, BOMs, reports.
- **Ujuzi wa RN:** **offline-first kamili** (Phase 6 ya learning path): data inaingizwa shambani/kituoni bila mtandao, inapangwa kwenye foleni, na ina-sync ikirudi. Pia jinsi ya kushughulikia migongano (conflicts).
- **Web ya kusoma:** `src/components/fuelStation/`, `src/components/bioProduction/`, `src/components/production/`.

#### Hatua 13 — Assets, Bookings, Tools, Organization admin (L)
- **Tutajenga:** asset register (QR labels + scan), depreciation runs, GL mappings, asset reports; asset bookings kwenye kalenda; Files Shelf (kupakia, kuonyesha); SMS; audit trail; access control reports; invitations; organization edit / profile / roles / users / subscriptions (kuunda org kumehamia Hatua 2).
- **Ujuzi wa RN:** multipart uploads + progress, kalenda, QR generation.
- **Web ya kusoma:** `src/components/assets/`, `assetBookings/`, `filesShelf/`, `sms/`, `audits/`, `organizations/`, `invitations/`.

#### Hatua 14 — Production release (M)
- **Tutajenga:** EAS build profiles (dev / staging / production) na env tofauti, OTA updates (`expo-updates`), crash reporting (Sentry), app icons + splash za ProsERP, kuwasilisha App Store + Play Store.

### F. Kisichojengwa kwenye simu (kwa sasa)

| Kipengele | Sababu |
|---|---|
| ProsControl (prosAfricans, subscriptions, troubleshooting, bulk imports, nextSMS…) | Ni admin wa jukwaa, si wa wateja (learning path §5). Kinabaki kwenye web. |
| VFD pole display | Inatumia Web Serial API. Inaweza kurudi kama Bluetooth baadaye. |
| Rich text editing (CKEditor / TipTap / EditorJS) | Tunaonyesha tu; kuhariri kunabaki web. |
| Drag & drop (`@dnd-kit`) | Tunatumia vitufe vya juu/chini badala yake. |

### G. Maswali kwa timu ya backend

1. **GPS clock-in:** je, kuna mpango wa endpoint ya attendance ya kujiandikisha mwenyewe (lat/long/accuracy + picha)?
2. **Push tokens:** `update-authTokenMetadata` inakubali `fcm_token`. Je, inafanya kazi na FCM token ya Android/iOS native (si ya web)? iOS inahitaji APNs kupitia FCM.
3. **Logout:** kuna endpoint ya kufuta (revoke) token? Kwa sasa token inabaki valid mpaka i-expire.
4. **Offline:** kwa POS na Field Ops, je, backend inakubali `client_reference` / idempotency key ili mauzo yaliyotumwa mara mbili yasirudiwe?
5. **Token lifetime:** token inadumu muda gani, na kuna refresh token? Tokens ni za Laravel Sanctum (`12077|…`); default ya Sanctum ni token **isiyo-expire kamwe** isipokuwa `sanctum.expiration` imewekwa.
6. **Reset password errors:** `POST /reset-password` yenye email/token isiyo sahihi inarudisha **500** `{"message": …}`. Inapaswa kuwa **422** yenye `errors`, ili app ijue ni field ipi ina kosa. (`/register` nayo inatumia `validation_errors` badala ya `errors` kama endpoints nyingine.)
7. **Kufuta tokens zilizovuja:** tokens za dev `id 12077`, `12109` na `12110` zilionekana kwenye screenshots au mazungumzo wakati wa kujifunza (2026-11-02). Zifutwe kwenye `personal_access_tokens`.
8. **(Web) SMS routes bila ukaguzi:** tazama §D2. Routes 6 za `/api/prosControl/sms/*` zinatumia credentials za NextSMS bila kukagua session wala permission.

---


## Sura ya 1: Phase 1 — Auth Shell

> Imekamilika: 2026-11-02. Login imethibitishwa kufanya kazi dhidi ya `dev-api.proserp.co.tz`.
> Maelezo ya kila kitu kilichofanyika baada ya ku-install Expo, kwa mpangilio ambao data inapita kwenye app. Fungua kila faili husika pembeni unaposoma.

### Picha kubwa kwanza

```
App.tsx  (inafunga providers zote)
  └─ AppThemeProvider     → rangi, fonts, light/dark
     └─ AuthProvider      → nani ame-login? org gani?
        └─ NavigationContainer
           └─ RootNavigator → inachagua screen kulingana na auth status
                ├─ LoginScreen
                ├─ OrganizationsScreen
                └─ HomeScreen

Screen → authApi → client.ts (axios + interceptor) → dev-api.proserp.co.tz
                                   ↑
                         token kutoka tokenStorage (SecureStore)
```

Kanuni moja ya kukumbuka: **screens hazijui chochote kuhusu tokens wala headers.** Zinaita tu `useAuth()` au `authApi`. Plumbing yote iko chini yake.

#### Muundo wa folders

```
proserp-mobile/
├── App.tsx                     ← root: fonts + providers
├── .env.local                  ← EXPO_PUBLIC_API_BASE_URL (haiko kwenye git)
├── .env.example                ← mfano wa .env.local
├── assets/
│   ├── fonts/NoirPro-*.ttf     ← font ya web, imegeuzwa kutoka .woff
│   └── images/proserp-*.png    ← logos kutoka live-repo
└── src/
    ├── config/env.ts           ← kusoma env variables
    ├── api/
    │   ├── tokenStorage.ts     ← SecureStore (token + org id)
    │   ├── client.ts           ← axios instance + interceptors
    │   └── authApi.ts          ← endpoints za auth/org
    ├── auth/
    │   ├── types.ts            ← TypeScript types za user/org
    │   ├── permissions.ts      ← checkPermission n.k. (pure functions)
    │   ├── validation.ts       ← yup schemas (sheria za web) + parseResetLink
    │   ├── serverErrors.ts     ← makosa ya Laravel → chini ya field
    │   └── AuthProvider.tsx    ← auth state + signIn/signOut/loadOrganization
    ├── navigation/
    │   └── RootNavigator.tsx   ← navigation guard
    ├── components/auth/        ← kits: AuthLayout, AuthTextField, GradientButton, AuthLinks
    ├── screens/
    │   ├── auth/               ← Login, Signup, ForgotPassword, ResetPassword, VerifyEmail
    │   ├── OrganizationsScreen.tsx
    │   └── HomeScreen.tsx
    ├── theme/
    │   ├── palette.ts          ← rangi za web (light + dark)
    │   ├── color.ts            ← lighten/darken kama MUI
    │   └── ThemeProvider.tsx   ← Paper + Navigation themes
    └── i18n/index.ts           ← maandishi ya en/sw
```

---

### 1. Packages zilizoongezwa (na kwa nini)

| Package | Kazi yake | Sawa na nini kwenye web |
|---|---|---|
| `expo-secure-store` | Kuhifadhi token kwa usalama (iOS Keychain / Android Keystore) | httpOnly cookie ya NextAuth |
| `@react-navigation/native` + `native-stack` | Kuhama kati ya screens | App Router (`src/app/**`) |
| `react-native-screens`, `react-native-safe-area-context` | Dependencies za navigation: screens za native, na kuepuka notch | — |
| `react-native-paper` | UI components (TextInput, Button, List…) | MUI |
| `@expo/vector-icons` | Icons za Paper | `@mui/icons-material` |
| `@tanstack/react-query`, `axios`, `react-hook-form` | Data fetching, HTTP, forms | **Zilezile** unazojua tayari |
| `expo-linear-gradient` | Gradients | CSS `linear-gradient()` (RN haina CSS) |
| `expo-font` | Kupakia NoirPro | `@font-face` |
| `expo-localization` | Lugha ya simu (en/sw) | `/[lang]/` kwenye URL |
| `react-dom`, `react-native-web` | Kuendesha app kwenye browser (preview tu) | — |
| `yup`, `@hookform/resolvers` | Validation ya forms | **Zilezile** za web |

📌 **Somo:** Tumia `npx expo install <package>`, si `npm install`. `expo install` inachagua version inayoendana na Expo SDK yako. Ukitumia `npm install` kwa packages za native, unaweza kupata version isiyoendana, na app ita-crash.

---

### 2. [src/config/env.ts](src/config/env.ts): environment variables

```ts
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
```

- Expo inasoma `.env.local` na kuweka kila variable inayoanza na `EXPO_PUBLIC_` **ndani ya JS bundle** wakati wa build. Ni kama `NEXT_PUBLIC_*`.
- ⚠️ Kwa hiyo **siri haziwekwi hapa**. Ndiyo sababu `NEXTAUTH_SECRET` na SMS password hazikuhamishwa kutoka live-repo: mtu yeyote anaweza kuzitoa kwenye app iliyo-install.
- Ukibadilisha `.env.local`, lazima u-restart na `npx expo start -c` (`-c` = clear cache).

Kilichohamishwa kutoka `live-repo/.env.local`:

| live-repo | proserp-mobile | Sababu |
|---|---|---|
| `API_BASE_URL` | `EXPO_PUBLIC_API_BASE_URL` | App inaita backend moja kwa moja |
| `NEXTAUTH_SECRET`, `SMS_*` | ❌ | Ni siri; ni za server tu |
| `NEXTAUTH_URL`, `NODE_ENV` | ❌ | Ni za Next.js tu |
| `NEXT_PUBLIC_FIREBASE_*` | ❌ (kwa sasa) | Ni za web; mobile itatumia `google-services.json` kwenye Phase 5 |

---

### 3. [src/api/tokenStorage.ts](src/api/tokenStorage.ts): mahali token inakaa

```ts
SecureStore.setItemAsync('proserp.token', token)
```

Tofauti kubwa na web:

- `localStorage.getItem()` ni **synchronous**, wakati `SecureStore.getItemAsync()` ni **async** (inarudisha Promise). Hilo ndilo linalolazimisha "loading state" wakati app inafunguka (utaliona kwenye AuthProvider).
- Tunahifadhi **vitu viwili tu**: token na organizationId. Data za user (`authUser`) ni kubwa (permissions nyingi), na SecureStore haipendi values kubwa (~2KB). Kwa hiyo app ikifunguka, tunaita `GET /getuser` kuzipata upya, kama `refreshAuth()` ya web.
- Kwenye web preview, SecureStore haipo, kwa hiyo token inakaa **kwenye memory tu** (`Platform.OS === 'web'`). Tazama §16 kwa nini si `localStorage`. Kwenye simu, SecureStore inatumika kila mara.

---

### 4. [src/api/client.ts](src/api/client.ts): moyo wa networking ❤️

Hii ndiyo **mbadala wa `getAuthHeaders()`** ya live-repo (`src/lib/utils/apiUtils.ts`).

- **Web:** Browser → `/api/organizations` (Next.js) → server inasoma cookie → inaongeza `Authorization` → backend.
- **Mobile:** App → **moja kwa moja** backend, tukiongeza headers wenyewe.

```ts
api.interceptors.request.use((config) => {
  if (session.token) config.headers.Authorization = `Bearer ${session.token}`;
  if (session.organizationId) config.headers['X-OrganizationId'] = session.organizationId;
  return config;
});
```

- **Request interceptor:** inaendeshwa kabla ya *kila* request, kwa hiyo hakuna screen inayohitaji kukumbuka headers.
- `session` ni object iliyo kwenye memory. Hatusomi SecureStore kila request (ni polepole, na ni async).
- **Response interceptor:** ikija 401 *na tulikuwa tumetuma token*, maana yake token ime-expire, kwa hiyo tuna-logout. Kwenye `/login` hatutumi token, kwa hiyo 401 pale ni "password si sahihi" tu (backend inarudisha `401 {"message":"Invalid Credentials"}`), si logout.
- `setUnauthorizedHandler`: `client.ts` haiwezi ku-import `AuthProvider` (ingeleta circular import), kwa hiyo AuthProvider inajisajili kama handler. Ni pattern ya kawaida.
- `getErrorMessage`: inasoma errors za Laravel (`{ message }` au `{ errors: { field: [...] } }`). Kwenye dev (`__DEV__`), ikiwa hakuna response kabisa, inaonyesha sababu halisi (`ERR_NETWORK`, `ECONNABORTED`…) pamoja na URL, ili debugging iwe rahisi.

---

### 5. [src/api/authApi.ts](src/api/authApi.ts): endpoints

Zilipatikana kwa kusoma BFF routes za live-repo `main`. Kila `/api/...` ya web ni proxy tu ya endpoint ya backend:

| Web BFF | Backend tunayoita moja kwa moja |
|---|---|
| NextAuth `authorize()` | `POST /login` |
| `/api/auth/getuser` | `GET /getuser` |
| `/api/organizations` | `GET /organizations` |
| `/api/organizations/[id]/load` | `PUT /organizations/{id}/load` |

⚠️ **Ugunduzi muhimu:** `PUT /organizations/{id}/load` inarudisha **token mpya**. Web inaiweka kwenye cookie bila wewe kuona. Sisi lazima tuibadilishe kwenye SecureStore, la sivyo requests zinazofuata zitatumia token ya org ya zamani.

Majibu ya backend (Laravel):
- Login: `{ token, authUser, authOrganization }`
- Orodha: `{ data: [...], total, current_page, last_page }`

---

### 6. [src/auth/permissions.ts](src/auth/permissions.ts) + [src/auth/types.ts](src/auth/types.ts)

`checkPermission`, `checkOrganizationPermission`, `hasOrganizationRole`, `organizationHasSubscribed`, na `moduleSetting` zimetolewa kwenye `JumboAuthProvider.tsx` na kugeuzwa kuwa **pure functions** (input → output, hakuna hooks). Faida:

- Unaweza kuzi-test bila React.
- AuthProvider inazifunga tu na state ya sasa.

⚠️ Kumbuka: backend **haikatai** request kwa sababu org haija-subscribe module. Kwa hiyo kila screen ya module (Phase 2+) lazima ilindwe na `organizationHasSubscribed()` upande wa app.

---

### 7. [src/auth/AuthProvider.tsx](src/auth/AuthProvider.tsx): ubongo wa auth

Ina **status** nne badala ya `isLoading` + `isAuthenticated`:

```
'loading'   → app inafunguka, tunasoma SecureStore
'signedOut' → hakuna token
'signedIn'  → tuna user (na labda org)
'bootError' → token ipo lakini hakuna mtandao
```

#### Boot flow (app inafunguka)

1. Soma token kutoka SecureStore.
2. Hakuna token? → `signedOut`.
3. Ipo? → weka kwenye `client.ts` → `GET /getuser`.
   - Imefanikiwa → `signedIn`.
   - 401 → interceptor ina-logout.
   - Hakuna mtandao → `bootError` (**hatufuti token**). Mtu aliye kwenye lift asilazimishwe ku-login upya.

#### signIn flow (nakala ya `LoginForm.jsx` ya web)

1. `POST /login` → hifadhi token.
2. Kama user ana org → `loadOrganization()` → token mpya → `signedIn` na org.
3. Kama hana → `signedIn` bila org → atapelekwa kwenye Organizations.

#### Mengine

- `queryClient.clear()` inaitwa ukibadilisha org au uki-logout, ili data za org A zisionekane kwenye org B.
- **Logout** inafuta token kwenye simu tu. Kama web, hakuna call ya `/logout` kwa backend, kwa hiyo token inabaki valid kwenye server mpaka i-expire.

---

### 8. [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx): navigation guard

Hili ni **somo kubwa la RN**. Kwenye web, unalinda route kwa **redirect** (`onlyAuthAccessData`). Kwenye React Navigation, **husajili screen ambayo mtu haruhusiwi kuiona kabisa**:

```tsx
{status === 'signedOut' ? (
  <Stack.Screen name="Login" ... />
) : !authOrganization ? (
  <Stack.Screen name="Organizations" ... />
) : (
  <>
    <Stack.Screen name="Home" ... />
    <Stack.Screen name="Organizations" ... />
  </>
)}
```

- Huita `navigation.navigate('Home')` baada ya login. Status ikibadilika, React ina-render upya, na stack mpya inaonekana yenyewe.
- Faida: haiwezekani kubonyeza "back" ukarudi kwenye Login ukiwa umeshaingia, kwa sababu Login haipo kwenye stack.
- `RootStackParamList` ni TypeScript type ya screens zote na params zake, kwa hiyo `navigate('Hoem')` ita-fail wakati wa compile.
- Status `loading` → spinner; `bootError` → screen ya "Try again / Sign out".

---

### 9. Screens

#### [src/screens/auth/LoginScreen.tsx](src/screens/auth/LoginScreen.tsx)

Ni port ya `src/components/signin/Signin.tsx` + `loginForm/LoginForm.jsx` ya web, ikitumia layout ya web ya simu (`xs`): brand panel juu, form chini, features zimefichwa.

- `<View>` = `<div>`, `<Text>` = `<span>`/`<p>`. **Kila maandishi lazima yawe ndani ya `<Text>`**, la sivyo app ita-crash.
- Styling ni `StyleSheet.create()`, si CSS. Layout yote ni **Flexbox**, na default ni `flexDirection: 'column'` (tofauti na web, ambako ni `row`).
- `react-hook-form` ni ileile, lakini kwa sababu RN haina `<input>` ya DOM, tunatumia `<Controller>` kuunganisha `TextInput`.
- **Trap:** `onPress={handleSubmit(onSubmit)}` inaleta type error, kwa sababu RN press event si DOM event. Suluhisho:
  ```ts
  const submit = () => handleSubmit(onSubmit)();
  ```
- `KeyboardAvoidingView` + `ScrollView` → keyboard ikifunguka isifunike input. Hili halipo kabisa kwenye web.
- `require('../../assets/images/proserp-white.png')`: picha za local zina-bundle'iwa kwa `require`, si URL string.
- `LinearGradient` ndani ya `Pressable` = button ya gradient (RN haina `background: linear-gradient()`).
- Shadows: iOS inatumia `shadowColor/shadowOpacity/shadowRadius`, Android inatumia `elevation`.
- Links za "Forgot password" na "Create" zinafungua screens za native (§15). Layout, fields na button sasa zinatoka kwenye kits za `src/components/auth/`.

#### [src/screens/organizations/OrganizationsScreen.tsx](src/screens/organizations/OrganizationsScreen.tsx)

> Imehamishwa na kuandikwa upya kwenye Hatua 2 (tazama Sura ya 2 §5). Masomo ya `FlatList` hapa chini bado ni sahihi.

- `FlatList` = mbadala wa `DataGrid`/`.map()`. Ina-render items zinazoonekana tu (virtualization), kwa hiyo ni muhimu kwa orodha ndefu.
- `refreshing` + `onRefresh` = pull-to-refresh bure.
- `ListEmptyComponent` / `ListHeaderComponent` = slots za list tupu na kichwa.
- `useQuery` ni ileile kabisa ya web.

#### `HomeScreen.tsx` (imefutwa)

Ilikuwa placeholder ya Phase 1, iliyothibitisha kuwa session inafanya kazi mwanzo mpaka mwisho. Kwenye Hatua 2 imechukuliwa nafasi na Dashboard halisi (Sura ya 2 §4).

---

### 10. Theme ([src/theme/](src/theme/)), fonts na lugha

- [palette.ts](src/theme/palette.ts): rangi zimenakiliwa kutoka `src/themes/main/default.ts` (light, `#2113AD`) na `dark.ts` (dark, `#2196f3`) za live-repo.
- [color.ts](src/theme/color.ts): `lighten()`/`darken()` kwa hesabu ileile ya MUI, ili gradient ifanane 100% na web.
- [ThemeProvider.tsx](src/theme/ThemeProvider.tsx): `useColorScheme()` inasoma dark/light mode ya simu. Inajenga theme moja na kuipa Paper **na** React Navigation (headers zifanane). Button ya jua/mwezi kwenye Login ni sawa na `ThemeModeOption` ya web.
- **Fonts:** RN haisomi `.woff`/`.woff2`, inataka `.ttf`/`.otf`. NoirPro ili-convert'iwa kwa Python `fontTools`.
- ⚠️ **Android trap:** custom font + `fontWeight: 'bold'` mara nyingi haifanyi kazi. Ndiyo maana kila uzito ni font family yake (`NoirPro-Bold`, `NoirPro-SemiBold`).
- [src/i18n/index.ts](src/i18n/index.ts): maandishi yamenakiliwa kutoka `src/dictionaries/{en,sw}`. Web inachagua lugha kwa URL (`/en`, `/sw`); mobile inatumia lugha ya simu kupitia `expo-localization`.

---

### 11. [App.tsx](App.tsx): mpangilio wa providers

```
useFonts()  → tusi-render chochote mpaka fonts (NoirPro + icons) ziwe tayari
SafeAreaProvider
  QueryClientProvider     ← AuthProvider inaihitaji (queryClient.clear())
    AppThemeProvider      ← ina PaperProvider ndani
      AuthProvider
        NavigationContainer
          RootNavigator
```

📌 **Somo:** mpangilio ni muhimu. Provider inaweza kutumia tu providers zilizo **juu** yake. AuthProvider inaita `useQueryClient()`, kwa hiyo lazima iwe ndani ya `QueryClientProvider`.

---

### 12. Matatizo tuliyokutana nayo (na masomo yake)

| Tatizo | Sababu | Suluhisho |
|---|---|---|
| Type error kwenye `handleSubmit` | RN press event ≠ DOM event | `const submit = () => handleSubmit(onSubmit)()` |
| `ListHeaderComponent={null}` type error | Prop inakubali `undefined`, si `null` | Tumia `undefined` |
| Icons zinaonekana kama visanduku | `@expo/vector-icons` haikuwa installed kwenye SDK hii | `npx expo install @expo/vector-icons` + preload font kwenye `useFonts` |
| Web preview inakwama kwenye spinner | SecureStore haipo kwenye web | Fallback ya memory (si `localStorage`, tazama §16) + try/catch kwenye boot |
| Logos ni 8632px (MB nyingi) | Asset za web ni kubwa mno kwa simu | Zimepunguzwa hadi 900px kwa `sips` |
| "Cannot reach the server" | Hakuna response kabisa (mtandao/DNS/TLS/Metro cache) | Kwenye dev, error sasa inaonyesha code halisi + URL; restart na `-c` |

---

### 13. Amri muhimu

```bash
npx expo start -c          # anzisha Metro, ukisafisha cache (baada ya kubadilisha .env)
npx expo install <pkg>     # ongeza package inayoendana na SDK
npx tsc --noEmit           # angalia TypeScript errors
npx expo-doctor            # angalia afya ya project
```

Ndani ya Metro: `i` = iOS simulator, `a` = Android emulator, `w` = web, `r` = reload.

---

### 14. Mazoezi ya kuimarisha uelewa (hiari)

1. Weka `console.log(config.headers)` ndani ya request interceptor ya [client.ts](src/api/client.ts), kisha login na ubadilishe org. Angalia `X-OrganizationId` na token zikibadilika kwenye terminal ya Metro.
2. Washa airplane mode, kisha funga na ufungue app. Utaona screen ya `bootError`, na ukirudisha mtandao, "Try again" inakuingiza bila password.
3. Kwenye [RootNavigator.tsx](src/navigation/RootNavigator.tsx), futa `<Stack.Screen name="Organizations">` iliyo ndani ya `<>...</>`, kisha bonyeza "Switch organization". Error utakayopata inaonyesha kwa nini screen lazima isajiliwe.

---

### 15. Nyongeza: Auth flows kamili (signup, verify email, forgot/reset)

Login peke yake haikutosha. Web ina flows nyingine nne, na zote sasa zimejengwa:

| Flow | Web (live-repo) | Mobile | Backend endpoint |
|---|---|---|---|
| Kufungua akaunti | `signupForm/SignupForm.tsx` | [SignupScreen.tsx](src/screens/auth/SignupScreen.tsx) | `POST /register` |
| Kuthibitisha email | `emailVerification/EmailVerificationNotice.jsx` + `middleware/auth.ts` | [VerifyEmailScreen.tsx](src/screens/auth/VerifyEmailScreen.tsx) | `POST /email/verification-notification` |
| Kusahau nenosiri | `resetPassword/ResetPassword.tsx` (bila token) | [ForgotPasswordScreen.tsx](src/screens/auth/ForgotPasswordScreen.tsx) | `POST /recover-password` |
| Kuweka nenosiri jipya | `forgotPassword/ResetPasswordForm.tsx` | [ResetPasswordScreen.tsx](src/screens/auth/ResetPasswordScreen.tsx) | `POST /reset-password` |

**Mambo yaliyogunduliwa kwenye web:**
- `/auth/forgot-password` ni **template ya zamani ya Jumbo** (ina picha ya "green iguana" na haina submit). Flow halisi ni `/auth/reset-password`.
- `/auth/verify-email` ni **stub**: button yake haina `onClick`. Kiungo cha uthibitisho kwenye email kinafunguka kwenye browser, na backend ndiyo inayothibitisha.
- Web inamzuia mtu ambaye `email_verified_at` yake ni `null` kupitia `middleware/auth.ts`. Mwanzoni app yetu **ilikosa hili**, na sasa `RootNavigator` inafanya kazi hiyo.

#### Kits za kwanza: `src/components/auth/`

Kabla ya skrini mpya, sehemu za `LoginScreen` zilichomolewa ili zitumike kila mahali. Hii ndiyo ladha ya kwanza ya "kits" za Mpango Kazi:

| Kit | Kazi |
|---|---|
| [AuthLayout.tsx](src/components/auth/AuthLayout.tsx) | Kadi yenye brand panel ya gradient + theme toggle + keyboard handling |
| [AuthTextField.tsx](src/components/auth/AuthTextField.tsx) | Label juu, icon, eye toggle ya password, na `Controller` ndani yake (screen inatoa `control` + `name` tu) |
| [GradientButton.tsx](src/components/auth/GradientButton.tsx) | Button ya gradient yenye loading |
| [AuthLinks.tsx](src/components/auth/AuthLinks.tsx) | Links za "Huna akaunti? Jisajili" na ujumbe wa form (error/success) |

📌 **Somo la TypeScript:** `AuthTextField<T extends FieldValues>` ni **generic component**. `name` inakaguliwa dhidi ya fields za form husika, kwa hiyo `name="emial"` inaleta error wakati wa compile.

#### Validation: [src/auth/validation.ts](src/auth/validation.ts)

- `yup` + `@hookform/resolvers`, **sheria zilezile** za web (password: herufi 8+, kubwa, ndogo, namba, alama; simu: tarakimu 10–15).
- `yup.InferType<typeof signupSchema>` inatengeneza TypeScript type kutoka kwenye schema, kwa hiyo hatuandiki type mara mbili.
- Ujumbe unatoka kwenye `dictionary`, kwa hiyo makosa yanaonekana kwa Kiswahili simu ikiwa imewekwa Kiswahili.

#### Makosa ya server chini ya field: [src/auth/serverErrors.ts](src/auth/serverErrors.ts)

Laravel inarudisha `{ errors: { email: ["…"] } }` (422). `applyServerErrors()` inaweka kila kosa chini ya field yake kwa `setError` ya react-hook-form, kama "We can't find a user with that email address." chini ya Email.

⚠️ Backend haiko sawa kila mahali: `/register` inatumia `validation_errors` (400), na `/reset-password` inarudisha 500 yenye `message` tu. `getFieldErrors()` kwenye [client.ts](src/api/client.ts) inasoma maumbo yote mawili.

#### `useMutation`: React Query kwa "writes"

Forgot, Reset na Verify zinatumia `useMutation` badala ya `try/catch` + `useState`:

```ts
const mutation = useMutation({
  mutationFn: (email: string) => authApi.requestPasswordReset(email),
  onError: (error) => applyServerErrors(error, setError, ['email']),
});
mutation.mutate(email);   // mutation.isPending / isSuccess / isError / data / error
```

Ni ileile ya web (web `ResetPassword.tsx` inaitumia pia).

#### Kiungo cha reset kwenye simu

Email ya reset ina kiungo cha **web** (`…/reset-password?token=…`). Mpaka app ishughulikie viungo hivyo yenyewe (universal links, Hatua 14), mtumiaji anabandika kiungo au token kwenye `ResetPasswordScreen`. `parseResetLink()` inatoa `token` na `email` kutoka kwenye kiungo, na email inajazwa yenyewe.

#### Gate ya email kwenye navigator

```tsx
status === 'signedOut'  → Login / Signup / ForgotPassword / ResetPassword  (Stack.Group)
!isEmailVerified        → VerifyEmail
!authOrganization       → Organizations
vinginevyo              → Home + Organizations
```

`Stack.Group` inaruhusu screens kadhaa kushiriki options (`headerShown: false`).

#### 🐛 Somo la React: stale closure

Kwenye `VerifyEmailScreen`, "Already verified?" inaita `refreshAuth()`, kisha inaangalia kama email imethibitishwa. Toleo la kwanza liliangalia `isEmailVerified` ndani ya `onSuccess`, lakini **callback inakumbuka thamani ya render ilipoundwa**, yaani thamani ya zamani kabla ya refresh. Suluhisho: `refreshAuth()` sasa inarudisha data mpya, na tunasoma `data.authUser.user.email_verified_at`.

> Kanuni: ndani ya callback ya async, usitegemee state/props kuwa "za sasa". Tumia thamani inayorudishwa na operesheni yenyewe.

### 15b. Logout kwenye kila skrini ya ndani

Mtumiaji mwenye organizations alikwama kwenye "Choose organization": Sign out ilionekana tu kama orodha ni tupu. Sasa kila skrini ya ndani ina icon ya logout kwenye header, iliyowekwa mara moja tu kwa `screenOptions` ya navigator:

```tsx
<Stack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
```

[LogoutButton.tsx](src/components/common/LogoutButton.tsx) inauliza "Una uhakika?" kwa `Dialog` ya Paper ndani ya `Portal`, kama dialog ya logout ya web (`AuthUserPopover.tsx`).

📌 **Somo:** `Alert.alert()` ya RN inafanya kazi iOS/Android, lakini **haifanyi chochote kwenye react-native-web**. `Dialog` ya Paper inafanya kazi kila mahali. `Portal` inachora dialog juu ya skrini nzima, hata ikiwa component iko ndani ya header.

### 16. Usalama wa access token 🔐

Uliona token kwenye DevTools (response ya `/login` na header ya `Authorization`). Haya ndiyo tuliyojifunza:

1. **Bearer token lazima ifike kwa client.** Bila hiyo app haiwezi kutuma `Authorization: Bearer`. Web ya ProsERP inaificha kwa sababu server ya Next.js (BFF) ndiyo inayoipokea na kuifunga ndani ya **httpOnly cookie**. Hata hivyo, DevTools ya web inaonyesha cookie hiyo, na cookie nayo ni kitambulisho kinachoweza kunakiliwa.
2. **Kuona requests zako mwenyewe kwenye DevTools si kuvuja.** Hatari halisi ni token kufikiwa na **mtu au script nyingine**.
3. **Kwenye simu**, token iko kwenye memory + Keychain/Keystore na inasafiri juu ya HTTPS. Watumiaji hawana DevTools. Hii ndiyo njia ya kawaida ya apps za simu.
4. **Kwenye Expo web palikuwa na kosa halisi:** web fallback ilikuwa inaweka token kwenye `localStorage`, ambayo script yoyote (XSS) inaweza kuisoma. **Imerekebishwa:** sasa web inaweka token kwenye memory tu (refresh = login tena), na nakala za zamani zinafutwa. Build ya web ya RN **haitumiwi production kamwe**.
5. **Token iliyobandikwa kwenye chat au screenshot imevuja.** Kwa kuwa hakuna endpoint ya logout, inabaki valid mpaka i-expire au ifutwe na backend (tazama swali 7 la backend).
6. **Tabia nzuri:** ukihitaji kuonyesha request, ficha token (`Bearer 12077|****`). Code yetu haiandiki headers wala token kwenye logs.

#### Je, kwenye simu token inaonekana kama kwenye web preview?

| Hali | Inaonekana? | Kwa nini |
|---|---|---|
| Dev mode (Expo Go / `expo start`) | ✅ kwako | React Native DevTools ina Network tab, kama Chrome |
| Release build, mtumiaji wa kawaida | ❌ | Hakuna DevTools; token iko kwenye memory + Keychain/Keystore |
| Release + proxy (Proxyman/Charles) | ⚠️ iOS ukiamini cert ya proxy; Android hapana | Android 7+ haiamini user certificates kwenye release builds |
| Simu iliyo-root/jailbreak | ⚠️ inawezekana | Hakuna app inayojilinda 100% dhidi ya root |
| Mtu mwingine kwenye Wi-Fi ileile | ❌ | TLS inasimba kila kitu |

#### Majaribio ya kujihakikishia

1. **Dev mode:** Metro ikiendelea, bonyeza `j` → React Native DevTools → **Network** → login. Utaona `Authorization`. Ni kwa developer tu.
2. **TLS:** Proxyman kwenye Mac + proxy kwenye Wi-Fi ya simu. Bila kuamini cert ya Proxyman, utaona tunnel iliyosimbwa tu. Token inaonekana pale tu **wewe** unapoamini cert hiyo.
3. **Keystore** (inahitaji `npx expo run:android`): `adb shell run-as <package> cat shared_prefs/SecureStore.xml` inaonyesha **ciphertext**, si token.
4. **Logs:** `grep -rn "console\." src`. Hakuna log inayoandika headers au token.

#### Kinga za ziada

- **Hatua 14:** certificate pinning (hiari), crash reporting isiyokusanya headers.
- **Backend:** token zenye muda wa kuisha + logout inayofuta token kwenye server (maswali 5 na 7). Hizi zinapunguza madhara hata token ikivuja.

#### Kinachofuata

Hatua 2 imekamilika: tazama [Sura ya 2](#sura-ya-2-hatua-2--app-shell).


---

## Sura ya 2: Hatua 2 — App Shell

> Imekamilika: 2026-11-02. Imejaribiwa kwenye headless Chrome dhidi ya **mock backend** (data za majaribio zenye id za namba kama backend halisi), na bundle ya Android inajengwa. **Bado haijajaribiwa kikamilifu na account halisi** kwenye `dev-api`.
>
> Sura hii iliandikwa upya baada ya toleo la kwanza kupotea (faili lilihifadhiwa kutoka toleo la zamani lililokuwa wazi kwenye editor). Inaeleza hali ya sasa, baada ya marekebisho ya "full parity".

### Picha kubwa

```
RootNavigator (Stack)
 ├─ App  ─────────────► AppDrawer (Drawer)          ← "sidebar" ya web
 │                        ├─ Dashboard
 │                        ├─ ComingSoon {id,title,path,hatua}
 │                        ├─ Notifications
 │                        └─ Profile
 ├─ Organizations       (orodha / switch)           ← skrini kamili juu ya drawer
 ├─ OrganizationForm    {organizationId?}           ← create + edit
 ├─ ChangePassword
 └─ ComingSoon          (k.m. Invitations kabla ya kuwa na org)
```

📌 **Somo: nested navigators.** Drawer iko **ndani** ya Stack. Skrini za drawer zinatumia `navigation.navigate('Profile')`. Ili kufungua skrini ya Stack kutoka ndani ya drawer, tunaenda kwa mzazi: `navigation.getParent()?.navigate('Organizations')`.

### 1. Kanuni iliyozaliwa hapa: full parity

Mara mbili niliacha au nikabuni vitu, na ukanirekebisha:
- **Form ya organization** iliacha logo, branding na settings ("malizia web").
- **Dashboard** ilikuwa na totals, maandishi na kuchuja birthdays ambavyo web haina, huku kadi 9 zikikosekana.

Sasa kanuni B3 ya Mpango Kazi ni: **uwezo kamili kama web; muonekano tu ndio unabadilika.** Mbinu iliyofanya kazi kwa skrini kubwa: agent anasoma component ya web na kutoa **maelezo kamili** (kila field, gate, endpoint, maandishi, na kisicho kuwepo), kisha tunajenga kutoka kwenye maelezo hayo.

### 2. Menu ya declarative: [moduleRegistry.ts](src/navigation/moduleRegistry.ts)

Web ina menu (`menu-items.tsx`, mistari 812) na **gating ya imperative** (`Sidebar.js`, mistari 1,288 ya `if`). Agent alisoma kila mstari na kutoa jedwali, ambalo sasa ni data:

```ts
leaf('transactions', L('Transactions', 'Shughuli'), '/accounts/transactions', 10, 'swap-horizontal',
  any(P.ACCOUNTS_TRANSACTIONS_READ, P.PAYMENTS_READ, ...)),
```

- Kila node ina `label {en, sw}`, `icon`, `path` ya web, `hatua` itakayoijenga, na `gate`.
- `gate` ni function ndogo: `any(...)` (permission yoyote), `sub(...)` (module), `all(...)`.
- [useMenu.ts](src/navigation/useMenu.ts) inajenga `GateContext` kutoka `useAuth()`, na `filterMenu()` inaondoa nodes zisizoruhusiwa na makundi matupu.
- **TypeScript inalinda:** jina la permission likiwa na kosa, compile inashindwa.
- **ProsControl imeachwa** kwa makusudi: ni admin wa jukwaa (Mpango Kazi §F).

#### Quirks za web tulizozinakili (WEB-QUIRK)

Ili mtumiaji aone menu ileile kwenye web na simu, tabia ya web imenakiliwa **hata pale ilipo na bug**. Kila moja ina comment `WEB-QUIRK`; ikirekebishwa web, ni mstari mmoja kwetu. Za kupeleka kwa timu ya web:

| # | Mahali (`Sidebar.js`) | Tatizo |
|---|---|---|
| 1 | ~668, ~679 | Approved Payroll / Approved Loans **zinaonekana kwa kila mtu**: sharti `!organizationHasSubscribed([HR, A&F])` haliwezi kuwa kweli ndani ya block ya `sub(A&F)` (imethibitishwa) |
| 2 | ~180–206 | Filters za POS Sales zinatafuta `salesCounter` kwenye ngazi isiyo sahihi, kwa hiyo Sales/Proformas hazifichwi kamwe |
| 3 | ~399–412 | Filter ya BOMs inatumia permissions za ProductionBatches na ngazi isiyo sahihi, kwa hiyo haifanyi kazi |
| 4 | ~92 | `Requisitions:Read` haipo kwenye gate (na `REQUISITIONS_EDIT` imerudiwa): mtumiaji wa kusoma tu haoni Requisitions |
| 5 | (kote) | Menu ya web inalinganisha items kwa **maandishi yaliyotafsiriwa**; kubadilisha tafsiri kunaweza kuvunja gate |
| 6 | (kote) | `updatedMenus` inabadilisha menu asili (shallow copy); items zilizofichwa zinaweza kubaki zimefichwa baada ya kubadilisha org |

### 3. Drawer: [AppDrawer.tsx](src/navigation/AppDrawer.tsx) + [AppDrawerContent.tsx](src/navigation/AppDrawerContent.tsx)

- **Kichwa:** avatar (`expo-image`, inahifadhi picha kwenye disk), jina, email, na kitufe cha organization (bonyeza = badilisha).
- **Menu:** `List.Accordion` kwa sections na makundi, `List.Item` kwa skrini. Home inawekwa juu moja kwa moja (Dashboard), kama web.
- **Chini:** Notifications, Profile, na Logout (yenye dialog ya uthibitisho).
- **Header:** kengele yenye idadi ya ambazo hazijasomwa ([NotificationBell.tsx](src/components/common/NotificationBell.tsx)), inayojisasisha kila dakika (`refetchInterval`).
- Packages: `@react-navigation/drawer` + `react-native-reanimated` + `react-native-gesture-handler` (`App.tsx` imefungwa ndani ya `GestureHandlerRootView`).

#### Header na kiduara (kama web): [HeaderActions.tsx](src/components/common/HeaderActions.tsx)

Toleo la kwanza liliweka taarifa za user/org na Notifications/Profile/Logout ndani ya drawer. **Web haifanyi hivyo.** `Header.tsx` ya web ina, upande wa kulia: **theme toggle → kengele → kiduara** (`AuthUserPopover`). Sasa simu iko hivyo hivyo kwenye kila skrini:
- [UserMenu.tsx](src/components/common/UserMenu.tsx): avatar yenye mpaka wa rangi kuu ya org. Ndani yake kuna avatar ya 60px, jina, email, chip ya organization (→ profile ya org), au "No organization selected…". Chini yake: **Profile, Switch Organization, Logout** (dialog "Confirm Logout").
- Drawer sasa ni kama sidebar ya web: **logo + kitufe cha kufunga**, **Search Menu** (inatafuta kwa jina au njia, na makundi yanafunguka yenyewe), kisha menu tu.

🐛 **Somo la Portal:** `<Portal>` ya Paper inachora kwenye host iliyo ndani ya `PaperProvider`, ambayo iko **juu** ya `AuthProvider`. Kwa hiyo `useAuth()` ndani ya Modal/Dialog ya Portal inashindwa ("useAuth must be used within an AuthProvider"). Suluhisho: soma data nje ya Portal, kisha ipitishe kama props.

#### Ulinganisho na web ikifunguliwa kwenye simu (2026-11-02)

Ulinionyesha `webapp.proserp.co.tz` kwenye simu. Tofauti zilizorekebishwa:

| Kipengele | Web (simu) | Sasa kwenye app |
|---|---|---|
| Header | Hakuna jina la ukurasa. ☰ ya mviringo, ←, ⟳ · 🌙 ya mviringo, 🔔, avatar | [DrawerHeaderLeft.tsx](src/components/common/DrawerHeaderLeft.tsx) + [RoundIconButton.tsx](src/components/common/RoundIconButton.tsx). ← inaonekana tu kukiwa na historia (`backBehavior="history"`), na ⟳ inapakia data upya. Web ina "forward" pia; navigation ya simu haina forward |
| Theme | Default **light**, inahifadhiwa (`theme-type`). Icon inaonyesha **hali ya sasa** (☀️ light, 🌙 dark) | Vivyo hivyo (AsyncStorage `theme-type`) |
| Interval / Display / Order By… | MUI Select ya outlined yenye lebo juu ya mpaka | `SelectMenu` ya outlined yenye lebo, upana thabiti, pembeni ya kichwa |
| Legend za line charts | Recharts: `-o-` + jina lenye rangi ya mfululizo | `Legend` (bars zinapata mraba) |
| Chart yenye point moja | Kidoti kitupu katikati | `customDataPoint` + `initialSpacing` ya katikati |
| Pie isiyo na data | Duara tupu | Duara tupu |
| Lebo za pie | Mistari 2: jina (bold), kisha `100.0 %` | `SvgText` + `TSpan` mbili, na `extraRadius` kwa nafasi |
| Tooltip ya pie | `jina` / `416,666.67: (100.0%)` | `showTooltip` + `tooltipComponent` (jaribu kwenye simu: haionekani kwenye browser ya majaribio) |
| ☰ ya Highcharts | Full screen, Print, PNG, JPEG, PDF, SVG | Full screen, Print, PNG, JPEG, PDF (`react-native-view-shot` + `expo-print`/`expo-sharing`). **SVG haipo**, kwa sababu simu inapiga picha ya chart na haiwezi kutoa SVG halisi |

### 4. Dashboard: [src/screens/dashboard/](src/screens/dashboard/)

Nakala ya `Dashboard.tsx` ya web: **kadi zilezile, mpangilio uleule, gates zilezile.** Kwenye simu kila `Grid` ya web ni `xs=12`, kwa hiyo kadi zinapangwa moja chini ya nyingine.

| # | Kadi | Gate | Endpoint |
|---|---|---|---|
| A/B | Arifa: hakuna subscription / subscription inaisha | hakuna subs / `Subscriptions:Manage` | — |
| 1 | **Filters** (From/To zenye saa, Cost Centers kwa makundi, Show/Hide figures, presets 5) | subs + `Accounts:Reports` au `Purchases:Reports` au (`Sales:Reports` **na** `Accounts:Reports`) | — |
| 2 | Dippings (Closing/Deviation/Stock) | A&F + `Accounts:Reports` + cost center ya Fuel Station | `/fuel-stations/dipping-report` |
| 3–6 | P&L Trend, Balance Sheet Trend, Revenue Composition, Operating Expenses | A&F + `Accounts:Reports` | `/accounts/profit-and-loss-figures`, `/accounts/balance-sheet-figures`, `/accounts/income-figures`, `/accounts/expense-figures` |
| 7 | Inventory Value | Procurement + `Stores:Reports` + `Accounts:Reports` | `/accounts/inventory-value` |
| 8 | Low Stock Alerts (+ PDF) | Procurement + `Stores:Reports` | `/low-stock-alerts` |
| 9 | Purchases & GRNs | Procurement + `Purchases:Reports` | `/purchase-values`, `/grn-values` |
| 10 | Due Invoices (+ Mark as Paid) | A&F + `Accounts:Reports` | `/due-invoices-summary`, `…/mark-paid` |
| 11 | Product Sales "Top…" (+ PDF / Excel) | (POS au Fuel) + `Sales:Reports` **na** `Accounts:Reports` | `/product-sales`, `/pos/sales-people` |
| 12–13 | On Leave Today, Upcoming Birthdays (30 Days) | HR + `Employees:Read` | `/hr-dashboard` (moja kwa zote) |
| 14 | Quick Links (tiles 14, kila moja na gate) | subs | — |
| 15 | Quick Reports (tiles 17) | subs + ruhusa yoyote ya ripoti | — |

- **Show/Hide figures:** kama web, inaficha tu mistari ya takwimu ([FinancialSummaryStrip.tsx](src/screens/dashboard/FinancialSummaryStrip.tsx)) kwa `••••`, na summary haiombwi kabisa ikiwa imefichwa. Default ni **imefichwa**, na inakumbukwa kwa kila mtumiaji (AsyncStorage, key ileile ya localStorage ya web). (Iliondolewa kwa muda tukidhani haipo web, kisha ikarudishwa baada ya kuthibitisha kuwa ipo: somo la kukagua web kwanza.)
- **Kubadilisha organization:** baada ya ku-load, unapelekwa **Dashboard** (kama `router.replace('/dashboard')` ya web). Dashboard ina `key` ya org, kwa hiyo filters zinaanza upya kwa cost centers za org mpya.
- **Formats ni za web:** `shortNumber` (bila kuzungusha; ndiyo sababu `1000K` inaonekana), `readableDate`, `dayjs`, na compact (`29M`).
- **Charts:** `react-native-gifted-charts` badala ya Recharts/Highcharts. `chartScale()` inachagua viwango "nzuri" (10M, 7.5M…), na lebo ndefu za tarehe zinaonyeshwa moja kati ya kadhaa (tooltip inaonyesha zote).
- **Tofauti ndogo za makusudi:** web inachagua rangi za nasibu kila render kwa Inventory Value; simu inatumia rangi zisizobadilika.
- **Bado ni ComingSoon:** tiles za Quick Links/Reports, icons za Income Statement/Balance Sheet, na kubonyeza mfanyakazi. Zipo zote na gates zake, lakini skrini wanazozifungua ni features kamili za hatua nyingine.

### 5. Organizations

**Orodha** ([OrganizationsScreen.tsx](src/screens/organizations/OrganizationsScreen.tsx)), nakala ya `OrganizationListItem` ya web:
- Nyota ya **auto-load** (`PUT /organizations/{id}/toggle_autoload`, kwa dialog ya uthibitisho)
- Avatar yenye nukta ya hali (kijani = active), jina, website
- Roles kama chips (3 + "+N")
- Edit/Profile/Dashboard kwa organization active, ➜ ya ku-load kwa nyingine
- Search, infinite scroll (badala ya page buttons), `+` kwenye header
- Ujumbe wa "invitations" ukiwa huna organization

**Form** ([OrganizationFormScreen.tsx](src/screens/organizations/OrganizationFormScreen.tsx)), create **na** edit, sehemu zote 5 za web:
1. Basic Information (nchi inachagua sarafu yake)
2. VAT (default 18%)
3. Workflow Settings (zinaonekana kulingana na modules za org ya sasa)
4. Payroll Settings
5. Branding & Identity (logo, symbol, rangi 4, tagline)

**Ruhusa (kama web):** kuunda kunahitaji `Organizations:Manage` (ya mtumiaji); kuhariri ni kwa organization iliyo active + `Organization:Update`.

⚠️ `POST /organizations` na `PUT …/load` zote zinarudisha **token mpya**. `adoptOrganization()` kwenye AuthProvider inaitumia. Baada ya kuhariri, `refreshAuth()` inasasisha session, kwa sababu settings kama `defer_grn_billing` zinabadilisha menu.

### 6. Notifications, Profile, Change Password

- [NotificationsScreen.tsx](src/screens/shell/NotificationsScreen.tsx): 📌 **`useInfiniteQuery`** + `onEndReached`. Kusoma, kusoma zote, kufuta moja, na kufuta zote (kwa dialog) kunatumia `useMutation` + `invalidateQueries`, ili orodha na kengele zijisasishe.
- [ProfileScreen.tsx](src/screens/shell/ProfileScreen.tsx): picha (`expo-image-picker` → `POST /update-photo`), kuondoa picha, maelezo, roles.
- 📌 **Runtime permissions:** `requestMediaLibraryPermissionsAsync()` kabla ya kufungua picha.
- [ChangePasswordScreen.tsx](src/screens/shell/ChangePasswordScreen.tsx): `POST /change-password`.

### 7. Kits mpya

| Kit | Kazi |
|---|---|
| [form/TextField.tsx](src/components/form/TextField.tsx) | Ilikuwa `AuthTextField`; sasa ni ya forms zote, ikiwa na `helper` |
| [form/SelectField.tsx](src/components/form/SelectField.tsx) | Mbadala wa MUI `Autocomplete`: skrini kamili yenye utafutaji + `FlatList` |
| [form/DateField.tsx](src/components/form/DateField.tsx) | `react-native-paper-dates`, inahifadhi `YYYY-MM-DD` |
| [form/ColorField.tsx](src/components/form/ColorField.tsx) | Mbadala wa `<input type="color">`: HEX + swatch + rangi za kuchagua |
| [form/ImageField.tsx](src/components/form/ImageField.tsx) | Mbadala wa `<input type="file">`: chagua picha, preview, ondoa |
| [common/ScreenState.tsx](src/components/common/ScreenState.tsx) | `Loading`, `ErrorState` (+ retry), `EmptyState` |
| [api/upload.ts](src/api/upload.ts) | `toFormData()` sawa na `buildFormData()` ya web, inayokubali mafaili ya simu |
| [lib/files/share.ts](src/lib/files/share.ts) | `shareExcel()` / `sharePdf()`: simu inafungua "Share" (WhatsApp, email, Files…); web inapakua |
| [lib/excel/](src/lib/excel/) | **`exceljs` ileile ya web**: Excel inayotoka inafanana na ya web (imethibitishwa kwa Product Sales) |

📌 **Multipart uploads:** usiweke `Content-Type: multipart/form-data` kwa mkono, kwa sababu inakosa `boundary` na server haiwezi kusoma body. [client.ts](src/api/client.ts) inaifuta pale data ni `FormData`, kama BFF ya web.

### 8. Kusawazisha na web: [scripts/sync-from-web.mjs](scripts/sync-from-web.mjs)

```bash
node scripts/sync-from-web.mjs
```

Inanakili `MODULES`, `PERMISSIONS`, `PROS_CONTROL_PERMISSIONS`, nchi, na helpers za Excel (`styles.ts`, `workBook.ts`) kutoka `live-repo main` kwa `git show`, bila kubadilisha branch ya web. **Usihariri files hizo kwa mkono.**

### 8b. Mpangilio wa code (Prettier)

Code nyingi ilikuwa imeandikwa kwa mistari mirefu sana (orodha za permissions, props za JSX, HTML ya PDF), na ilikuwa ngumu kusoma. Sasa mradi una **Prettier**:

```bash
npm run format        # panga code yote
npm run format:check  # angalia tu (inafaa kwa CI)
```

- [.prettierrc.json](.prettierrc.json): upana wa mstari 100, single quotes, trailing commas.
- [.prettierignore](.prettierignore): haigusi files zinazonakiliwa kutoka web (`src/constants`, helpers za Excel) wala `.md`.
- Prettier haivunji **ndani** ya string au template literal. Kwa hiyo HTML ya PDF imeandikwa kwa mkono kama HTML iliyopangwa, na logic ndefu ndani ya `${…}` imetolewa kwenye vigeu vyenye majina (`dueLabel`, `marginOf`, `previousTo`…).
- Kinachobaki kirefu kwa makusudi: maandishi ya tafsiri (`i18n`) na regex, kwa sababu kuvivunja kungevifanya vigumu kusoma na kutafuta.

📌 **Kanuni:** kabla ya ku-commit, endesha `npm run format`. Code iliyopangwa kwa sheria moja ni rahisi kwa developer yeyote kusoma na ku-review.

### 9. Matatizo tuliyokutana nayo (na masomo yake)

| Tatizo | Sababu | Suluhisho / somo |
|---|---|---|
| **"Invalid value provided to SecureStore"** kwenye Expo Go | Backend inarudisha `organization.id` kama **namba**; SecureStore inakubali string tu. Mock zangu zilitumia `'o1'`, kwa hiyo hazikuliona | `String()` mahali pamoja (`persistSession`), na `sameId()` kwa kulinganisha. **Data za majaribio lazima zifanane na za kweli, hata kwa aina** |
| Skrini nyeupe baada ya login (`reading 'title'`) | Drawer inahesabu `options` za **kila** screen mwanzoni, hata ComingSoon isiyo na params | `initialParams` + `route.params?.title` |
| Due Invoices: idadi isiyo sahihi | Nilisoma `incomingTotal`; backend inarudisha `incoming_total` | Maelezo ya agent yalitaja jina sahihi |
| Mhimili wa Y: `9.40001M` | gifted-charts inagawa max ghafi kwa sections | `chartScale()` ya viwango "nzuri" |
| Inventory: eneo moja la kijivu | `areaChart` iliwekwa juu ya chart nzima | `areaChart: true` kwa kila mfululizo |
| Lebo za pie hazionekani | Ndani ya SVG, lebo lazima iwe `<Text>` ya `react-native-svg` | `SvgText` |
| Rows za accordion zina background nyeusi | `List.Accordion` inajifunga kwenye View yenye `theme.colors.background` | `theme={{ colors: { background: 'transparent' } }}` |
| Avatar zilibana ukingoni | Nilibadilisha `style` iliyokuja na props | `style={[p.style, {...}]}` |
| Majaribio: drawer "haikufunguka" | Script ilibonyeza button iliyofichwa ya skrini ya awali; `Pressable` ya RN-web inasikiliza **pointer events**, si `element.click()` | Bonyeza element inayoonekana, kwa mouse halisi |
| **"Maximum call stack size exceeded"** mara 440 kwenye Expo Go (hata Login) | `exceljs.min.js` ina **core-js**, ikiwemo polyfill ya `Promise` yenye ufuatiliaji wake wa unhandled rejections. Kwenye Hermes inabadilisha `Promise` ya mfumo na kugongana na React Native. Ilipakiwa app inapoanza kwa sababu Dashboard → Product Sales → exporter | [metro.config.js](metro.config.js) inaelekeza `exceljs` kwenye `exceljs.bare.min.js` (bila polyfills), na exporter inapakiwa kwa `await import()` wakati wa ku-export tu. **Somo:** library inayofanya kazi kwenye browser inaweza kuvunja Hermes; angalia kama inabeba polyfills za global, na pakia libraries nzito pale tu zinapohitajika |
| **Mtumiaji asiye na organization anatolewa nje mara baada ya login** | `authOrganization: null` → skrini ya Organizations → kengele inaita `/notifications/unread-count` bila `X-OrganizationId` → backend inajibu **401** → interceptor yetu ilikuwa inatoa nje kwa 401 **yoyote**. Web haina response interceptor; inatoa nje tu `GET /getuser` ikishindwa | 401 sasa inasababisha **ukaguzi wa `/getuser`** (`skipSessionCheck` kuepuka mzunguko, na ukaguzi mmoja kwa wakati). Inatoa nje tu kama `/getuser` nayo ni 401. Kwenye dev, URL iliyoleta 401 inaandikwa kwenye log. **Somo:** usiwe mkali kuliko web; "401 kwenye request moja" si sawa na "session imekwisha" |
| Sura hii ya kitabu ilipotea | Faili lilihifadhiwa kutoka toleo la zamani kwenye editor | Funga au fungua upya tab kabla ya mabadiliko kutoka nje |

### 10. Jinsi tulivyojaribu bila backend halisi

Puppeteer (kwenye scratchpad, si kwenye project) inanasa kila request ya `dev-api.proserp.co.tz` na kurudisha **data za majaribio**: mtumiaji "Asha Mwita", organization yenye modules 7, takwimu za kila kadi, na id za namba. Faida:
- Tunajaribu UI, gating na exports bila kugusa server halisi wala password.
- Tunatengeneza hali ngumu kwa urahisi (modules na permissions tofauti).

Hii ni ladha ya **testing** itakayorasimishwa Hatua 3 (Jest + React Native Testing Library).

### 11. Mazoezi (hiari)

1. Kwenye [moduleRegistry.ts](src/navigation/moduleRegistry.ts), ondoa `WEB-QUIRK` ya Approved Payroll kwa kuweka gate sahihi (`all(sub(HR, A&F), any(ACCOUNTS_TRANSACTIONS_CREATE), any(PAYROLL_READ, PAYROLLRUNS_CREATE))`), kisha angalia item ikipotea kwa mtumiaji asiye na permissions hizo. Irudishe baadaye.
2. Washa "Show figures" kwenye dashboard, funga app, na uifungue tena. Preference inakumbukwa (AsyncStorage).
3. Toa Excel ya Product Sales kwenye simu, ifungue kwa Excel/Sheets, kisha ilinganishe na ile ya web.

### Kinachofuata: Hatua 3 — UI Kits + Masters

`ListScreen` kit (search + filters + infinite scroll), CRUD kamili ya Masters (currencies, units, banks, stakeholders, cost centers), na Jest + React Native Testing Library. Tazama [Mpango Kazi → Hatua 3](#hatua-3--ui-kits--masters-l).
