import client from './client'
import type { UserSession } from '@/types/models'

export const sessionsApi = {
  list: (userId: number) =>
    client.get<{ data: UserSession[] }>(`/users/${userId}/sessions`).then((r) => r.data.data),

  terminate: (userId: number, sessionId: number) =>
    client.delete(`/users/${userId}/sessions/${sessionId}`),
}
