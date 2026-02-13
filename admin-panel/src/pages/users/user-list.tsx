import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usersApi } from '@/api/users'
import { useCrudList } from '@/hooks/use-crud-list'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/models'

const columns: ColumnDef<User, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'username', header: 'Логин' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'is_admin',
    header: 'Админ',
    cell: ({ row }) => (
      <Badge variant={row.original.is_admin ? 'default' : 'secondary'}>
        {row.original.is_admin ? 'Да' : 'Нет'}
      </Badge>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Активен',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
        {row.original.is_active ? 'Да' : 'Нет'}
      </Badge>
    ),
  },
  {
    id: 'role_name',
    header: 'Роль',
    cell: ({ row }) => row.original.role?.name || '—',
  },
  { accessorKey: 'created_at', header: 'Создан', cell: ({ row }) => formatDate(row.original.created_at) },
]

export default function UserListPage() {
  const navigate = useNavigate()
  const { page, setPage, search, setSearch, deleteId, setDeleteId, data, isLoading, deleteMutation } =
    useCrudList(usersApi, {
      queryKey: 'users',
      deleteSuccessMessage: 'Пользователь удалён',
      deleteErrorMessage: 'Ошибка удаления',
    })

  const actionColumns: ColumnDef<User, unknown>[] = [
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
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <Button onClick={() => navigate('/panel/users/new')}>
          <Plus className="mr-2 h-4 w-4" />Добавить
        </Button>
      </div>

      <DataTable
        columns={actionColumns}
        data={data?.data || []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по имени или email..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/panel/users/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить пользователя?"
        description="Это действие нельзя отменить. Все данные пользователя будут потеряны."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
