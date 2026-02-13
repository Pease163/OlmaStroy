import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ZodType } from 'zod'
import { toast } from 'sonner'
import type { ApiError } from '@/types/api'

interface CrudFormApi<T, TPayload> {
  get: (id: number) => Promise<T>
  create: (data: TPayload) => Promise<unknown>
  update: (id: number, data: TPayload) => Promise<unknown>
}

interface UseCrudFormOptions<T, TFormData> {
  queryKey: string
  listQueryKey: string
  navigateTo: string
  schema: ZodType<TFormData>
  defaultValues: DefaultValues<TFormData>
  mapToForm: (item: T) => TFormData
  entityName: { created: string; updated: string }
}

export function useCrudForm<T, TFormData extends Record<string, unknown>>(
  api: CrudFormApi<T, TFormData>,
  options: UseCrudFormOptions<T, TFormData>,
) {
  const { id } = useParams()
  const isEdit = id !== 'new' && id !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: [options.queryKey, id],
    queryFn: () => api.get(Number(id)),
    enabled: isEdit,
  })

  const form = useForm<TFormData>({
    resolver: zodResolver(options.schema),
    defaultValues: options.defaultValues,
  })

  useEffect(() => {
    if (data) {
      form.reset(options.mapToForm(data) as DefaultValues<TFormData>)
    }
  }, [data, form.reset]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveMutation = useMutation({
    mutationFn: (formData: TFormData) =>
      isEdit ? api.update(Number(id), formData) : api.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [options.listQueryKey] })
      toast.success(isEdit ? options.entityName.updated : options.entityName.created)
      navigate(options.navigateTo)
    },
    onError: (e: ApiError) => {
      toast.error(e.response?.data?.error?.message || e.message || 'Ошибка сохранения')
    },
  })

  const onSubmit = form.handleSubmit((formData) => saveMutation.mutate(formData))

  return {
    id,
    isEdit,
    navigate,
    data,
    isLoading,
    form,
    saveMutation,
    onSubmit,
  }
}
