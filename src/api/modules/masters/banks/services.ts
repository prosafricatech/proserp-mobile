import { api } from '../../../client';
import type { Bank, PageResult } from '../types';

export const banksApi = {
  async list(params: { page: number; limit: number; keyword?: string }) {
    const { data } = await api.get<PageResult<Bank>>('/masters/banks', { params });
    return data;
  },
  async create(values: Omit<Bank, 'id'>) {
    const { data } = await api.post('/masters/banks', values);
    return data;
  },
  async update(values: Bank) {
    const { data } = await api.put(`/masters/banks/${values.id}`, values);
    return data;
  },
  async remove(id: string | number) {
    const { data } = await api.delete(`/masters/banks/${id}`);
    return data;
  },
};
