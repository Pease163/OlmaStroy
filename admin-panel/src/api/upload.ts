import client from './client'

export interface MediaFile {
  name: string
  url: string
  size: number
  is_image: boolean
  modified: number
}

export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post<{ data: { url: string; webp_url?: string } }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data)
  },

  listMedia: (search?: string) =>
    client
      .get<{ data: MediaFile[]; meta: { total: number } }>('/media', { params: { search } })
      .then((r) => r.data),

  deleteMedia: (filename: string) => client.delete(`/media/${filename}`),
}
