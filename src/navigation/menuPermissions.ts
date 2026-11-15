import { MODULES } from '../constants/modules';
import { PERMISSIONS as P } from '../constants/permissions';
import type { MenuNode } from './moduleRegistry';

// Menu access rules ported from live-repo's Sidebar.js. Keep them separate from menu structure.
export type GateContext = {
  hasOrganization: boolean;
  subscriptionsCount: number;
  subscribed: (modules: string | string[]) => boolean;
  org: (permissions: string | string[]) => boolean;
  setting: (name: string) => unknown;
};

export type Gate = (ctx: GateContext) => boolean;

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
    gates.every((gate) => gate(ctx));
const withOrg: Gate = (ctx) => ctx.hasOrganization;
const anySubscription: Gate = (ctx) => ctx.subscriptionsCount > 0;

// WEB-QUIRK: this gate intentionally omits Requisitions:Read, matching the current web sidebar.
// WEB-QUIRK: `posSales`, `boms`, `approvedPayrollRuns`, and `approvedLoans` have no individual
// gate because the corresponding web item filters target the wrong menu level.
const MENU_GATES: Record<string, Gate> = {
  processApproval: all(withOrg, sub(MODULES.PROCESS_APPROVAL)),
  requisitions: any(P.REQUISITIONS_CREATE, P.REQUISITIONS_EDIT, P.REQUISITIONS_DELETE),
  approvals: any(
    P.APPROVED_REQUISITIONS_PAY,
    P.APPROVED_REQUISITIONS_PURCHASE,
    P.IMPREST_RETIREMENTS_READ,
    P.INVENTORY_CONSUMPTIONS_CREATE,
    P.ACCOUNTS_TRANSACTIONS_READ,
    P.PURCHASES_CREATE
  ),
  retirements: any(P.IMPREST_RETIREMENTS_READ),
  paPayrollRuns: any(P.PAYROLLRUNS_CREATE),
  paMasters: any(
    P.APPROVAL_CHAINS_CREATE,
    P.APPROVAL_CHAINS_READ,
    P.APPROVAL_CHAINS_EDIT,
    P.APPROVAL_CHAINS_DEACTIVATE
  ),
  pos: all(
    withOrg,
    sub(MODULES.POINT_OF_SALE),
    any(P.SALES_READ, P.PROFORMA_INVOICES_READ, P.OUTLETS_READ, P.PRICE_LISTS_READ, P.SALES_REPORTS)
  ),
  posReports: any(P.SALES_REPORTS),
  posMasters: any(P.OUTLETS_READ, P.POS_SETTINGS, P.PRICE_LISTS_READ, P.PRICE_LISTS_CREATE),
  outlets: any(P.OUTLETS_READ),
  posPriceLists: any(
    P.PRICE_LISTS_READ,
    P.PRICE_LISTS_CREATE,
    P.PRICE_LISTS_EDIT,
    P.PRICE_LISTS_DELETE
  ),
  posSettings: any(P.POS_SETTINGS),
  fuelStations: all(
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
  salesShifts: any(
    P.FUEL_SALES_SHIFTS_READ,
    P.FUEL_SALES_SHIFTS_CREATE,
    P.FUEL_SALES_SHIFTS_UPDATE,
    P.FUEL_SALES_SHIFTS_DELETE
  ),
  fuelMasters: any(
    P.FUEL_STATIONS_READ,
    P.FUEL_STATIONS_CREATE,
    P.FUEL_STATIONS_UPDATE,
    P.FUEL_STATIONS_DELETE,
    P.PRICE_LISTS_READ,
    P.PRICE_LISTS_CREATE,
    P.PRICE_LISTS_EDIT,
    P.PRICE_LISTS_DELETE
  ),
  stations: any(
    P.FUEL_STATIONS_READ,
    P.FUEL_STATIONS_CREATE,
    P.FUEL_STATIONS_UPDATE,
    P.FUEL_STATIONS_DELETE
  ),
  fuelPriceLists: any(
    P.PRICE_LISTS_READ,
    P.PRICE_LISTS_CREATE,
    P.PRICE_LISTS_EDIT,
    P.PRICE_LISTS_DELETE
  ),
  bioProduction: all(withOrg, sub(MODULES.BIO_PRODUCTION)),
  bioDashboard: any(P.BIO_DASHBOARD_READ),
  bioBatches: any(P.BIO_BATCHES_READ),
  feedingRound: any(P.BIO_RECORDS_READ),
  mortalityRound: any(P.BIO_RECORDS_READ),
  weightsRound: any(P.BIO_RECORDS_READ),
  costsRound: any(P.BIO_RECORDS_READ),
  harvestRound: any(P.BIO_RECORDS_READ),
  produceRound: any(P.BIO_RECORDS_READ),
  measurementsRound: any(P.BIO_RECORDS_READ),
  farms: any(P.BIO_FARMS_READ, P.BIO_FARMS_CREATE, P.BIO_FARMS_EDIT, P.BIO_FARMS_DELETE),
  productionUnits: any(
    P.BIO_PRODUCTION_UNITS_READ,
    P.BIO_PRODUCTION_UNITS_CREATE,
    P.BIO_PRODUCTION_UNITS_EDIT,
    P.BIO_PRODUCTION_UNITS_DELETE
  ),
  speciesTemplates: any(
    P.BIO_SPECIES_TEMPLATES_READ,
    P.BIO_SPECIES_TEMPLATES_CREATE,
    P.BIO_SPECIES_TEMPLATES_EDIT,
    P.BIO_SPECIES_TEMPLATES_DELETE
  ),
  measurementParameters: any(
    P.BIO_MEASUREMENT_PARAMETERS_READ,
    P.BIO_MEASUREMENT_PARAMETERS_CREATE,
    P.BIO_MEASUREMENT_PARAMETERS_EDIT,
    P.BIO_MEASUREMENT_PARAMETERS_DELETE
  ),
  manufacturing: all(
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
  projectManagement: all(
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
  projects: any(P.PROJECTS_READ, P.PROJECTS_CREATE, P.PROJECTS_EDIT, P.PROJECTS_DELETE),
  subcontractCertificates: any(P.PROJECT_SUBCONTRACT_CERTIFICATES_APPROVE),
  projectPaymentClaims: any(P.PROJECT_PAYMENT_CLAIMS_APPROVE),
  projectReports: any(P.PROJECTS_REPORTS),
  projectMasters: any(
    P.PROJECT_CATEGORIES_READ,
    P.PROJECT_CATEGORIES_CREATE,
    P.PROJECT_CATEGORIES_EDIT,
    P.PROJECT_CATEGORIES_DELETE
  ),
  accounts: all(
    withOrg,
    sub(MODULES.ACCOUNTS_AND_FINANCE),
    any(
      P.ACCOUNTS_MASTERS_READ,
      P.ACCOUNTS_MASTERS_CREATE,
      P.COST_CENTERS_ALL,
      P.ACCOUNTS_TRANSACTIONS_CREATE,
      P.ACCOUNTS_REPORTS,
      P.BUDGETS_READ
    )
  ),
  approvedPayments: sub(MODULES.PROCESS_APPROVAL),
  transactions: any(
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
  ),
  recurringTransactions: any(P.RECURRING_TRANSACTIONS_READ),
  bankReconciliation: any(
    P.BANK_RECONCILIATION_READ,
    P.BANK_RECONCILIATION_CREATE,
    P.BANK_RECONCILIATION_EDIT,
    P.BANK_RECONCILIATION_DELETE
  ),
  supplierBills: all(
    (ctx) =>
      !!ctx.setting('defer_grn_billing') ||
      !!ctx.setting('generate_invoices_for_project_certificates'),
    any(P.PURCHASES_READ, P.PURCHASES_CREATE)
  ),
  customerInvoices: any(P.ACCOUNTS_TRANSACTIONS_READ),
  accountsReports: any(P.ACCOUNTS_REPORTS),
  accountsMasters: any(P.ACCOUNTS_MASTERS_READ, P.ACCOUNTS_MASTERS_CREATE, P.COST_CENTERS_ALL),
  assets: all(
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
  assetRegister: any(P.ASSETS_READ, P.ASSETS_CREATE, P.ASSETS_EDIT, P.ASSETS_DELETE),
  depreciationRuns: any(P.ASSETS_READ, P.ASSETS_DEPRECIATE),
  assetReports: any(P.ASSETS_READ),
  assetMasters: any(P.ASSETS_SETUP),
  assetBookings: all(withOrg, sub(MODULES.ASSET_BOOKINGS), any(P.ASSET_BOOKINGS_READ)),
  procurement: all(
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
  rfqs: any(P.RFQS_READ, P.RFQS_CREATE, P.RFQS_EDIT, P.RFQS_DELETE),
  approvedPurchases: sub(MODULES.PROCESS_APPROVAL),
  purchases: any(P.PURCHASES_READ, P.PURCHASES_CREATE, P.PURCHASES_RECEIVE, P.PURCHASES_UNRECEIVE),
  consumptions: any(P.INVENTORY_CONSUMPTIONS_READ, P.INVENTORY_CONSUMPTIONS_CREATE),
  procurementReports: any(P.PURCHASES_REPORTS),
  procurementMasters: any(
    P.PRODUCT_CATEGORIES_READ,
    P.STORES_READ,
    P.INVENTORY_TRANSFERS_READ,
    P.INVENTORY_TRANSFERS_CREATE,
    P.PRODUCTS_READ,
    P.INVENTORY_CONSUMPTIONS_READ,
    P.INVENTORY_CONSUMPTIONS_CREATE
  ),
  productCategories: any(P.PRODUCT_CATEGORIES_READ, P.PRODUCT_CATEGORIES_CREATE),
  products: any(P.PRODUCTS_READ, P.PRODUCTS_CREATE),
  stores: any(
    P.STORES_READ,
    P.STORES_CREATE,
    P.INVENTORY_TRANSFERS_READ,
    P.INVENTORY_TRANSFERS_CREATE,
    P.INVENTORY_CONSUMPTIONS_READ,
    P.INVENTORY_CONSUMPTIONS_CREATE
  ),
  humanResources: all(
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
  employees: any(P.EMPLOYEES_READ, P.EMPLOYEES_CREATE, P.EMPLOYEES_UPDATE, P.EMPLOYEES_DELETE),
  leaveRequests: any(
    P.LEAVE_REQUESTS_CREATE,
    P.LEAVE_REQUESTS_DELETE,
    P.LEAVE_REQUESTS_READ,
    P.LEAVE_REQUESTS_EDIT
  ),
  loanRequests: any(P.LOANS_CREATE, P.LOANS_READ, P.LOANS_EDIT, P.LOANS_DELETE),
  payroll: any(P.PAYROLL_READ, P.PAYROLLRUNS_CREATE),
  tools: all(withOrg, anySubscription, any(P.FILES_SHELF_BROWSE)),
  masters: all(
    withOrg,
    anySubscription,
    any(P.STAKEHOLDERS_READ, P.MEASUREMENT_UNITS_READ, P.ACCOUNTS_MASTERS_CREATE)
  ),
  currencies: any(P.ACCOUNTS_MASTERS_CREATE),
  costCenters: any(P.COST_CENTERS_ALL),
  measurementUnits: any(P.MEASUREMENT_UNITS_READ),
  auditTrail: any(P.AUDIT_READ),
  accessControlReports: any(P.ACCESS_CONTROL_REPORTS_READ),
  stakeholdersList: any(P.STAKEHOLDERS_READ, P.STAKEHOLDERS_CREATE),
  stakeholderGroups: any(P.STAKEHOLDER_GROUPS_READ),
  sms: all(withOrg, sub(MODULES.SMS), any(P.SMS_READ, P.SMS_SEND)),
};

// Keeps allowed nodes and drops empty groups after their children are filtered.
export const filterMenu = (nodes: MenuNode[], ctx: GateContext): MenuNode[] =>
  nodes.flatMap((node) => {
    const gate = MENU_GATES[node.id];
    if (gate && !gate(ctx)) return [];
    if (!node.children) return [{ ...node }];

    const children = filterMenu(node.children, ctx);
    return children.length ? [{ ...node, children }] : [];
  });
