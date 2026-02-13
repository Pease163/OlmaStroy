import client from './client'
import type { AuditLog } from '@/types/models'
import type { PaginatedResponse, ListParams } from '@/types/api'

export const auditApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<AuditLog>>('/audit-log', { params }).then((r) => r.data),
}
