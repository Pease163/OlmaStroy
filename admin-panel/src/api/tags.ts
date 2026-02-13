import client from './client'

export interface Tag {
  id: number
  name: string
  slug: string
}

export const tagsApi = {
  list: () =>
    client.get<{ data: Tag[] }>('/tags').then((r) => r.data.data),

  create: (name: string) =>
    client.post<{ data: Tag }>('/tags', { name }).then((r) => r.data.data),

  delete: (id: number) => client.delete(`/tags/${id}`),
}
