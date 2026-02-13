import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { documentsApi, type Document } from '@/api/documents'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200),
  description: z.string().optional().or(z.literal('')),
  file_url: z.string().min(1, 'Обязательное поле'),
  category: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function DocumentFormPage() {
  const { isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Document, FormData>(documentsApi, {
    queryKey: 'document',
    listQueryKey: 'documents',
    navigateTo: '/panel/documents',
    schema,
    defaultValues: { title: '', description: '', file_url: '', category: '', order: 0, is_visible: true },
    mapToForm: (item) => ({
      title: item.title,
      description: item.description || '',
      file_url: item.file_url,
      category: item.category || '',
      order: item.order,
      is_visible: item.is_visible,
    }),
    entityName: { created: 'Документ создан', updated: 'Документ обновлён' },
  })

  const { register, formState: { errors, isSubmitting } } = form

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/documents')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование документа' : 'Новый документ'}</h1>
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
              <label className="text-sm font-medium">URL файла *</label>
              <Input {...register('file_url')} placeholder="https://..." />
              {errors.file_url && <p className="text-sm text-destructive mt-1">{errors.file_url.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Категория</label>
              <Input {...register('category')} />
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
              <Button type="button" variant="outline" onClick={() => navigate('/panel/documents')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
