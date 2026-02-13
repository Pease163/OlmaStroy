import client from './client'
import type { SiteSetting } from '@/types/models'

export const settingsApi = {
  get: () =>
    client.get<{ data: Record<string, SiteSetting[]> }>('/settings').then((r) => r.data.data),

  update: (data: Record<string, unknown>) =>
    client.put('/settings', data),
}
