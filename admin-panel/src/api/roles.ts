import client from './client'
import type { Role, Permission } from '@/types/models'

export const rolesApi = {
  list: () =>
    client.get<{ data: Role[] }>('/roles').then((r) => r.data.data),

  get: (id: number) =>
    client.get<{ data: Role }>(`/roles/${id}`).then((r) => r.data.data),

  create: (data: { name: string; description?: string; permissions?: string[] }) =>
    client.post<{ data: Role }>('/roles', data).then((r) => r.data.data),

  update: (id: number, data: { name?: string; description?: string; permissions?: string[] }) =>
    client.put<{ data: Role }>(`/roles/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/roles/${id}`),

  permissions: () =>
    client.get<{ data: Record<string, Permission[]> }>('/permissions').then((r) => r.data.data),
}
