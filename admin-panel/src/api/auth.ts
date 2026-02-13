import client from './client'
import type { User } from '@/types/models'

export interface LoginPayload {
  username: string
  password: string
  totp_code?: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export const authApi = {
  login: (data: LoginPayload) =>
    client.post<{ data: LoginResponse }>('/auth/login', data).then((r) => r.data.data),

  refresh: () =>
    client.post<{ data: { access_token: string } }>('/auth/refresh').then((r) => r.data.data),

  logout: () => client.post('/auth/logout'),

  me: () => client.get<{ data: User }>('/auth/me').then((r) => r.data.data),

  setup2FA: () =>
    client.post<{ data: { secret: string; qr_code: string } }>('/auth/2fa/setup').then((r) => r.data.data),

  verify2FA: (code: string) =>
    client.post('/auth/2fa/verify', { code }),

  disable2FA: (password: string) =>
    client.post('/auth/2fa/disable', { password }),
}
