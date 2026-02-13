import client from './client'
import type { BlogPost } from '@/types/models'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export const blogPostsApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<BlogPost>>('/blog-posts', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<BlogPost>>(`/blog-posts/${id}`).then((r) => r.data.data),

  create: (data: Partial<BlogPost>) =>
    client.post<SingleResponse<BlogPost>>('/blog-posts', data).then((r) => r.data.data),

  update: (id: number, data: Partial<BlogPost>) =>
    client.put<SingleResponse<BlogPost>>(`/blog-posts/${id}`, data).then((r) => r.data.data),

  patch: (id: number, data: Partial<BlogPost>) =>
    client.patch<SingleResponse<BlogPost>>(`/blog-posts/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/blog-posts/${id}`),

  bulkDelete: (ids: number[]) => client.post('/blog-posts/bulk-delete', { ids }),

  bulkPublish: (ids: number[], publish: boolean) =>
    client.post('/blog-posts/bulk-publish', { ids, publish }),

  history: (id: number) =>
    client.get<{ data: unknown[] }>(`/blog-posts/${id}/history`).then((r) => r.data.data),

  rollback: (id: number, auditId: number) =>
    client.post(`/blog-posts/${id}/rollback/${auditId}`),
}
