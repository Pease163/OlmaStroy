import client from './client'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export interface Document {
  id: number
  title: string
  description: string | null
  file_url: string
  category: string | null
  order: number
  is_visible: boolean
  is_featured: boolean
  created_at: string
}

export const documentsApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<Document>>('/documents', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<Document>>(`/documents/${id}`).then((r) => r.data.data),

  create: (data: Partial<Document>) =>
    client.post<SingleResponse<Document>>('/documents', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Document>) =>
    client.put<SingleResponse<Document>>(`/documents/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/documents/${id}`),

  bulkDelete: (ids: number[]) => client.post('/documents/bulk-delete', { ids }),
}
