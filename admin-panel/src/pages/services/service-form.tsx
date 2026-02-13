import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { servicesApi, type Service } from '@/api/services'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200),
  description: z.string().optional().or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function ServiceFormPage() {
  const { isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Service, FormData>(servicesApi, {
    queryKey: 'service',
    listQueryKey: 'services',
    navigateTo: '/panel/services',
    schema,
    defaultValues: { title: '', description: '', icon: '', order: 0, is_active: true },
    mapToForm: (item) => ({
      title: item.title,
      description: item.description || '',
      icon: item.icon || '',
      order: item.order,
      is_active: item.is_active,
    }),
    entityName: { created: 'Услуга создана', updated: 'Услуга обновлена' },
  })

  const { register, formState: { errors, isSubmitting } } = form

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/services')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование услуги' : 'Новая услуга'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название *</label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Описание</label>
              <textarea
                {...register('description')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Иконка (CSS класс или имя)</label>
              <Input {...register('icon')} placeholder="wrench" />
            </div>

            <div>
              <label className="text-sm font-medium">Порядок</label>
              <Input type="number" {...register('order')} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" {...register('is_active')} className="h-4 w-4" />
              <label htmlFor="is_active" className="text-sm font-medium">Активна</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/panel/services')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
