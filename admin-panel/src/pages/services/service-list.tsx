import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { servicesApi, type Service } from '@/api/services'
import { useCrudList } from '@/hooks/use-crud-list'

const columns: ColumnDef<Service, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'title', header: 'Название' },
  { accessorKey: 'order', header: 'Порядок', size: 80 },
  {
    accessorKey: 'is_active',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
        {row.original.is_active ? 'Активна' : 'Скрыта'}
      </Badge>
    ),
  },
]

export default function ServiceListPage() {
  const navigate = useNavigate()
  const { page, setPage, search, setSearch, deleteId, setDeleteId, data, isLoading, deleteMutation } =
    useCrudList(servicesApi, {
      queryKey: 'services',
      deleteSuccessMessage: 'Услуга удалена',
    })

  const actionColumns: ColumnDef<Service, unknown>[] = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Услуги</h1>
        <Button onClick={() => navigate('/panel/services/new')}>
          <Plus className="mr-2 h-4 w-4" />Добавить
        </Button>
      </div>

      <DataTable
        columns={actionColumns}
        data={data?.data || []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск услуг..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/panel/services/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить услугу?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
