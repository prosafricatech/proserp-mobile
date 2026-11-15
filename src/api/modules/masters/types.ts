export type Id = number | string;

export type PageResult<T> = {
  data: T[];
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  next_page_url?: string | null;
};

export type Currency = {
  id: Id;
  name: string;
  code: string;
  symbol: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  name_plural: string;
  is_base: number;
  exchangeRate?: number;
};

export type MeasurementUnit = {
  id: Id;
  name: string;
  symbol: string;
  unit_symbol?: string;
  description?: string | null;
  conversion_factor?: number;
  allows_fractional?: boolean;
  dimension?: 'mass' | 'volume' | 'length' | null;
  base_factor?: number | string | null;
};

export type Bank = {
  id: Id;
  name: string;
  short_name?: string | null;
  swift_code?: string | null;
};

export type StakeholderType =
  | 'Individual'
  | 'Group'
  | 'Sole Proprietor'
  | 'Partnership'
  | 'Private Limited'
  | 'Public Liability'
  | 'Government Institution'
  | 'Non-Government Organization';

export type Stakeholder = {
  id: Id;
  name: string;
  type: StakeholderType;
  tin?: string | null;
  vrn?: string | null;
  ledger_code?: string | null;
  address?: string | null;
  currency_id?: Id | null;
  currency?: Pick<Currency, 'id' | 'name' | 'code' | 'symbol'> | null;
  email?: string | null;
  phone?: string | null;
  remarks?: string | null;
  groups?: { id: Id; name: string }[];
  website?: string | null;
  has_transactions?: boolean;
  create_receivable?: boolean;
  create_payable?: boolean;
};

export type StakeholderGroup = {
  id: Id;
  name: string;
  description?: string | null;
  stakeholders_count?: number;
};

export type CostCenter = {
  id: Id;
  name: string;
  code?: string | null;
  description?: string | null;
  status?: string;
  type?: string;
  cost_centerable_id?: Id;
  cost_centerable?: { id: Id; name: string; type: string };
  users?: { id: Id; name: string }[];
};

export type OrganizationUser = { id: Id; name: string; email?: string };
