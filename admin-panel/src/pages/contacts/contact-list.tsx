import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Trash2, MailOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contactsApi } from '@/api/contacts'
import { useCrudList } from '@/hooks/use-crud-list'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { ContactSubmission } from '@/types/models'

const columns: ColumnDef<ContactSubmission, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'name', header: 'Имя' },
  { accessorKey: 'phone', header: 'Телефон', cell: ({ row }) => row.original.phone || '—' },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => row.original.email || '—' },
  { accessorKey: 'subject', header: 'Тема', cell: ({ row }) => row.original.subject || '—' },
  {
    accessorKey: 'is_read',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.is_read ? 'secondary' : 'warning'}>
        {row.original.is_read ? 'Прочитано' : 'Новое'}
      </Badge>
    ),
  },
  { accessorKey: 'created_at', header: 'Дата', cell: ({ row }) => formatDate(row.original.created_at) },
]

export default function ContactListPage() {
  const navigate = useNavigate()
  const { page, setPage, search, setSearch, deleteId, setDeleteId, data, isLoading, deleteMutation, queryClient } =
    useCrudList(contactsApi, {
      queryKey: 'contacts',
      deleteSuccessMessage: 'Заявка удалена',
    })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => contactsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Отмечено как прочитанное')
    },
  })

  const actionColumns: ColumnDef<ContactSubmission, unknown>[] = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {!row.original.is_read && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markReadMutation.mutate(row.original.id)}>
              <MailOpen className="h-4 w-4" />
            </Button>
          )}
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
        <h1 className="text-2xl font-bold">Заявки с сайта</h1>
      </div>

      <DataTable
        columns={actionColumns}
        data={data?.data || []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по имени..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/panel/contacts/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить заявку?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
