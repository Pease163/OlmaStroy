import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { projectsApi } from '@/api/projects'
import { exportApi } from '@/api/export'
import { useCrudList } from '@/hooks/use-crud-list'
import type { Project } from '@/types/models'

const columns: ColumnDef<Project, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'title', header: 'Название' },
  { accessorKey: 'location', header: 'Локация', cell: ({ row }) => row.original.location || '—' },
  { accessorKey: 'category', header: 'Категория', cell: ({ row }) => row.original.category || '—' },
  { accessorKey: 'year', header: 'Год', cell: ({ row }) => row.original.year || '—' },
  { accessorKey: 'order', header: 'Порядок', size: 80 },
  {
    accessorKey: 'is_visible',
    header: 'Видимость',
    cell: ({ row }) => (
      <Badge variant={row.original.is_visible ? 'success' : 'secondary'}>
        {row.original.is_visible ? 'Видим' : 'Скрыт'}
      </Badge>
    ),
  },
]

export default function ProjectListPage() {
  const navigate = useNavigate()
  const { page, setPage, search, setSearch, deleteId, setDeleteId, data, isLoading, deleteMutation } =
    useCrudList(projectsApi, {
      queryKey: 'projects',
      deleteSuccessMessage: 'Проект удалён',
    })

  const actionColumns: ColumnDef<Project, unknown>[] = [
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
        <h1 className="text-2xl font-bold">Проекты</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportApi.download('projects', 'xlsx')}>
            <Download className="mr-2 h-4 w-4" />Экспорт
          </Button>
          <Button onClick={() => navigate('/panel/projects/new')}>
            <Plus className="mr-2 h-4 w-4" />Добавить
          </Button>
        </div>
      </div>

      <DataTable
        columns={actionColumns}
        data={data?.data || []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по названию..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/panel/projects/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить проект?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
