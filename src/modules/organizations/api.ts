import { api } from '../../api/client';
import { toFormData, type PickedFile } from '../../api/upload';
import type { AuthOrganization, AuthUser, Organization, Paginated } from '../../auth/types';

// Every field of live-repo's OrganizationForm.tsx.
export type OrganizationValues = {
  id?: string;
  name: string;
  email?: string | null;
  phone: string;
  website?: string | null;
  tin?: string | null;
  address?: string | null;
  recording_start_date: string; // YYYY-MM-DD
  country_code: string;
  currency_code: string;
  vat_registered: boolean;
  vrn?: string | null;
  vat_percentage?: number | null;
  defer_grn_billing?: boolean;
  defer_project_certificate_invoicing?: boolean;
  generate_invoices_for_project_certificates?: boolean;
  standard_hours_per_month?: number | null;
  employee_number_prefix?: string | null;
  employee_number_padding?: number | null;
  symbol_path?: string | null;
  main_color: string;
  light_color: string;
  dark_color: string;
  contrast_text: string;
  tagline?: string | null;
  logo?: PickedFile | null;
  organization_symbol?: PickedFile | null;
};

export type CreateOrganizationResponse = {
  token?: string;
  newOrganization: AuthOrganization;
  authUser: AuthUser;
};

export type OrganizationListItem = Organization & {
  website?: string | null;
  autoload?: boolean;
  roles?: Array<{ id?: string | number; name: string }>; // the signed-in user's roles in it
};

export const organizationsApi = {
  // Web: OrganizationsList -> /api/organizations?keyword&page&limit
  async list(params: { keyword?: string; page?: number; limit?: number }) {
    const { keyword = '', page = 1, limit = 10 } = params;
    const { data } = await api.get<Paginated<OrganizationListItem>>('/organizations', {
      params: { keyword, page, limit },
    });
    return data;
  },

  // Web: AutoLoadButton -> PUT /api/organizations/{id}/autoload ->
  // /organizations/{id}/toggle_autoload
  async toggleAutoload(id: string | number, autoload: boolean) {
    const { data } = await api.put<{ message?: string }>(`/organizations/${id}/toggle_autoload`, {
      autoload,
    });
    return data;
  },

  // Web: EditOrganization -> /api/organizations/{id}/organizationDetails
  async details(id: string) {
    const { data } = await api.get<{ organization: Organization }>(`/organizations/${id}`);
    return data.organization;
  },

  // Web: OrganizationForm -> POST /api/organizations (multipart). Like PUT …/load, the
  // response carries a NEW token scoped to the new organization.
  async create(values: OrganizationValues) {
    const { data } = await api.post<CreateOrganizationResponse>(
      '/organizations',
      toFormData(values)
    );
    return data;
  },

  // Web: OrganizationForm (edit) -> POST /api/organizations/{id}/update ->
  // /organizations/update/{id}
  async update(id: string, values: OrganizationValues) {
    const { data } = await api.post<{ message?: string }>(
      `/organizations/update/${id}`,
      toFormData(values)
    );
    return data;
  },
};
