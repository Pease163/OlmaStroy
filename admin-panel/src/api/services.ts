import client from './client'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export interface Service {
  id: number
  title: string
  description: string | null
  icon: string | null
  order: number
  is_active: boolean
}

export const servicesApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<Service>>('/services', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<Service>>(`/services/${id}`).then((r) => r.data.data),

  create: (data: Partial<Service>) =>
    client.post<SingleResponse<Service>>('/services', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Service>) =>
    client.put<SingleResponse<Service>>(`/services/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/services/${id}`),

  bulkDelete: (ids: number[]) => client.post('/services/bulk-delete', { ids }),
}
