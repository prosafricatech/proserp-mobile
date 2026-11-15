import { api } from '../../../client';
import type { MeasurementUnit, PageResult } from '../types';

export const measurementUnitsApi = {
  async list(params: { page: number; limit: number; keyword?: string }) {
    const { data } = await api.get<PageResult<MeasurementUnit>>('/masters/measurement_units', {
      params,
    });
    return data;
  },
  async listAll() {
    const { data } = await api.get<MeasurementUnit[]>('/masters/all_measurement_units');
    return data;
  },
  async create(values: Omit<MeasurementUnit, 'id'>) {
    const { data } = await api.post('/masters/measurement_units', values);
    return data;
  },
  async update(values: MeasurementUnit) {
    const { data } = await api.put(`/masters/measurement_units/${values.id}`, values);
    return data;
  },
  async remove(id: string | number) {
    const { data } = await api.delete(`/masters/measurement_units/${id}`);
    return data;
  },
};
