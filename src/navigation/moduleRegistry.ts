import type { MenuLabelKey } from '../i18n/menu';

// Declarative menu structure ported from live-repo's src/utilities/constants/menu-items.tsx.
// Permission and subscription rules live separately in menuPermissions.ts.
//
// ProsControl is intentionally absent: it is platform admin, not part of the customer app.

export type MenuNode = {
  id: string;
  labelKey: MenuLabelKey;
  icon?: string;
  path?: string;
  screen?: 'Dashboard' | 'Organizations';
  children?: MenuNode[];
};

const MASTERS: MenuLabelKey = 'masters';
const REPORTS: MenuLabelKey = 'reports';
const leaf = (id: string, labelKey: MenuLabelKey, path: string, icon?: string): MenuNode => ({
  id,
  labelKey,
  path,
  icon,
});

export const MENU: MenuNode[] = [
  {
    id: 'home',
    labelKey: 'home',
    children: [
      {
        id: 'dashboard',
        labelKey: 'dashboard',
        icon: 'view-dashboard-outline',
        path: '/dashboard',
        screen: 'Dashboard',
      },
    ],
  },
  {
    id: 'processApproval',
    labelKey: 'processApproval',
    icon: 'check-decagram-outline',
    children: [
      leaf('requisitions', 'requisitions', '/requisitions', 'file-document-edit-outline'),
      leaf('approvals', 'approvals', '/requisition-approvals', 'check-all'),
      leaf('retirements', 'retirements', '/retirements', 'cash-refund'),
      // Deliberately ungated on web: approvers act via their role on the approval chain.
      leaf('paLeaveRequests', 'leaveRequests', '/humanResources/leave-requests', 'beach'),
      leaf('paLoanRequests', 'loanRequests', '/humanResources/loan-requests', 'hand-coin-outline'),
      leaf('paPayrollRuns', 'payrollRuns', '/humanResources/payroll-approvals', 'cash-multiple'),
      {
        id: 'paMasters',
        labelKey: MASTERS,
        icon: 'tune-variant',
        children: [leaf('approvalChains', 'approvalChains', '/approval-chains')],
      },
    ],
  },
  {
    id: 'pos',
    labelKey: 'pointOfSale',
    icon: 'point-of-sale',
    children: [
      {
        id: 'posSales',
        labelKey: 'sales',
        icon: 'cash-register',
        children: [
          leaf('salesCounter', 'salesCounter', '/pos/sales-counters'),
          leaf('proformas', 'proformas', '/pos/proformas'),
        ],
      },
      leaf('posReports', REPORTS, '/pos/reports', 'chart-bar'),
      {
        id: 'posMasters',
        labelKey: MASTERS,
        icon: 'cog-outline',
        children: [
          leaf('outlets', 'outlets', '/pos/outlets', undefined),
          leaf('posPriceLists', 'priceLists', '/pos/price_lists', undefined),
          leaf('posSettings', 'settings', '/pos/pos-settings', undefined),
        ],
      },
    ],
  },
  {
    id: 'fuelStations',
    labelKey: 'fuelStations',
    icon: 'gas-station-outline',
    children: [
      leaf('salesShifts', 'salesShifts', '/fuelStations/salesShifts', 'clock-outline'),
      leaf('dippings', 'dippings', '/fuelStations/dippings', 'ruler'),
      leaf('fuelReports', REPORTS, '/fuelStations/reports', 'chart-box-outline'),
      {
        id: 'fuelMasters',
        labelKey: MASTERS,
        icon: 'tune-variant',
        children: [
          leaf('stations', 'stations', '/fuelStations/stations', undefined),
          leaf('fuelPriceLists', 'priceLists', '/fuelStations/price_lists', undefined),
        ],
      },
    ],
  },
  {
    // Web renders Bio Production before Manufacturing (code order, not menu-items order).
    id: 'bioProduction',
    labelKey: 'bioProduction',
    icon: 'sprout-outline',
    children: [
      leaf('bioDashboard', 'dashboard', '/bioProduction/dashboard', 'view-dashboard-outline'),
      leaf('bioBatches', 'batches', '/bioProduction/batches', 'layers-outline'),
      {
        id: 'dailyRecords',
        labelKey: 'dailyRecords',
        icon: 'calendar-check-outline',
        children: [
          leaf('feedingRound', 'feeding', '/bioProduction/rounds/feeding', undefined),
          leaf('mortalityRound', 'mortality', '/bioProduction/rounds/mortality', undefined),
          leaf('weightsRound', 'weightSamples', '/bioProduction/rounds/weights', undefined),
          leaf('costsRound', 'costs', '/bioProduction/rounds/costs', undefined),
          leaf('harvestRound', 'harvest', '/bioProduction/rounds/harvests', undefined),
          leaf('produceRound', 'produce', '/bioProduction/rounds/produce', undefined),
          leaf(
            'measurementsRound',
            'measurements',
            '/bioProduction/rounds/measurements',
            undefined
          ),
        ],
      },
      {
        id: 'bioMasters',
        labelKey: MASTERS,
        icon: 'tune-variant',
        children: [
          leaf('farms', 'farms', '/bioProduction/farms', undefined),
          leaf('productionUnits', 'productionUnits', '/bioProduction/productionUnits', undefined),
          leaf(
            'speciesTemplates',
            'speciesTemplates',
            '/bioProduction/speciesTemplates',
            undefined
          ),
          leaf(
            'measurementParameters',
            'measurementParameters',
            '/bioProduction/measurementParameters',
            undefined
          ),
        ],
      },
    ],
  },
  {
    id: 'manufacturing',
    labelKey: 'manufacturing',
    icon: 'factory',
    children: [
      leaf(
        'productionBatches',
        'productionBatches',
        '/manufacturing/batches',
        'file-document-edit-outline'
      ),
      leaf('manufacturingReports', REPORTS, '/manufacturing/reports', 'chart-box-outline'),
      {
        id: 'manufacturingMasters',
        labelKey: MASTERS,
        icon: 'tune-variant',
        children: [leaf('boms', 'boms', '/manufacturing/boms')],
      },
    ],
  },
  {
    id: 'projectManagement',
    labelKey: 'projectManagement',
    icon: 'briefcase-outline',
    children: [
      leaf('projects', 'projects', '/projectManagement/projects', 'folder-outline'),
      leaf(
        'subcontractCertificates',
        'subcontractCertificates',
        '/projectManagement/approvedSubcontractCertificates',
        'certificate-outline'
      ),
      leaf(
        'projectPaymentClaims',
        'projectPaymentClaims',
        '/projectManagement/approvedProjectPaymentClaims',
        'cash-check'
      ),
      leaf('projectReports', REPORTS, '/projectManagement/reports', 'chart-box-outline'),
      {
        id: 'projectMasters',
        labelKey: MASTERS,
        icon: 'file-tree-outline',
        children: [
          leaf('projectCategories', 'projectCategories', '/projectManagement/projectCategories'),
        ],
      },
    ],
  },
  {
    id: 'accounts',
    labelKey: 'accountsFinance',
    icon: 'bank-outline',
    children: [
      leaf('approvedPayments', 'approvedPayments', '/accounts/approvedPayments', 'cash-check'),
      leaf(
        'approvedPayrollRuns',
        'approvedPayroll',
        '/accounts/approvedPayrollRuns',
        'account-cash-outline'
      ),
      leaf('approvedLoans', 'approvedLoans', '/accounts/approvedLoans', 'hand-coin-outline'),
      leaf('transactions', 'transactions', '/accounts/transactions', 'swap-horizontal'),
      leaf(
        'recurringTransactions',
        'recurringTransactions',
        '/accounts/recurring-transactions',
        'repeat'
      ),
      leaf(
        'bankReconciliation',
        'bankReconciliation',
        '/accounts/bank-reconciliation',
        'scale-balance'
      ),
      leaf('supplierBills', 'supplierBills', '/accounts/supplierBills', 'receipt-text-outline'),
      leaf(
        'customerInvoices',
        'customerInvoices',
        '/accounts/customerInvoices',
        'file-document-outline'
      ),
      leaf('accountsReports', REPORTS, '/accounts/reports', 'chart-box-outline'),
      leaf('budgets', 'budgets', '/accounts/budgets', 'calculator-variant-outline'),
      {
        id: 'accountsMasters',
        labelKey: MASTERS,
        icon: 'currency-usd',
        children: [
          leaf('ledgerGroups', 'ledgerGroups', '/accounts/ledger_groups'),
          leaf('ledgers', 'ledgers', '/accounts/ledgers'),
          leaf('userLedgers', 'userLedgers', '/accounts/user-ledgers'),
          leaf('costCenters', 'costCenters', '/cost_centers'),
        ],
      },
    ],
  },
  {
    id: 'assets',
    labelKey: 'assetRegister',
    icon: 'archive-outline',
    children: [
      leaf('assetRegister', 'register', '/assets', 'archive-outline'),
      leaf('depreciationRuns', 'depreciationRuns', '/assets/depreciation-runs', 'trending-down'),
      leaf('assetReports', REPORTS, '/assets/reports', 'chart-box-outline'),
      {
        id: 'assetMasters',
        labelKey: MASTERS,
        icon: 'currency-usd',
        children: [leaf('assetGlMappings', 'glMappings', '/assets/gl-mappings')],
      },
    ],
  },
  {
    id: 'assetBookings',
    labelKey: 'assetBookings',
    icon: 'calendar-clock-outline',
    children: [leaf('bookings', 'bookings', '/asset-bookings', 'calendar-clock-outline')],
  },
  {
    id: 'procurement',
    labelKey: 'procurementSupply',
    icon: 'cart-outline',
    children: [
      leaf('rfqs', 'rfqs', '/procurement/rfqs', 'file-question-outline'),
      leaf(
        'approvedPurchases',
        'approvedPurchases',
        '/procurement/approvedPurchases',
        'cart-check'
      ),
      leaf('purchases', 'purchases', '/procurement/purchases', 'cart-outline'),
      leaf('consumptions', 'consumptions', '/procurement/consumptions', 'package-down'),
      leaf('procurementReports', REPORTS, '/procurement/reports', 'chart-bar'),
      {
        id: 'procurementMasters',
        labelKey: MASTERS,
        icon: 'package-variant-closed',
        children: [
          leaf(
            'productCategories',
            'productCategories',
            '/procurement/product_categories',
            undefined
          ),
          leaf('products', 'products', '/procurement/products', undefined),
          leaf('stores', 'stores', '/procurement/stores', undefined),
        ],
      },
    ],
  },
  {
    id: 'humanResources',
    labelKey: 'humanResources',
    icon: 'account-group-outline',
    children: [
      leaf('hrDashboard', 'dashboard', '/humanResources/dashboard', 'view-dashboard-outline'),
      leaf('employees', 'employees', '/humanResources/employees', 'badge-account-outline'),
      leaf('orgChart', 'orgChart', '/humanResources/orgChart', 'file-tree-outline'),
      leaf('leaveRequests', 'leaveRequests', '/humanResources/leave-requests', 'beach'),
      leaf('loanRequests', 'loanRequests', '/humanResources/loan-requests', 'hand-coin-outline'),
      leaf(
        'attendance',
        'attendance',
        '/humanResources/employeesAttendance',
        'calendar-account-outline'
      ),
      {
        id: 'payroll',
        labelKey: 'payroll',
        icon: 'cash-multiple',
        children: [
          leaf('payrollRuns', 'payrollRuns', '/humanResources/payroll-runs'),
          leaf('payrollPeriods', 'payrollPeriods', '/humanResources/payroll-periods'),
        ],
      },
      leaf('hrReports', 'humanResourcesReports', '/humanResources/reports', 'chart-box-outline'),
      {
        id: 'hrMasters',
        labelKey: MASTERS,
        icon: 'briefcase-variant-outline',
        children: [
          leaf('departments', 'departments', '/humanResources/departments'),
          leaf('designations', 'designations', '/humanResources/designations'),
          leaf('publicHolidays', 'publicHolidays', '/humanResources/publicHolidays'),
          leaf('leaveTypes', 'leaveTypes', '/humanResources/leave_types'),
          leaf('allowanceTypes', 'allowanceTypes', '/humanResources/allowance-types'),
          leaf('deductionTypes', 'deductionTypes', '/humanResources/deduction-types'),
          leaf('overtimeTypes', 'overtimeTypes', '/humanResources/overtime-types'),
          leaf(
            'employerContributionTypes',
            'employerContributionTypes',
            '/humanResources/employer-contribution-types'
          ),
          leaf('payeTaxBands', 'payeTaxBands', '/humanResources/paye-tax-bands'),
        ],
      },
    ],
  },
  {
    id: 'tools',
    labelKey: 'tools',
    icon: 'toolbox-outline',
    children: [leaf('filesShelf', 'filesShelf', '/filesShelf', 'folder-multiple-outline')],
  },
  {
    id: 'masters',
    labelKey: 'masters',
    icon: 'database-cog-outline',
    children: [
      leaf('currencies', 'currencies', '/masters/currencies', 'currency-usd'),
      leaf('measurementUnits', 'measurementUnits', '/masters/measurement_units', 'scale'),
      leaf('banks', 'banks', '/masters/banks', 'bank-outline'),
      leaf('auditTrail', 'auditTrail', '/audit-trail', 'history'),
      leaf(
        'accessControlReports',
        'accessControlReports',
        '/accessControlReports',
        'shield-account-outline'
      ),
      {
        id: 'stakeholders',
        labelKey: 'stakeholders',
        icon: 'handshake-outline',
        children: [
          leaf('stakeholdersList', 'list', '/masters/stakeholders', undefined),
          leaf('stakeholderGroups', 'groups', '/masters/stakeholderGroups', undefined),
        ],
      },
    ],
  },
  {
    id: 'sms',
    labelKey: 'sms',
    icon: 'message-text-outline',
    children: [leaf('smsOverview', 'overview', '/sms', 'message-text-outline')],
  },
  {
    id: 'organizations',
    labelKey: 'organizations',
    icon: 'domain',
    children: [
      {
        id: 'organizationsList',
        labelKey: 'organizations',
        icon: 'domain',
        path: '/organizations',
        screen: 'Organizations',
      },
      leaf('invitations', 'invitations', '/invitations', 'email-outline'),
    ],
  },
];
