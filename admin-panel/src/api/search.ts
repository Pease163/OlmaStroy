import client from './client'
import type { SearchResult } from '@/types/models'

export const searchApi = {
  search: (q: string) =>
    client.get<{ data: { results: SearchResult[]; query: string } }>('/search', { params: { q } })
      .then((r) => r.data.data),
}
