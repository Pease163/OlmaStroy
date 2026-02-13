import client from './client'
import type { ProjectImage } from '@/types/models'

export const projectImagesApi = {
  list: (projectId: number) =>
    client.get<{ data: ProjectImage[] }>(`/projects/${projectId}/images`).then((r) => r.data.data),

  create: (projectId: number, data: Partial<ProjectImage>) =>
    client
      .post<{ data: ProjectImage }>(`/projects/${projectId}/images`, data)
      .then((r) => r.data.data),

  update: (projectId: number, imageId: number, data: Partial<ProjectImage>) =>
    client
      .patch<{ data: ProjectImage }>(`/projects/${projectId}/images/${imageId}`, data)
      .then((r) => r.data.data),

  reorder: (projectId: number, ids: number[]) =>
    client
      .post<{ data: ProjectImage[] }>(`/projects/${projectId}/images/reorder`, { ids })
      .then((r) => r.data.data),

  delete: (projectId: number, imageId: number) =>
    client.delete(`/projects/${projectId}/images/${imageId}`),
}
