import client from './client'
import type { Notification } from '@/types/models'

interface NotificationsResponse {
  data: Notification[]
  meta: { page: number; per_page: number; total: number; total_pages: number; unread_count: number }
}

export const notificationsApi = {
  list: (params?: { page?: number; unread_only?: boolean }) =>
    client.get<NotificationsResponse>('/notifications', { params }).then((r) => r.data),

  markRead: (id: number) => client.put(`/notifications/${id}`),

  markAllRead: () => client.put('/notifications/read-all'),

  delete: (id: number) => client.delete(`/notifications/${id}`),
}
