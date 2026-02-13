import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { usersApi } from '@/api/users'
import { rolesApi } from '@/api/roles'
import { FormSkeleton } from '@/components/loading-skeleton'
import { toast } from 'sonner'
import type { ApiError } from '@/types/api'

const schema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(80),
  email: z.string().email('Некорректный email'),
  password: z.string().optional().or(z.literal('')),
  is_admin: z.boolean(),
  role_id: z.coerce.number().nullable().optional(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function UserFormPage() {
  const { id } = useParams()
  const isEdit = id !== 'new' && id !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(Number(id)),
    enabled: isEdit,
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      is_admin: false,
      role_id: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        password: '',
        is_admin: user.is_admin,
        role_id: user.role_id,
        is_active: user.is_active,
      })
    }
  }, [user, reset])

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        role_id: data.role_id || undefined,
        password: data.password || undefined,
      } as Parameters<typeof usersApi.create>[0]

      if (!isEdit && !data.password) {
        throw new Error('Пароль обязателен при создании пользователя')
      }

      return isEdit
        ? usersApi.update(Number(id), payload)
        : usersApi.create(payload as Parameters<typeof usersApi.create>[0])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(isEdit ? 'Пользователь обновлён' : 'Пользователь создан')
      navigate('/panel/users')
    },
    onError: (e: ApiError) => {
      toast.error(e.response?.data?.error?.message || e.message || 'Ошибка сохранения')
    },
  })

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Логин *</label>
              <Input {...register('username')} />
              {errors.username && <p className="text-sm text-destructive mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Пароль{isEdit ? '' : ' *'}</label>
              <Input
                type="password"
                {...register('password')}
                placeholder={isEdit ? 'Оставьте пустым для сохранения текущего' : ''}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Роль</label>
              <select
                {...register('role_id')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Без роли</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_admin')} className="h-4 w-4" />
                <span className="text-sm font-medium">Администратор</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_active')} className="h-4 w-4" />
                <span className="text-sm font-medium">Активен</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/panel/users')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
