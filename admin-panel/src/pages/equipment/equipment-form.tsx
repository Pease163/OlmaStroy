import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { equipmentApi, type Equipment } from '@/api/equipment'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'

const schema = z.object({
  name: z.string().min(1, 'Обязательное поле').max(200),
  description: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  specs: z.string().optional().or(z.literal('')),
  is_available: z.boolean(),
  order: z.coerce.number().int().min(0),
})

type FormData = z.infer<typeof schema>

export default function EquipmentFormPage() {
  const { isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Equipment, FormData>(equipmentApi, {
    queryKey: 'equipment-item',
    listQueryKey: 'equipment',
    navigateTo: '/panel/equipment',
    schema,
    defaultValues: { name: '', description: '', image_url: '', category: '', specs: '', is_available: true, order: 0 },
    mapToForm: (item) => ({
      name: item.name,
      description: item.description || '',
      image_url: item.image_url || '',
      category: item.category || '',
      specs: item.specs || '',
      is_available: item.is_available,
      order: item.order,
    }),
    entityName: { created: 'Техника создана', updated: 'Техника обновлена' },
  })

  const { register, formState: { errors, isSubmitting } } = form

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/equipment')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование техники' : 'Новая техника'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название *</label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Описание</label>
              <textarea
                {...register('description')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL изображения</label>
              <Input {...register('image_url')} placeholder="https://..." />
            </div>

            <div>
              <label className="text-sm font-medium">Категория</label>
              <Input {...register('category')} />
            </div>

            <div>
              <label className="text-sm font-medium">Характеристики (JSON)</label>
              <textarea
                {...register('specs')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder='{"мощность": "200 л.с.", "вес": "5 тонн"}'
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_available" {...register('is_available')} className="h-4 w-4" />
              <label htmlFor="is_available" className="text-sm font-medium">Доступна</label>
            </div>

            <div>
              <label className="text-sm font-medium">Порядок</label>
              <Input type="number" {...register('order')} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/panel/equipment')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
