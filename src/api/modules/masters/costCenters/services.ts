import { api } from '../../../client';
import type { CostCenter, OrganizationUser, PageResult } from '../types';

export const costCentersApi = {
  async list(params: { page: number; limit: number; keyword?: string }) {
    const { data } = await api.get<PageResult<CostCenter>>('/cost-centers', {
      params,
    });
    return data;
  },
  async listAll() {
    const { data } = await api.get<CostCenter[]>('/all-cost-centers', { params: { type: 'all' } });
    return data;
  },
  async details(id: string | number) {
    const { data } = await api.get(`/cost-centers/${id}`);
    return data;
  },
  async organizationUsers(organizationId: string | number, keyword = '') {
    const { data } = await api.get<OrganizationUser[]>(`/organizations/${organizationId}/users`, {
      params: { keyword },
    });
    return data;
  },
  async create(values: {
    name: string;
    description?: string | null;
    user_ids: (number | string)[];
  }) {
    const { data } = await api.post('/cost-centers', values);
    return data;
  },
  async update(values: CostCenter & { user_ids: (number | string)[] }) {
    const { data } = await api.put(`/cost-centers/${values.id}`, values);
    return data;
  },
  async remove(id: string | number) {
    const { data } = await api.delete(`/cost-centers/${id}`);
    return data;
  },
};
