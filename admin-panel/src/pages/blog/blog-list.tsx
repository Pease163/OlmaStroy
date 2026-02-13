import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { blogPostsApi } from '@/api/blog-posts'
import { exportApi } from '@/api/export'
import { useCrudList } from '@/hooks/use-crud-list'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/models'

const columns: ColumnDef<BlogPost, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'title', header: 'Заголовок' },
  {
    accessorKey: 'is_published',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.is_published ? 'success' : 'secondary'}>
        {row.original.is_published ? 'Опубликован' : 'Черновик'}
      </Badge>
    ),
  },
  { accessorKey: 'created_at', header: 'Создан', cell: ({ row }) => formatDate(row.original.created_at) },
]

export default function BlogListPage() {
  const navigate = useNavigate()
  const { page, setPage, search, setSearch, deleteId, setDeleteId, data, isLoading, deleteMutation } =
    useCrudList(blogPostsApi, {
      queryKey: 'blog-posts',
      deleteSuccessMessage: 'Пост удалён',
    })

  const actionColumns: ColumnDef<BlogPost, unknown>[] = [
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
        <h1 className="text-2xl font-bold">Блог</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportApi.download('blog-posts', 'xlsx')}>
            <Download className="mr-2 h-4 w-4" />Экспорт
          </Button>
          <Button onClick={() => navigate('/panel/blog/new')}>
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
        searchPlaceholder="Поиск по заголовку..."
        page={page}
        totalPages={data?.meta.total_pages || 1}
        total={data?.meta.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/panel/blog/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить пост?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
