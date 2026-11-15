import type { MenuLabelKey } from '../i18n/menu';
import type { MenuIconKey } from './menuIcons';

// Declarative menu structure ported from live-repo's src/utilities/constants/menu-items.tsx.
// Permission and subscription rules live separately in menuPermissions.ts.
//
// ProsControl is intentionally absent: it is platform admin, not part of the customer app.

export type MenuNode = {
  id: string;
  labelKey: MenuLabelKey;
  icon?: MenuIconKey;
  path?: string;
  screen?: 'Dashboard' | 'Organizations';
  children?: MenuNode[];
};

const MASTERS: MenuLabelKey = 'masters';
const REPORTS: MenuLabelKey = 'reports';
const leaf = (id: string, labelKey: MenuLabelKey, path: string, icon?: MenuIconKey): MenuNode => ({
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
        icon: 'dashboard',
        path: '/dashboard',
        screen: 'Dashboard',
      },
    ],
  },
  {
    id: 'processApproval',
    labelKey: 'processApproval',
    icon: 'processApproval',
    children: [
      leaf('requisitions', 'requisitions', '/requisitions', 'requisitions'),
      leaf('approvals', 'approvals', '/requisition-approvals', 'approvals'),
      leaf('retirements', 'retirements', '/retirements', 'retirements'),
      // Deliberately ungated on web: approvers act via their role on the approval chain.
      leaf('paLeaveRequests', 'leaveRequests', '/humanResources/leave-requests', 'leaveRequests'),
      leaf('paLoanRequests', 'loanRequests', '/humanResources/loan-requests', 'loanRequests'),
      leaf('paPayrollRuns', 'payrollRuns', '/humanResources/payroll-approvals', 'payroll'),
      {
        id: 'paMasters',
        labelKey: MASTERS,
        icon: 'masterSettings',
        children: [leaf('approvalChains', 'approvalChains', '/approval-chains')],
      },
    ],
  },
  {
    id: 'pos',
    labelKey: 'pointOfSale',
    icon: 'pointOfSale',
    children: [
      {
        id: 'posSales',
        labelKey: 'sales',
        icon: 'sales',
        children: [
          leaf('salesCounter', 'salesCounter', '/pos/sales-counters'),
          leaf('proformas', 'proformas', '/pos/proformas'),
        ],
      },
      leaf('posReports', REPORTS, '/pos/reports', 'posReports'),
      {
        id: 'posMasters',
        labelKey: MASTERS,
        icon: 'settings',
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
    icon: 'fuelStations',
    children: [
      leaf('salesShifts', 'salesShifts', '/fuelStations/salesShifts', 'fuelSalesShifts'),
      leaf('dippings', 'dippings', '/fuelStations/dippings', 'dippings'),
      leaf('fuelReports', REPORTS, '/fuelStations/reports', 'projectReports'),
      {
        id: 'fuelMasters',
        labelKey: MASTERS,
        icon: 'masterSettings',
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
    icon: 'bioProduction',
    children: [
      leaf('bioDashboard', 'dashboard', '/bioProduction/dashboard', 'dashboard'),
      leaf('bioBatches', 'batches', '/bioProduction/batches', 'bioBatches'),
      {
        id: 'dailyRecords',
        labelKey: 'dailyRecords',
        icon: 'dailyRecords',
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
        icon: 'masterSettings',
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
    icon: 'manufacturing',
    children: [
      leaf('productionBatches', 'productionBatches', '/manufacturing/batches', 'requisitions'),
      leaf('manufacturingReports', REPORTS, '/manufacturing/reports', 'projectReports'),
      {
        id: 'manufacturingMasters',
        labelKey: MASTERS,
        icon: 'masterSettings',
        children: [leaf('boms', 'boms', '/manufacturing/boms')],
      },
    ],
  },
  {
    id: 'projectManagement',
    labelKey: 'projectManagement',
    icon: 'projects',
    children: [
      leaf('projects', 'projects', '/projectManagement/projects', 'projectList'),
      leaf(
        'subcontractCertificates',
        'subcontractCertificates',
        '/projectManagement/approvedSubcontractCertificates',
        'certificates'
      ),
      leaf(
        'projectPaymentClaims',
        'projectPaymentClaims',
        '/projectManagement/approvedProjectPaymentClaims',
        'approvedPayments'
      ),
      leaf('projectReports', REPORTS, '/projectManagement/reports', 'projectReports'),
      {
        id: 'projectMasters',
        labelKey: MASTERS,
        icon: 'projectMasters',
        children: [
          leaf('projectCategories', 'projectCategories', '/projectManagement/projectCategories'),
        ],
      },
    ],
  },
  {
    id: 'accounts',
    labelKey: 'accountsFinance',
    icon: 'accountsFinance',
    children: [
      leaf(
        'approvedPayments',
        'approvedPayments',
        '/accounts/approvedPayments',
        'approvedPayments'
      ),
      leaf(
        'approvedPayrollRuns',
        'approvedPayroll',
        '/accounts/approvedPayrollRuns',
        'payrollApprovals'
      ),
      leaf('approvedLoans', 'approvedLoans', '/accounts/approvedLoans', 'loanRequests'),
      leaf('transactions', 'transactions', '/accounts/transactions', 'transactions'),
      leaf(
        'recurringTransactions',
        'recurringTransactions',
        '/accounts/recurring-transactions',
        'refresh'
      ),
      leaf(
        'bankReconciliation',
        'bankReconciliation',
        '/accounts/bank-reconciliation',
        'costCenters'
      ),
      leaf('supplierBills', 'supplierBills', '/accounts/supplierBills', 'supplierBills'),
      leaf('customerInvoices', 'customerInvoices', '/accounts/customerInvoices', 'invoices'),
      leaf('accountsReports', REPORTS, '/accounts/reports', 'projectReports'),
      leaf('budgets', 'budgets', '/accounts/budgets', 'budgets'),
      {
        id: 'accountsMasters',
        labelKey: MASTERS,
        icon: 'accountMasters',
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
    icon: 'assetRegister',
    children: [
      leaf('assetRegister', 'register', '/assets', 'assetRegister'),
      leaf('depreciationRuns', 'depreciationRuns', '/assets/depreciation-runs', 'depreciationRuns'),
      leaf('assetReports', REPORTS, '/assets/reports', 'projectReports'),
      {
        id: 'assetMasters',
        labelKey: MASTERS,
        icon: 'accountMasters',
        children: [leaf('assetGlMappings', 'glMappings', '/assets/gl-mappings')],
      },
    ],
  },
  {
    id: 'assetBookings',
    labelKey: 'assetBookings',
    icon: 'assetBookings',
    children: [leaf('bookings', 'bookings', '/asset-bookings', 'assetBookings')],
  },
  {
    id: 'procurement',
    labelKey: 'procurementSupply',
    icon: 'purchases',
    children: [
      leaf('rfqs', 'rfqs', '/procurement/rfqs', 'rfqs'),
      leaf('approvedPurchases', 'approvedPurchases', '/procurement/approvedPurchases', 'suppliers'),
      leaf('purchases', 'purchases', '/procurement/purchases', 'purchases'),
      leaf('consumptions', 'consumptions', '/procurement/consumptions', 'consumptions'),
      leaf('procurementReports', REPORTS, '/procurement/reports', 'posReports'),
      {
        id: 'procurementMasters',
        labelKey: MASTERS,
        icon: 'stores',
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
    icon: 'employees',
    children: [
      leaf('hrDashboard', 'dashboard', '/humanResources/dashboard', 'dashboard'),
      leaf('employees', 'employees', '/humanResources/employees', 'employee'),
      leaf('orgChart', 'orgChart', '/humanResources/orgChart', 'projectMasters'),
      leaf('leaveRequests', 'leaveRequests', '/humanResources/leave-requests', 'leaveRequests'),
      leaf('loanRequests', 'loanRequests', '/humanResources/loan-requests', 'loanRequests'),
      leaf('attendance', 'attendance', '/humanResources/employeesAttendance', 'attendance'),
      {
        id: 'payroll',
        labelKey: 'payroll',
        icon: 'payroll',
        children: [
          leaf('payrollRuns', 'payrollRuns', '/humanResources/payroll-runs'),
          leaf('payrollPeriods', 'payrollPeriods', '/humanResources/payroll-periods'),
        ],
      },
      leaf('hrReports', 'humanResourcesReports', '/humanResources/reports', 'projectReports'),
      {
        id: 'hrMasters',
        labelKey: MASTERS,
        icon: 'hrMasters',
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
    icon: 'tools',
    children: [leaf('filesShelf', 'filesShelf', '/filesShelf', 'filesShelf')],
  },
  {
    id: 'masters',
    labelKey: 'masters',
    icon: 'masters',
    children: [
      leaf('currencies', 'currencies', '/masters/currencies', 'accountMasters'),
      leaf(
        'measurementUnits',
        'measurementUnits',
        '/masters/measurement_units',
        'measurementUnits'
      ),
      leaf('banks', 'banks', '/masters/banks', 'accountsFinance'),
      leaf('auditTrail', 'auditTrail', '/audit-trail', 'auditTrail'),
      leaf(
        'accessControlReports',
        'accessControlReports',
        '/accessControlReports',
        'accessControl'
      ),
      {
        id: 'stakeholders',
        labelKey: 'stakeholders',
        icon: 'stakeholders',
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
    icon: 'sms',
    children: [leaf('smsOverview', 'overview', '/sms', 'sms')],
  },
  {
    id: 'organizations',
    labelKey: 'organizations',
    icon: 'organizations',
    children: [
      {
        id: 'organizationsList',
        labelKey: 'organizations',
        icon: 'organizations',
        path: '/organizations',
        screen: 'Organizations',
      },
      leaf('invitations', 'invitations', '/invitations', 'invitations'),
    ],
  },
];
