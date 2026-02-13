import client from './client'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export interface Equipment {
  id: number
  name: string
  description: string | null
  image_url: string | null
  category: string | null
  specs: string | null
  is_available: boolean
  order: number
}

export const equipmentApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<Equipment>>('/equipment', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<Equipment>>(`/equipment/${id}`).then((r) => r.data.data),

  create: (data: Partial<Equipment>) =>
    client.post<SingleResponse<Equipment>>('/equipment', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Equipment>) =>
    client.put<SingleResponse<Equipment>>(`/equipment/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/equipment/${id}`),

  bulkDelete: (ids: number[]) => client.post('/equipment/bulk-delete', { ids }),
}
