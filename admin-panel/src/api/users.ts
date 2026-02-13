import client from './client'
import type { User } from '@/types/models'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export const usersApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<User>>(`/users/${id}`).then((r) => r.data.data),

  create: (data: Partial<User> & { password: string }) =>
    client.post<SingleResponse<User>>('/users', data).then((r) => r.data.data),

  update: (id: number, data: Partial<User> & { password?: string }) =>
    client.put<SingleResponse<User>>(`/users/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/users/${id}`),
}
