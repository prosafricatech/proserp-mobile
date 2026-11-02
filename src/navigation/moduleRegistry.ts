import { MODULES } from '../constants/modules';
import { PERMISSIONS as P } from '../constants/permissions';

// Declarative port of live-repo's src/utilities/constants/menu-items.tsx + the imperative
// gating in src/components/sidebar/Sidebar.js. Each node states its own gate; filterMenu()
// evaluates them against the session. Behaviour deliberately matches what the web code
// actually does today — including its known quirks (marked WEB-QUIRK, see the progress
// book) — so web and mobile users see the same menu.
//
// ProsControl is intentionally absent: it is platform admin, not part of the customer app.

export type Label = { en: string; sw: string };

export type GateContext = {
  hasOrganization: boolean;
  subscriptionsCount: number;
  subscribed: (modules: string | string[]) => boolean; // any-of
  org: (permissions: string | string[]) => boolean; // any-of, org-level
  setting: (name: string) => unknown; // authOrganization.organization.settings[name]
};

export type Gate = (ctx: GateContext) => boolean;

export type MenuNode = {
  id: string;
  label: Label;
  icon?: string; // MaterialCommunityIcons name
  path?: string; // web route without the locale, e.g. /pos/sales-counters
  screen?: 'Dashboard' | 'Organizations'; // built natively; anything else opens ComingSoon
  hatua?: number; // plan step that builds this screen
  gate?: Gate;
  children?: MenuNode[];
};

const any =
  (...permissions: string[]): Gate =>
  (ctx) =>
    ctx.org(permissions);
const sub =
  (...modules: string[]): Gate =>
  (ctx) =>
    ctx.subscribed(modules);
const all =
  (...gates: Gate[]): Gate =>
  (ctx) =>
    gates.every((g) => g(ctx));
const withOrg: Gate = (ctx) => ctx.hasOrganization;
const anySubscription: Gate = (ctx) => ctx.subscriptionsCount > 0;

const L = (en: string, sw: string = en): Label => ({ en, sw });
const MASTERS = L('Masters', 'Wakuu');
const REPORTS = L('Reports', 'Ripoti');
const leaf = (
  id: string,
  label: Label,
  path: string,
  hatua: number,
  icon?: string,
  gate?: Gate
): MenuNode => ({
  id,
  label,
  path,
  hatua,
  icon,
  gate,
});

