import client from './client'
import type { DashboardStats, ChartData } from '@/types/api'
import type { AuditLog } from '@/types/models'

export const dashboardApi = {
  stats: () =>
    client.get<{ data: DashboardStats }>('/dashboard/stats').then((r) => r.data.data),

  charts: () =>
    client.get<{ data: ChartData }>('/dashboard/charts').then((r) => r.data.data),

  activity: () =>
    client.get<{ data: AuditLog[] }>('/dashboard/activity').then((r) => r.data.data),
}
