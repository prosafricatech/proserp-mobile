import { api } from '../../../client';
import type { PageResult, Stakeholder, StakeholderGroup } from '../types';

export const stakeholderGroupsApi = {
  async list(params: { page: number; limit: number; keyword?: string }) {
    const { data } = await api.get<PageResult<StakeholderGroup>>('/stakeholder-groups', {
      params,
    });
    return data;
  },
  async listAll() {
    const { data } = await api.get<StakeholderGroup[]>('/stakeholder-groups');
    return data;
  },
  async create(values: { name: string; description?: string }) {
    const { data } = await api.post('/stakeholder-groups', values);
    return data;
  },
  async update(values: { id: string | number; name: string; description?: string }) {
    const { data } = await api.put(`/stakeholder-groups/${values.id}`, values);
    return data;
  },
  async remove(id: string | number) {
    const { data } = await api.delete(`/stakeholder-groups/${id}`);
    return data;
  },
  async listMembers(params: {
    id: string | number;
    page: number;
    limit: number;
    keyword?: string;
  }) {
    const { id, ...query } = params;
    const { data } = await api.get<PageResult<Stakeholder>>(
      `/stakeholder-groups/${id}/stakeholders`,
      { params: query }
    );
    return data;
  },
  async addMembers(id: string | number, stakeholder_ids: (number | string)[]) {
    const { data } = await api.post(`/stakeholder-groups/${id}/stakeholders`, {
      stakeholder_ids,
    });
    return data;
  },
  async removeMember(id: string | number, stakeholderId: string | number) {
    const { data } = await api.delete(`/stakeholder-groups/${id}/stakeholders/${stakeholderId}`);
    return data;
  },
};
