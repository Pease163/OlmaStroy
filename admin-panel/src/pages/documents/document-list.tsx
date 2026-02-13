import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { documentsApi, type Document } from '@/api/documents'
import { useCrudList } from '@/hooks/use-crud-list'

const columns: ColumnDef<Document, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'title', header: 'Название' },
  { accessorKey: 'category', header: 'Категория', size: 150 },
  {
    accessorKey: 'is_visible',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.is_visible ? 'success' : 'secondary'}>
        {row.original.is_visible ? 'Виден' : 'Скрыт'}
      </Badge>
    ),
  },
]

export default function DocumentListPage() {
  const navigate = useNavigate()
  const { page, setPage, search, setSearch, deleteId, setDeleteId, data, isLoading, deleteMutation } =
    useCrudList(documentsApi, {
      queryKey: 'documents',
      deleteSuccessMessage: 'Документ удалён',
    })

  const actionColumns: ColumnDef<Document, unknown>[] = [
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
        <h1 className="text-2xl font-bold">Документы</h1>
        <Button onClick={() => navigate('/panel/documents/new')}>
          <Plus className="mr-2 h-4 w-4" />Добавить
        </Button>
      </div>

      <DataTable
        columns={actionColumns}
        data={data?.data || []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск документов..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/panel/documents/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить документ?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
