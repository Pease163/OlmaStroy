import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { auditApi } from '@/api/audit'
import { formatDateTime } from '@/lib/utils'
import { ACTION_LABELS, ACTION_VARIANTS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import type { AuditLog } from '@/types/models'

const columns: ColumnDef<AuditLog, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  {
    accessorKey: 'created_at',
    header: 'Дата',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
  {
    accessorKey: 'user',
    header: 'Пользователь',
    cell: ({ row }) => row.original.user || '—',
  },
  {
    accessorKey: 'action',
    header: 'Действие',
    cell: ({ row }) => (
      <Badge variant={ACTION_VARIANTS[row.original.action] || 'secondary'}>
        {ACTION_LABELS[row.original.action] || row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: 'entity_type',
    header: 'Тип объекта',
    cell: ({ row }) => row.original.entity_type || '—',
  },
  {
    accessorKey: 'entity_title',
    header: 'Объект',
    cell: ({ row }) => row.original.entity_title || `#${row.original.entity_id || '—'}`,
  },
  {
    accessorKey: 'ip_address',
    header: 'IP',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.ip_address || '—'}</span>
    ),
  },
]

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page, debouncedSearch],
    queryFn: () => auditApi.list({ page, search: debouncedSearch }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Аудит-лог</h1>
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по действиям..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
      />
    </div>
  )
}
