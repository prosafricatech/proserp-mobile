import { api } from '../../api/client';
import type { Paginated } from '../../auth/types';

// Port of live-repo src/components/notifications/notification-services.ts.
export type NotificationItem = {
  id: string;
  type: string;
  data: {
    event_type: string;
    title: string;
    body: string;
    action_url: string | null;
    resource_type: string | null;
    resource_id: number | string | null;
    meta?: Array<{ label: string; value: string }>;
  };
  read_at: string | null;
  created_at: string;
};

export const notificationsApi = {
  async list(params: { page?: number; limit?: number } = {}) {
    const { data } = await api.get<Paginated<NotificationItem>>('/notifications', { params });
    return data;
  },
  async unreadCount() {
    const { data } = await api.get<{ count?: number }>('/notifications/unread-count');
    return data?.count ?? 0;
  },
  async markRead(id: string) {
    const { data } = await api.post(`/notifications/${id}/read`);
    return data;
  },
  async markAllRead() {
    const { data } = await api.post('/notifications/mark-all-read');
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
  async removeAll() {
    const { data } = await api.delete('/notifications');
    return data;
  },
};
