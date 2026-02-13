import client from './client'
import type { PaginatedResponse, ListParams, SingleResponse } from '@/types/api'

export interface Testimonial {
  id: number
  company_name: string
  author: string | null
  text: string
  image_url: string | null
  rating: number
  order: number
  is_visible: boolean
  created_at: string
}

export const testimonialsApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<Testimonial>>('/testimonials', { params }).then((r) => r.data),

  get: (id: number) =>
    client.get<SingleResponse<Testimonial>>(`/testimonials/${id}`).then((r) => r.data.data),

  create: (data: Partial<Testimonial>) =>
    client.post<SingleResponse<Testimonial>>('/testimonials', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Testimonial>) =>
    client.put<SingleResponse<Testimonial>>(`/testimonials/${id}`, data).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/testimonials/${id}`),

  bulkDelete: (ids: number[]) => client.post('/testimonials/bulk-delete', { ids }),
}
