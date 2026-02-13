import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Download, ToggleLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { vacanciesApi } from '@/api/vacancies'
import { exportApi } from '@/api/export'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Vacancy } from '@/types/models'

const columns: ColumnDef<Vacancy, unknown>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'title', header: 'Название' },
  { accessorKey: 'location', header: 'Локация' },
  { accessorKey: 'employment_type', header: 'Тип занятости' },
  { accessorKey: 'salary', header: 'Зарплата', cell: ({ row }) => row.original.salary || '—' },
  {
    accessorKey: 'is_active',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
        {row.original.is_active ? 'Активна' : 'Неактивна'}
      </Badge>
    ),
  },
  { accessorKey: 'created_at', header: 'Создана', cell: ({ row }) => formatDate(row.original.created_at) },
]

export default function VacancyListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['vacancies', page, debouncedSearch, filterActive],
    queryFn: () => vacanciesApi.list({ page, search: debouncedSearch, is_active: filterActive }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vacanciesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success('Вакансия удалена')
      setDeleteId(null)
    },
  })

  const bulkToggleMutation = useMutation({
    mutationFn: ({ ids, is_active }: { ids: number[]; is_active: boolean }) =>
      vacanciesApi.bulkToggle(ids, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success('Статус обновлён')
    },
  })

  const handleBulkToggle = (is_active: boolean) => {
    const ids = data?.data.map((v) => v.id) || []
    if (ids.length > 0) {
      bulkToggleMutation.mutate({ ids, is_active })
    }
  }

  const actionColumns: ColumnDef<Vacancy, unknown>[] = [
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
        <h1 className="text-2xl font-bold">Вакансии</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportApi.download('vacancies', 'xlsx')}>
            <Download className="mr-2 h-4 w-4" />Экспорт
          </Button>
          <Button onClick={() => navigate('/panel/vacancies/new')}>
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
        onRowClick={(row) => navigate(`/panel/vacancies/${row.id}`)}
        toolbar={
          <div className="flex gap-2">
            <Button
              variant={filterActive === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterActive(filterActive === true ? undefined : true)}
            >
              Активные
            </Button>
            <Button
              variant={filterActive === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterActive(filterActive === false ? undefined : false)}
            >
              Неактивные
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkToggle(true)}>
              <ToggleLeft className="mr-2 h-4 w-4" />Включить все
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkToggle(false)}>
              <ToggleLeft className="mr-2 h-4 w-4" />Выключить все
            </Button>
          </div>
        }
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить вакансию?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
