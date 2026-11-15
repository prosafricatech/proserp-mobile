import { api } from '../../../client';
import type { PageResult, Stakeholder, StakeholderType } from '../types';

export type StakeholderInput = Partial<Stakeholder> & {
  name: string;
  type: StakeholderType;
  ledger_type?: 'receivable' | 'payable';
  group_ids?: (number | string)[];
};

export const stakeholdersApi = {
  async list(params: { page: number; limit: number; type?: string; keyword?: string }) {
    const { data } = await api.get<PageResult<Stakeholder>>('/stakeholders', { params });
    return data;
  },
  async listOptions(type = 'all') {
    const { data } = await api.get<Stakeholder[] | PageResult<Stakeholder>>('/stakeholders', {
      params: { type },
    });
    return Array.isArray(data) ? data : data.data;
  },
  async create(values: StakeholderInput) {
    const { data } = await api.post('/stakeholders', values);
    return data;
  },
  async update(values: StakeholderInput & { id: string | number }) {
    const { data } = await api.put(`/stakeholders/${values.id}`, values);
    return data;
  },
  async remove(id: string | number) {
    const { data } = await api.delete(`/stakeholders/${id}`);
    return data;
  },
};
