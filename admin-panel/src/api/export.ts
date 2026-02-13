import client from './client'

export const exportApi = {
  download: (entity: string, format: 'csv' | 'xlsx' | 'pdf') =>
    client.get(`/export/${entity}`, {
      params: { format },
      responseType: 'blob',
    }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${entity}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }),
}
