import client from './client'
import type { Vacancy } from '@/types/models'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export const vacanciesApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<Vacancy>>('/vacancies', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<Vacancy>>(`/vacancies/${id}`).then((r) => r.data.data),

  create: (data: Partial<Vacancy>) =>
    client.post<SingleResponse<Vacancy>>('/vacancies', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Vacancy>) =>
    client.put<SingleResponse<Vacancy>>(`/vacancies/${id}`, data).then((r) => r.data.data),

  patch: (id: number, data: Partial<Vacancy>) =>
    client.patch<SingleResponse<Vacancy>>(`/vacancies/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/vacancies/${id}`),

  bulkDelete: (ids: number[]) => client.post('/vacancies/bulk-delete', { ids }),

  bulkToggle: (ids: number[], is_active: boolean) =>
    client.post('/vacancies/bulk-toggle', { ids, is_active }),

  history: (id: number) =>
    client.get<{ data: unknown[] }>(`/vacancies/${id}/history`).then((r) => r.data.data),
}
