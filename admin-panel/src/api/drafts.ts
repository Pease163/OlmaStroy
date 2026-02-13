import client from './client'
import type { Draft } from '@/types/models'

export const draftsApi = {
  get: (entityType: string, entityId: number) =>
    client.get<{ data: Draft | null }>(`/drafts/${entityType}/${entityId}`)
      .then((r) => r.data.data),

  save: (entityType: string, entityId: number, data: Record<string, unknown>) =>
    client.put(`/drafts/${entityType}/${entityId}`, { data }),

  delete: (entityType: string, entityId: number) =>
    client.delete(`/drafts/${entityType}/${entityId}`),
}