export const MENU: MenuNode[] = [
  {
    id: 'home',
    label: L('Home', 'Nyumbani'),
    children: [
      {
        id: 'dashboard',
        label: L('Dashboard', 'Dashibodi'),
        icon: 'view-dashboard-outline',
        path: '/dashboard',
        screen: 'Dashboard',
      },
    ],
  },
  {
    id: 'processApproval',
    label: L('Process Approval', 'Uidhinishaji wa Michakato'),
    icon: 'check-decagram-outline',
    gate: all(withOrg, sub(MODULES.PROCESS_APPROVAL)),
    children: [
      // WEB-QUIRK: Requisitions:Read is not in the gate, so read-only users don't see it.
      leaf(
        'requisitions',
        L('Requisitions', 'Maombi'),
        '/requisitions',
        4,
        'file-document-edit-outline',
        any(P.REQUISITIONS_CREATE, P.REQUISITIONS_EDIT, P.REQUISITIONS_DELETE)
      ),
      leaf(
        'approvals',
        L('Approvals', 'Idhinisho'),
        '/requisition-approvals',
        4,
        'check-all',
        any(
          P.APPROVED_REQUISITIONS_PAY,
          P.APPROVED_REQUISITIONS_PURCHASE,
          P.IMPREST_RETIREMENTS_READ,
          P.INVENTORY_CONSUMPTIONS_CREATE,
          P.ACCOUNTS_TRANSACTIONS_READ,
          P.PURCHASES_CREATE
        )
      ),
      leaf(
        'retirements',
        L('Retirements', 'Kuwasilisha'),
        '/retirements',
        4,
        'cash-refund',
        any(P.IMPREST_RETIREMENTS_READ)
      ),
      // Deliberately ungated on web: approvers act via their role on the approval chain.
      leaf(
        'paLeaveRequests',
        L('Leave Requests', 'Maombi ya likizo'),
        '/humanResources/leave-requests',
        4,
        'beach'
      ),
      leaf(
        'paLoanRequests',
        L('Loan Requests', 'Maombi ya mkopo'),
        '/humanResources/loan-requests',
        4,
        'hand-coin-outline'
      ),
      leaf(
        'paPayrollRuns',
        L('Payroll Runs', 'Uendeshaji wa Mishahara'),
        '/humanResources/payroll-approvals',
        7,
        'cash-multiple',
        any(P.PAYROLLRUNS_CREATE)
      ),
      {
        id: 'paMasters',
        label: MASTERS,
        icon: 'tune-variant',
        gate: any(
          P.APPROVAL_CHAINS_CREATE,
          P.APPROVAL_CHAINS_READ,
          P.APPROVAL_CHAINS_EDIT,
          P.APPROVAL_CHAINS_DEACTIVATE
        ),
        children: [
          leaf(
            'approvalChains',
            L('Approval Chains', 'Minyororo ya Kuidhinisha'),
            '/approval-chains',
            4
          ),
        ],
      },
    ],
  },
  {
    id: 'pos',
    label: L('Point of Sale', 'Kituo Cha Mauzo'),
    icon: 'point-of-sale',
    gate: all(
      withOrg,
      sub(MODULES.POINT_OF_SALE),
      any(
        P.SALES_READ,
        P.PROFORMA_INVOICES_READ,
        P.OUTLETS_READ,
        P.PRICE_LISTS_READ,
        P.SALES_REPORTS
      )
    ),
    children: [
      {
        // WEB-QUIRK: web's per-item filters target the wrong level, so Sales is never hidden.
        id: 'posSales',
        label: L('Sales', 'Mauzo'),
        icon: 'cash-register',
        children: [
          leaf('salesCounter', L('Sales Counter', 'Kaunta ya Uuzaji'), '/pos/sales-counters', 9),
          leaf('proformas', L('Proformas', 'Profoma'), '/pos/proformas', 9),
        ],
      },
      leaf('posReports', REPORTS, '/pos/reports', 9, 'chart-bar', any(P.SALES_REPORTS)),
      {
        id: 'posMasters',
        label: MASTERS,
        icon: 'cog-outline',
        gate: any(P.OUTLETS_READ, P.POS_SETTINGS, P.PRICE_LISTS_READ, P.PRICE_LISTS_CREATE),
        children: [
          leaf(
            'outlets',
            L('Outlets', 'Sehemu za Uuzaji'),
            '/pos/outlets',
            9,
            undefined,
            any(P.OUTLETS_READ)
          ),
          leaf(
            'posPriceLists',
            L('Price Lists', 'Orodha za Bei'),
            '/pos/price_lists',
            9,
            undefined,
            any(P.PRICE_LISTS_READ, P.PRICE_LISTS_CREATE, P.PRICE_LISTS_EDIT, P.PRICE_LISTS_DELETE)
          ),
          leaf(
            'posSettings',
            L('Settings', 'Mipangilio'),
            '/pos/pos-settings',
            9,
            undefined,
            any(P.POS_SETTINGS)
          ),
        ],
      },
    ],
  },
  {
    id: 'fuelStations',
    label: L('Fuel Stations', 'Vituo vya Mafuta'),
    icon: 'gas-station-outline',
    gate: all(
      withOrg,
      sub(MODULES.FUEL_STATION),
      any(
        P.FUEL_STATIONS_READ,
        P.FUEL_STATIONS_CREATE,
        P.FUEL_STATIONS_UPDATE,
        P.FUEL_STATIONS_DELETE,
        P.FUEL_SALES_SHIFTS_READ,
        P.FUEL_SALES_SHIFTS_CREATE,
        P.FUEL_SALES_SHIFTS_UPDATE,
        P.FUEL_SALES_SHIFTS_CLOSE,
        P.FUEL_SALES_SHIFTS_DELETE
      )
    ),
    children: [
      leaf(
        'salesShifts',
        L('Sales Shifts', 'Mabadiliko ya Mauzo'),
        '/fuelStations/salesShifts',
        12,
        'clock-outline',
        any(
          P.FUEL_SALES_SHIFTS_READ,
          P.FUEL_SALES_SHIFTS_CREATE,
          P.FUEL_SALES_SHIFTS_UPDATE,
          P.FUEL_SALES_SHIFTS_DELETE
        )
      ),
      leaf(
        'dippings',
        L('Dippings', 'Kupima Kina cha Mafuta'),
        '/fuelStations/dippings',
        12,
        'ruler'
      ),
      leaf('fuelReports', REPORTS, '/fuelStations/reports', 12, 'chart-box-outline'),
      {
        id: 'fuelMasters',
        label: MASTERS,
        icon: 'tune-variant',
        gate: any(
          P.FUEL_STATIONS_READ,
          P.FUEL_STATIONS_CREATE,
          P.FUEL_STATIONS_UPDATE,
          P.FUEL_STATIONS_DELETE,
          P.PRICE_LISTS_READ,
          P.PRICE_LISTS_CREATE,
          P.PRICE_LISTS_EDIT,
          P.PRICE_LISTS_DELETE
        ),
        children: [
          leaf(
            'stations',
            L('Stations', 'Vituo'),
            '/fuelStations/stations',
            12,
            undefined,
            any(
              P.FUEL_STATIONS_READ,
              P.FUEL_STATIONS_CREATE,
              P.FUEL_STATIONS_UPDATE,
              P.FUEL_STATIONS_DELETE
            )
          ),
          leaf(
            'fuelPriceLists',
            L('Price Lists', 'Orodha za Bei'),
            '/fuelStations/price_lists',
            12,
            undefined,
            any(P.PRICE_LISTS_READ, P.PRICE_LISTS_CREATE, P.PRICE_LISTS_EDIT, P.PRICE_LISTS_DELETE)
          ),
        ],
      },
    ],
  },
  {
    // Web renders Bio Production before Manufacturing (code order, not menu-items order).
    id: 'bioProduction',
    label: L('Bio Production', 'Uzalishaji wa Kibaiolojia'),
    icon: 'sprout-outline',
    gate: all(withOrg, sub(MODULES.BIO_PRODUCTION)),
    children: [
      leaf(
        'bioDashboard',
        L('Dashboard', 'Dashibodi'),
        '/bioProduction/dashboard',
        12,
        'view-dashboard-outline',
        any(P.BIO_DASHBOARD_READ)
      ),
      leaf(
        'bioBatches',
        L('Batches', 'Makundi'),
        '/bioProduction/batches',
        12,
        'layers-outline',
        any(P.BIO_BATCHES_READ)
      ),
      {
        id: 'dailyRecords',
        label: L('Daily Records', 'Rekodi za Kila Siku'),
        icon: 'calendar-check-outline',
        children: [
          leaf(
            'feedingRound',
            L('Feeding', 'Ulishaji'),
            '/bioProduction/rounds/feeding',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
          leaf(
            'mortalityRound',
            L('Mortality', 'Vifo'),
            '/bioProduction/rounds/mortality',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
          leaf(
            'weightsRound',
            L('Weight Samples', 'Sampuli za Uzito'),
            '/bioProduction/rounds/weights',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
          leaf(
            'costsRound',
            L('Costs', 'Gharama'),
            '/bioProduction/rounds/costs',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
          leaf(
            'harvestRound',
            L('Harvest', 'Mavuno'),
            '/bioProduction/rounds/harvests',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
          leaf(
            'produceRound',
            L('Produce', 'Mazao'),
            '/bioProduction/rounds/produce',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
          leaf(
            'measurementsRound',
            L('Measurements', 'Vipimo'),
            '/bioProduction/rounds/measurements',
            12,
            undefined,
            any(P.BIO_RECORDS_READ)
          ),
        ],
      },
      {
        id: 'bioMasters',
        label: MASTERS,
        icon: 'tune-variant',
        children: [
          leaf(
            'farms',
            L('Farms', 'Mashamba'),
            '/bioProduction/farms',
            12,
            undefined,
            any(P.BIO_FARMS_READ, P.BIO_FARMS_CREATE, P.BIO_FARMS_EDIT, P.BIO_FARMS_DELETE)
          ),
          leaf(
            'productionUnits',
            L('Production Units', 'Vitengo vya Uzalishaji'),
            '/bioProduction/productionUnits',
            12,
            undefined,
            any(
              P.BIO_PRODUCTION_UNITS_READ,
              P.BIO_PRODUCTION_UNITS_CREATE,
              P.BIO_PRODUCTION_UNITS_EDIT,
              P.BIO_PRODUCTION_UNITS_DELETE
            )
          ),
          leaf(
            'speciesTemplates',
            L('Species Templates', 'Violezo vya Spishi'),
            '/bioProduction/speciesTemplates',
            12,
            undefined,
            any(
              P.BIO_SPECIES_TEMPLATES_READ,
              P.BIO_SPECIES_TEMPLATES_CREATE,
              P.BIO_SPECIES_TEMPLATES_EDIT,
              P.BIO_SPECIES_TEMPLATES_DELETE
            )
          ),
          leaf(
            'measurementParameters',
            L('Measurement Parameters', 'Vigezo vya Vipimo'),
            '/bioProduction/measurementParameters',
            12,
            undefined,
            any(
              P.BIO_MEASUREMENT_PARAMETERS_READ,
              P.BIO_MEASUREMENT_PARAMETERS_CREATE,
              P.BIO_MEASUREMENT_PARAMETERS_EDIT,
              P.BIO_MEASUREMENT_PARAMETERS_DELETE
            )
          ),
        ],
      },
    ],
  },
  {
    id: 'manufacturing',
    label: L('Manufacturing', 'Viwanda'),
    icon: 'factory',
    gate: all(
      withOrg,
      sub(MODULES.MANUFACTURING_AND_PROCESSING),
      any(
        P.BOM_READ,
        P.BOM_CREATE,
        P.BOM_EDIT,
        P.BOM_DELETE,
        P.PRODUCTION_BATCHES_CREATE,
        P.PRODUCTION_BATCHES_READ,
        P.PRODUCTION_BATCHES_EDIT,
        P.PRODUCTION_BATCHES_DELETE,
        P.MANUFACTURING_ORDERS_CREATE,
        P.MANUFACTURING_ORDERS_READ,
        P.MANUFACTURING_ORDERS_EDIT,
        P.MANUFACTURING_ORDERS_DELETE
      )
    ),
    // WEB-QUIRK: web's BOMs filter misses (wrong level), so no item here is gated individually.
    children: [
      leaf(
        'productionBatches',
        L('Production Batches', 'Sehemu za Uzalishaji'),
        '/manufacturing/batches',
        12,
        'file-document-edit-outline'
      ),
      leaf('manufacturingReports', REPORTS, '/manufacturing/reports', 12, 'chart-box-outline'),
      {
        id: 'manufacturingMasters',
        label: MASTERS,
        icon: 'tune-variant',
        children: [leaf('boms', L('BOMs'), '/manufacturing/boms', 12)],
      },
    ],
  },
  {
    id: 'projectManagement',
    label: L('Project Management', 'Usimamizi wa Miradi'),
    icon: 'briefcase-outline',
    gate: all(
      withOrg,
      sub(MODULES.PROJECT_MANAGEMENT),
      any(
        P.PROJECTS_READ,
        P.PROJECTS_CREATE,
        P.PROJECTS_EDIT,
        P.PROJECTS_DELETE,
        P.PROJECT_CATEGORIES_EDIT,
        P.PROJECT_CATEGORIES_CREATE,
        P.PROJECT_CATEGORIES_READ,
        P.PROJECT_CATEGORIES_DELETE
      )
    ),
    children: [
      leaf(
        'projects',
        L('Projects', 'Miradi'),
        '/projectManagement/projects',
        11,
        'folder-outline',
        any(P.PROJECTS_READ, P.PROJECTS_CREATE, P.PROJECTS_EDIT, P.PROJECTS_DELETE)
      ),
      leaf(
        'subcontractCertificates',
        L('Subcontract Certificates', 'Vyeti vya Kandarasi Ndogo'),
        '/projectManagement/approvedSubcontractCertificates',
        11,
        'certificate-outline',
        any(P.PROJECT_SUBCONTRACT_CERTIFICATES_APPROVE)
      ),
      leaf(
        'projectPaymentClaims',
        L('Project Payment Claims', 'Madai ya Malipo ya Mradi'),
        '/projectManagement/approvedProjectPaymentClaims',
        11,
        'cash-check',
        any(P.PROJECT_PAYMENT_CLAIMS_APPROVE)
      ),
      leaf(
        'projectReports',
        REPORTS,
        '/projectManagement/reports',
        11,
        'chart-box-outline',
        any(P.PROJECTS_REPORTS)
      ),
      {
        id: 'projectMasters',
        label: MASTERS,
        icon: 'file-tree-outline',
        gate: any(
          P.PROJECT_CATEGORIES_READ,
          P.PROJECT_CATEGORIES_CREATE,
          P.PROJECT_CATEGORIES_EDIT,
          P.PROJECT_CATEGORIES_DELETE
        ),
        children: [
          leaf(
            'projectCategories',
            L('Project Categories', 'Aina za Miradi'),
            '/projectManagement/projectCategories',
            11
          ),
        ],
      },
    ],
  },
  {
    id: 'accounts',
    label: L('Accounts & Finance', 'Akaunti na Fedha'),
    icon: 'bank-outline',
    gate: all(
      withOrg,
      sub(MODULES.ACCOUNTS_AND_FINANCE),
      any(
        P.ACCOUNTS_MASTERS_READ,
        P.ACCOUNTS_MASTERS_CREATE,
        P.ACCOUNTS_TRANSACTIONS_CREATE,
        P.ACCOUNTS_REPORTS,
        P.BUDGETS_READ
      )
    ),
    children: [
      leaf(
        'approvedPayments',
        L('Approved Payments', 'Malipo Yaliyoidhinishwa'),
        '/accounts/approvedPayments',
        10,
        'cash-check',
        sub(MODULES.PROCESS_APPROVAL)
      ),
      // WEB-QUIRK: web's filters for these two can never fire, so both are always shown.
      leaf(
        'approvedPayrollRuns',
        L('Approved Payroll', 'Mishahara Iliyoidhinishwa'),
        '/accounts/approvedPayrollRuns',
        10,
        'account-cash-outline'
      ),
      leaf(
        'approvedLoans',
        L('Approved Loans', 'Mikopo Iliyoidhinishwa'),
        '/accounts/approvedLoans',
        10,
        'hand-coin-outline'
      ),
      leaf(
        'transactions',
        L('Transactions', 'Shughuli'),
        '/accounts/transactions',
        10,
        'swap-horizontal',
        any(
          P.ACCOUNTS_TRANSACTIONS_READ,
          P.ACCOUNTS_TRANSACTIONS_CREATE,
          P.ACCOUNTS_TRANSACTIONS_DELETE,
          P.ACCOUNTS_TRANSACTIONS_EDIT,
          P.PAYMENTS_READ,
          P.PAYMENTS_CREATE,
          P.PAYMENTS_EDIT,
          P.PAYMENTS_DELETE,
          P.FUND_TRANSFERS_READ,
          P.FUND_TRANSFERS_CREATE,
          P.FUND_TRANSFERS_DELETE,
          P.FUND_TRANSFERS_EDIT,
          P.RECEIPTS_READ,
          P.RECEIPTS_EDIT,
          P.RECEIPTS_CREATE,
          P.RECEIPTS_DELETE,
          P.JOURNAL_VOUCHERS_READ,
          P.JOURNAL_VOUCHERS_CREATE,
          P.JOURNAL_VOUCHERS_DELETE,
          P.JOURNAL_VOUCHERS_EDIT
        )
      ),
      leaf(
        'recurringTransactions',
        L('Recurring Transactions', 'Miamala Inayojirudia'),
        '/accounts/recurring-transactions',
        10,
        'repeat',
        any(P.RECURRING_TRANSACTIONS_READ)
      ),
      leaf(
        'bankReconciliation',
        L('Bank Reconciliation', 'Upatanisho wa Benki'),
        '/accounts/bank-reconciliation',
        10,
        'scale-balance',
        any(
          P.BANK_RECONCILIATION_READ,
          P.BANK_RECONCILIATION_CREATE,
          P.BANK_RECONCILIATION_EDIT,
          P.BANK_RECONCILIATION_DELETE
        )
      ),
      leaf(
        'supplierBills',
        L('Supplier Bills', 'Bili za Wasambazaji'),
        '/accounts/supplierBills',
        10,
        'receipt-text-outline',
        all(
          (ctx) =>
            !!ctx.setting('defer_grn_billing') ||
            !!ctx.setting('generate_invoices_for_project_certificates'),
          any(P.PURCHASES_READ, P.PURCHASES_CREATE)
        )
      ),
      leaf(
        'customerInvoices',
        L('Customer Invoices', 'Ankara za Wateja'),
        '/accounts/customerInvoices',
        10,
        'file-document-outline',
        any(P.ACCOUNTS_TRANSACTIONS_READ)
      ),
      leaf(
        'accountsReports',
        REPORTS,
        '/accounts/reports',
        10,
        'chart-box-outline',
        any(P.ACCOUNTS_REPORTS)
      ),
      leaf(
        'budgets',
        L('Budgets', 'Bajeti'),
        '/accounts/budgets',
        10,
        'calculator-variant-outline'
      ),
      {
        id: 'accountsMasters',
        label: MASTERS,
        icon: 'currency-usd',
        gate: any(P.ACCOUNTS_MASTERS_READ, P.ACCOUNTS_MASTERS_CREATE),
        children: [
          leaf(
            'ledgerGroups',
            L('Ledger Groups', 'Makundi ya Vitabu vya Kumbukumbu'),
            '/accounts/ledger_groups',
            10
          ),
          leaf('ledgers', L('Ledgers', 'Vitabu vya Kumbukumbu'), '/accounts/ledgers', 10),
          leaf('userLedgers', L('User Ledgers'), '/accounts/user-ledgers', 10),
          leaf('costCenters', L('Cost Centers', 'Vituo vya Gharama'), '/cost_centers', 3),
        ],
      },
    ],
  },
  {
    id: 'assets',
    label: L('Asset Register', 'Daftari la Mali'),
    icon: 'archive-outline',
    gate: all(
      withOrg,
      sub(MODULES.ASSET_REGISTER),
      any(
        P.ASSETS_READ,
        P.ASSETS_CREATE,
        P.ASSETS_EDIT,
        P.ASSETS_DELETE,
        P.ASSETS_SETUP,
        P.ASSETS_DEPRECIATE,
        P.ASSETS_DISPOSE
      )
    ),
    children: [
      leaf(
        'assetRegister',
        L('Register', 'Daftari'),
        '/assets',
        13,
        'archive-outline',
        any(P.ASSETS_READ, P.ASSETS_CREATE, P.ASSETS_EDIT, P.ASSETS_DELETE)
      ),
      leaf(
        'depreciationRuns',
        L('Depreciation Runs', 'Uendeshaji wa Uchakavu'),
        '/assets/depreciation-runs',
        13,
        'trending-down',
        any(P.ASSETS_READ, P.ASSETS_DEPRECIATE)
      ),
      leaf('assetReports', REPORTS, '/assets/reports', 13, 'chart-box-outline', any(P.ASSETS_READ)),
      {
        id: 'assetMasters',
        label: MASTERS,
        icon: 'currency-usd',
        gate: any(P.ASSETS_SETUP),
        children: [
          leaf(
            'assetGlMappings',
            L('GL Mappings', 'Uunganishaji wa Daftari'),
            '/assets/gl-mappings',
            13
          ),
        ],
      },
    ],
  },
  {
    id: 'assetBookings',
    label: L('Asset Bookings', 'Uhifadhi wa Mali'),
    icon: 'calendar-clock-outline',
    gate: all(withOrg, sub(MODULES.ASSET_BOOKINGS), any(P.ASSET_BOOKINGS_READ)),
    children: [
      leaf('bookings', L('Bookings', 'Uhifadhi'), '/asset-bookings', 13, 'calendar-clock-outline'),
    ],
  },
  {
    id: 'procurement',
    label: L('Procurement & Supply', 'Ununuzi na Usambazaji'),
    icon: 'cart-outline',
    gate: all(
      withOrg,
      sub(MODULES.PROCUREMENT_AND_SUPPLY),
      any(
        P.PURCHASES_READ,
        P.PURCHASES_CREATE,
        P.PURCHASES_RECEIVE,
        P.PURCHASES_UNRECEIVE,
        P.RFQS_READ,
        P.RFQS_CREATE,
        P.RFQS_EDIT,
        P.RFQS_DELETE,
        P.PRODUCTS_READ,
        P.PRODUCTS_CREATE,
        P.PRODUCT_CATEGORIES_READ,
        P.PRODUCT_CATEGORIES_CREATE,
        P.STORES_READ,
        P.INVENTORY_TRANSFERS_READ,
        P.INVENTORY_TRANSFERS_CREATE,
        P.STORES_CREATE,
        P.INVENTORY_CONSUMPTIONS_READ,
        P.INVENTORY_CONSUMPTIONS_CREATE
      )
    ),
    children: [
      leaf(
        'rfqs',
        L('RFQs'),
        '/procurement/rfqs',
        8,
        'file-question-outline',
        any(P.RFQS_READ, P.RFQS_CREATE, P.RFQS_EDIT, P.RFQS_DELETE)
      ),
      leaf(
        'approvedPurchases',
        L('Approved Purchases', 'Manunuzi Yaliyoidhinishwa'),
        '/procurement/approvedPurchases',
        8,
        'cart-check',
        sub(MODULES.PROCESS_APPROVAL)
      ),
      leaf(
        'purchases',
        L('Purchases', 'Manunuzi'),
        '/procurement/purchases',
        8,
        'cart-outline',
        any(P.PURCHASES_READ, P.PURCHASES_CREATE, P.PURCHASES_RECEIVE, P.PURCHASES_UNRECEIVE)
      ),
      leaf(
        'consumptions',
        L('Consumptions', 'Matumizi'),
        '/procurement/consumptions',
        8,
        'package-down',
        any(P.INVENTORY_CONSUMPTIONS_READ, P.INVENTORY_CONSUMPTIONS_CREATE)
      ),
      leaf(
        'procurementReports',
        REPORTS,
        '/procurement/reports',
        8,
        'chart-bar',
        any(P.PURCHASES_REPORTS)
      ),
      {
        id: 'procurementMasters',
        label: MASTERS,
        icon: 'package-variant-closed',
        gate: any(
          P.PRODUCT_CATEGORIES_READ,
          P.STORES_READ,
          P.INVENTORY_TRANSFERS_READ,
          P.INVENTORY_TRANSFERS_CREATE,
          P.PRODUCTS_READ,
          P.INVENTORY_CONSUMPTIONS_READ,
          P.INVENTORY_CONSUMPTIONS_CREATE
        ),
        children: [
          leaf(
            'productCategories',
            L('Product Categories', 'Kategoria za Bidhaa'),
            '/procurement/product_categories',
            8,
            undefined,
            any(P.PRODUCT_CATEGORIES_READ, P.PRODUCT_CATEGORIES_CREATE)
          ),
          leaf(
            'products',
            L('Products', 'Bidhaa'),
            '/procurement/products',
            8,
            undefined,
            any(P.PRODUCTS_READ, P.PRODUCTS_CREATE)
          ),
          leaf(
            'stores',
            L('Stores', 'Maduka'),
            '/procurement/stores',
            8,
            undefined,
            any(
              P.STORES_READ,
              P.STORES_CREATE,
              P.INVENTORY_TRANSFERS_READ,
              P.INVENTORY_TRANSFERS_CREATE,
              P.INVENTORY_CONSUMPTIONS_READ,
              P.INVENTORY_CONSUMPTIONS_CREATE
            )
          ),
        ],
      },
    ],
  },
  {
    id: 'humanResources',
    label: L('Human Resources', 'Rasilimali Watu'),
    icon: 'account-group-outline',
    gate: all(
      withOrg,
      sub(MODULES.HUMAN_RESOURCES),
      any(
        P.EMPLOYEES_READ,
        P.EMPLOYEES_CREATE,
        P.EMPLOYEES_UPDATE,
        P.EMPLOYEES_DELETE,
        P.PAYROLLRUNS_CREATE,
        P.PAYROLL_READ,
        P.LEAVE_ALLOCATIONS_READ,
        P.LOANS_READ,
        P.LEAVE_REQUESTS_READ
      )
    ),
    children: [
      leaf(
        'hrDashboard',
        L('Dashboard', 'Dashibodi'),
        '/humanResources/dashboard',
        6,
        'view-dashboard-outline'
      ),
      leaf(
        'employees',
        L('Employees', 'Waajiriwa'),
        '/humanResources/employees',
        6,
        'badge-account-outline',
        any(P.EMPLOYEES_READ, P.EMPLOYEES_CREATE, P.EMPLOYEES_UPDATE, P.EMPLOYEES_DELETE)
      ),
      leaf(
        'orgChart',
        L('Org Chart', 'Muundo wa Shirika'),
        '/humanResources/orgChart',
        6,
        'file-tree-outline'
      ),
      leaf(
        'leaveRequests',
        L('Leave Requests', 'Maombi ya likizo'),
        '/humanResources/leave-requests',
        6,
        'beach',
        any(
          P.LEAVE_REQUESTS_CREATE,
          P.LEAVE_REQUESTS_DELETE,
          P.LEAVE_REQUESTS_READ,
          P.LEAVE_REQUESTS_EDIT
        )
      ),
      leaf(
        'loanRequests',
        L('Loan Requests', 'Maombi ya mkopo'),
        '/humanResources/loan-requests',
        6,
        'hand-coin-outline',
        any(P.LOANS_CREATE, P.LOANS_READ, P.LOANS_EDIT, P.LOANS_DELETE)
      ),
      leaf(
        'attendance',
        L('Attendance', 'Mahudhurio ya wafanyakazi'),
        '/humanResources/employeesAttendance',
        6,
        'calendar-account-outline'
      ),
      {
        id: 'payroll',
        label: L('Payroll', 'Mishahara'),
        icon: 'cash-multiple',
        gate: any(P.PAYROLL_READ, P.PAYROLLRUNS_CREATE),
        children: [
          leaf(
            'payrollRuns',
            L('Payroll Runs', 'Uendeshaji wa Mishahara'),
            '/humanResources/payroll-runs',
            7
          ),
          leaf(
            'payrollPeriods',
            L('Payroll Periods', 'Vipindi vya Mishahara'),
            '/humanResources/payroll-periods',
            7
          ),
        ],
      },
      leaf('hrReports', L('Reports'), '/humanResources/reports', 6, 'chart-box-outline'),
      {
        id: 'hrMasters',
        label: MASTERS,
        icon: 'briefcase-variant-outline',
        children: [
          leaf('departments', L('Departments', 'Idara'), '/humanResources/departments', 6),
          leaf('designations', L('Designations', 'Vyeo'), '/humanResources/designations', 6),
          leaf(
            'publicHolidays',
            L('Public Holidays', 'Sikukuu'),
            '/humanResources/publicHolidays',
            6
          ),
          leaf('leaveTypes', L('Leave Types', 'Likizo'), '/humanResources/leave_types', 6),
          leaf(
            'allowanceTypes',
            L('Allowance Types', 'Aina za marupurupu'),
            '/humanResources/allowance-types',
            6
          ),
          leaf(
            'deductionTypes',
            L('Deduction Types', 'Aina za makato'),
            '/humanResources/deduction-types',
            6
          ),
          leaf('overtimeTypes', L('Overtime Types'), '/humanResources/overtime-types', 6),
          leaf(
            'employerContributionTypes',
            L('Employer Contribution Types'),
            '/humanResources/employer-contribution-types',
            6
          ),
          leaf(
            'payeTaxBands',
            L('PAYE Tax Bands', 'Viwango vya kodi ya PAYE'),
            '/humanResources/paye-tax-bands',
            7
          ),
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: L('Tools', 'Zana'),
    icon: 'toolbox-outline',
    gate: all(withOrg, anySubscription, any(P.FILES_SHELF_BROWSE)),
    children: [
      leaf(
        'filesShelf',
        L('Files Shelf', 'Rafu ya Faili'),
        '/filesShelf',
        13,
        'folder-multiple-outline'
      ),
    ],
  },
  {
    id: 'masters',
    label: L('Masters', 'Wakuu'),
    icon: 'database-cog-outline',
    gate: all(
      withOrg,
      anySubscription,
      any(P.STAKEHOLDERS_READ, P.MEASUREMENT_UNITS_READ, P.ACCOUNTS_MASTERS_CREATE)
    ),
    children: [
      leaf(
        'currencies',
        L('Currencies', 'Sarafu'),
        '/masters/currencies',
        3,
        'currency-usd',
        any(P.ACCOUNTS_MASTERS_CREATE)
      ),
      leaf(
        'measurementUnits',
        L('Measurement Units', 'Vipimo'),
        '/masters/measurement_units',
        3,
        'scale',
        any(P.MEASUREMENT_UNITS_READ)
      ),
      leaf('banks', L('Banks', 'Benki'), '/masters/banks', 3, 'bank-outline'),
      leaf('auditTrail', L('Audit Trail'), '/audit-trail', 13, 'history', any(P.AUDIT_READ)),
      leaf(
        'accessControlReports',
        L('Access Control Reports', 'Ripoti za Udhibiti wa Ufikiaji'),
        '/accessControlReports',
        13,
        'shield-account-outline',
        any(P.ACCESS_CONTROL_REPORTS_READ)
      ),
      {
        id: 'stakeholders',
        label: L('Stakeholders'),
        icon: 'handshake-outline',
        children: [
          leaf(
            'stakeholdersList',
            L('List'),
            '/masters/stakeholders',
            3,
            undefined,
            any(P.STAKEHOLDERS_READ, P.STAKEHOLDERS_CREATE)
          ),
          leaf(
            'stakeholderGroups',
            L('Groups'),
            '/masters/stakeholderGroups',
            3,
            undefined,
            any(P.STAKEHOLDER_GROUPS_READ)
          ),
        ],
      },
    ],
  },
  {
    id: 'sms',
    label: L('SMS'),
    icon: 'message-text-outline',
    gate: all(withOrg, sub(MODULES.SMS), any(P.SMS_READ, P.SMS_SEND)),
    children: [leaf('smsOverview', L('Overview'), '/sms', 13, 'message-text-outline')],
  },
  {
    id: 'organizations',
    label: L('Organizations', 'Mashirika'),
    icon: 'domain',
    children: [
      {
        id: 'organizationsList',
        label: L('Organizations', 'Mashirika'),
        icon: 'domain',
        path: '/organizations',
        screen: 'Organizations',
      },
      leaf('invitations', L('Invitations', 'Mialiko'), '/invitations', 13, 'email-outline'),
    ],
  },
];

// Keeps nodes whose gate passes; groups/sections with no surviving children are dropped.
// Always works on a fresh copy (web mutates its menu tree in place, a bug we don't copy).
export const filterMenu = (nodes: MenuNode[], ctx: GateContext): MenuNode[] =>
  nodes.flatMap((node) => {
    if (node.gate && !node.gate(ctx)) return [];
    if (!node.children) return [{ ...node }];
    const children = filterMenu(node.children, ctx);
    return children.length ? [{ ...node, children }] : [];
  });
