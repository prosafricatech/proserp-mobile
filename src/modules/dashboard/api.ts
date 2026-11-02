import { api } from '../../api/client';

// Every endpoint behind live-repo's dashboard (src/components/dashboard/**), called directly
// instead of through the Next BFF routes. Params mirror what web sends; axios serialises
// arrays as key[]=1&key[]=2, exactly like web.

export type CostCenterIds = 'all' | Array<string | number>;
export type Interval = 'day' | 'week' | 'month' | 'year';
export type Range = { from: string; to: string; cost_center_ids: CostCenterIds };
export type PeriodAmount = { period: string; amount: number };

type Metric = { value: number; previous: number };
export type DashboardSummary = {
  currency_code?: string;
  period?: { previous_from: string; previous_to: string };
  income_statement?: Record<'revenue' | 'expenses' | 'net_profit', Metric>;
  balance_sheet?: Record<
    'assets' | 'liabilities' | 'equity' | 'cash' | 'receivables' | 'payables' | 'inventory',
    Metric
  >;
};

export type DueInvoice = {
  id: number;
  invoiceNo: string;
  name: string;
  due_date: string | null;
  is_overdue: boolean;
  currencyCode: string;
  amount: number;
};
export type DueInvoicesSummary = {
  incoming: DueInvoice[];
  outgoing: DueInvoice[];
  incoming_total?: number;
  outgoing_total?: number;
};

export type LowStockStore = {
  id: number;
  name: string;
  alerts: Array<{
    product_name: string;
    threshold: number;
    available_stock: number;
    cost_centers: Array<{ name: string }>;
  }>;
};

export type HrDashboard = {
  employees_on_leave: Array<{
    employee_id: number;
    employee_number?: string;
    employee_name: string;
    leave_type?: string;
    returns_in_days: number;
  }>;
  upcoming_birthdays: Array<{
    employee_id: number;
    employee_number?: string;
    employee_name: string;
    next_birthday: string;
    days_away: number;
  }>;
};

export type DippingStation = {
  id: number;
  name: string;
  report_data: Array<{
    as_at: string;
    readings: Array<{
      id: number;
      name: string;
      tanks: Array<{
        tank: string;
        reading: number;
        calculated_stock?: number;
        deviation?: number;
      }>;
    }>;
  }>;
};

export type ProductSale = {
  name: string;
  unit_symbol?: string;
  quantity: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin?: number;
};

export const dashboardApi = {
  // FinancialSummaryStrip -> /api/financialReports/dashboardSummary
  summary: (params: Range) =>
    api.get<DashboardSummary>('/accounts/dashboard-summary', { params }).then((r) => r.data),

  // ProfitAndLossTrendCard
  profitAndLossFigures: (params: Range & { aggregate_by: Interval }) =>
    api
      .get<{ incomeFigures: PeriodAmount[]; expenseFigures: PeriodAmount[] }>(
        '/accounts/profit-and-loss-figures',
        { params }
      )
      .then((r) => r.data),

  // BalanceSheetTrend
  balanceSheetFigures: (params: Range & { aggregate_by: Interval }) =>
    api
      .get<Array<{ period: string; assetsFigure: number; liabilitiesFigure: number }>>(
        '/accounts/balance-sheet-figures',
        { params }
      )
      .then((r) => r.data),

  // RevenueDistributionCard (ledgerGroupId 3) / ExpenseDistributionCard (ledgerGroupId 19)
  incomeFigures: (params: Range & { ledgerGroupId: number; group_by_ledgers: boolean }) =>
    api
      .get<Array<{ ledger_name: string; amount: number }>>('/accounts/income-figures', { params })
      .then((r) => r.data),
  expenseFigures: (params: Range & { ledgerGroupId: number; group_by_ledgers: boolean }) =>
    api
      .get<Array<{ ledger_name: string; amount: number }>>('/accounts/expense-figures', { params })
      .then((r) => r.data),

  // InventoryValueTrend
  inventoryValue: (params: Range & { aggregate_by: Interval; group_by: 'product_category' }) =>
    api
      .get<Array<{ asOf: string; groupedValues: Record<string, { balanceValue: number }> }>>(
        '/accounts/inventory-value',
        { params }
      )
      .then((r) => r.data),

  // PurchasesAndGrns
  purchaseValues: (params: Range & { aggregate_by: Interval }) =>
    api.get<PeriodAmount[]>('/purchase-values', { params }).then((r) => r.data),
  grnValues: (params: Range & { aggregate_by: Interval }) =>
    api.get<PeriodAmount[]>('/grn-values', { params }).then((r) => r.data),

  // DueInvoices + its "Mark as Paid" actions
  dueInvoicesSummary: (params: { as_at: string; cost_center_ids: CostCenterIds }) =>
    api.get<DueInvoicesSummary>('/due-invoices-summary', { params }).then((r) => r.data),
  markCustomerInvoicePaid: (id: number) =>
    api
      .post<{ message?: string }>(`/accounts/customer-invoices/${id}/mark-paid`)
      .then((r) => r.data),
  markPurchaseBillPaid: (id: number) =>
    api.post<{ message?: string }>(`/purchase-bills/${id}/mark-paid`).then((r) => r.data),

  // LowStockAlerts
  lowStockAlerts: (params: { as_of: string; cost_center_ids: CostCenterIds }) =>
    api.get<LowStockStore[]>('/low-stock-alerts', { params }).then((r) => r.data),

  // OnLeaveToday + BirthdaysToday (no params: not affected by the filters)
  hrDashboard: () => api.get<HrDashboard>('/hr-dashboard').then((r) => r.data),

  // DippingsCard (fuel_station_ids[] = cost_centerable_id of Fuel Station cost centers)
  dippingReport: (params: {
    from: string;
    to: string;
    fuel_station_ids: Array<number | string>;
    with_calculated_stock: 0 | 1;
  }) => api.get<DippingStation[]>('/fuel-stations/dipping-report', { params }).then((r) => r.data),

  // ProductSalesCard
  salesPeople: () => api.get<string[]>('/pos/sales-people').then((r) => r.data),
  productSales: (
    params: Range & {
      top: 'products' | 'product categories' | 'brands';
      order_by: 'profit' | 'revenue' | 'quantity' | 'cogs' | 'margin';
      order_direction: 'asc' | 'desc';
      limit: number;
      sales_persons: string[];
    }
  ) => api.get<ProductSale[]>('/product-sales', { params }).then((r) => r.data),
};
