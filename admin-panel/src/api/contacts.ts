import client from './client'
import type { ContactSubmission } from '@/types/models'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export const contactsApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<ContactSubmission>>('/contacts', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<ContactSubmission>>(`/contacts/${id}`).then((r) => r.data.data),

  markRead: (id: number) =>
    client.put(`/contacts/${id}/read`),

  bulkRead: (ids: number[]) => client.post('/contacts/bulk-read', { ids }),

  delete: (id: number) => client.delete(`/contacts/${id}`),

  bulkDelete: (ids: number[]) => client.post('/contacts/bulk-delete', { ids }),
}
