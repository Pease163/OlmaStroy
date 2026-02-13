import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { testimonialsApi, type Testimonial } from '@/api/testimonials'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'

const schema = z.object({
  company_name: z.string().min(1, 'Обязательное поле').max(200),
  author: z.string().optional().or(z.literal('')),
  text: z.string().min(1, 'Обязательное поле'),
  image_url: z.string().optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5),
  order: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function TestimonialFormPage() {
  const { isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Testimonial, FormData>(testimonialsApi, {
    queryKey: 'testimonial',
    listQueryKey: 'testimonials',
    navigateTo: '/panel/testimonials',
    schema,
    defaultValues: { company_name: '', author: '', text: '', image_url: '', rating: 5, order: 0, is_visible: true },
    mapToForm: (item) => ({
      company_name: item.company_name,
      author: item.author || '',
      text: item.text,
      image_url: item.image_url || '',
      rating: item.rating,
      order: item.order,
      is_visible: item.is_visible,
    }),
    entityName: { created: 'Отзыв создан', updated: 'Отзыв обновлён' },
  })

  const { register, formState: { errors, isSubmitting } } = form

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/testimonials')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование отзыва' : 'Новый отзыв'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Компания *</label>
              <Input {...register('company_name')} />
              {errors.company_name && <p className="text-sm text-destructive mt-1">{errors.company_name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Автор</label>
              <Input {...register('author')} />
            </div>

            <div>
              <label className="text-sm font-medium">Текст отзыва *</label>
              <textarea
                {...register('text')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {errors.text && <p className="text-sm text-destructive mt-1">{errors.text.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">URL изображения</label>
              <Input {...register('image_url')} placeholder="https://..." />
            </div>

            <div>
              <label className="text-sm font-medium">Рейтинг (1-5)</label>
              <Input type="number" min={1} max={5} {...register('rating')} />
              {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Порядок</label>
              <Input type="number" {...register('order')} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_visible" {...register('is_visible')} className="h-4 w-4" />
              <label htmlFor="is_visible" className="text-sm font-medium">Виден на сайте</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/panel/testimonials')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
