import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import type { PaginatedResponse, ApiError } from '@/types/api'

interface CrudListApi<T> {
  list: (params: Record<string, unknown>) => Promise<PaginatedResponse<T>>
  delete: (id: number) => Promise<unknown>
}

interface UseCrudListOptions {
  queryKey: string
  deleteSuccessMessage: string
  deleteErrorMessage?: string
}

export function useCrudList<T>(api: CrudListApi<T>, options: UseCrudListOptions) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: [options.queryKey, page, debouncedSearch],
    queryFn: () => api.list({ page, search: debouncedSearch }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [options.queryKey] })
      toast.success(options.deleteSuccessMessage)
      setDeleteId(null)
    },
    onError: (e: ApiError) => {
      if (options.deleteErrorMessage) {
        toast.error(e.response?.data?.error?.message || options.deleteErrorMessage)
      }
    },
  })

  return {
    page,
    setPage,
    search,
    setSearch,
    debouncedSearch,
    deleteId,
    setDeleteId,
    data,
    isLoading,
    deleteMutation,
    queryClient,
  }
}
