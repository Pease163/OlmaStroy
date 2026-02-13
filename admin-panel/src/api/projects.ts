import client from './client'
import type { Project } from '@/types/models'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export const projectsApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<Project>>('/projects', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<Project>>(`/projects/${id}`).then((r) => r.data.data),

  create: (data: Partial<Project>) =>
    client.post<SingleResponse<Project>>('/projects', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Project>) =>
    client.put<SingleResponse<Project>>(`/projects/${id}`, data).then((r) => r.data.data),

  patch: (id: number, data: Partial<Project>) =>
    client.patch<SingleResponse<Project>>(`/projects/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/projects/${id}`),

  bulkDelete: (ids: number[]) => client.post('/projects/bulk-delete', { ids }),

  bulkToggle: (ids: number[], is_visible: boolean) =>
    client.post('/projects/bulk-toggle', { ids, is_visible }),

  history: (id: number) =>
    client.get<{ data: unknown[] }>(`/projects/${id}/history`).then((r) => r.data.data),
}
