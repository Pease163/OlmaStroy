import { z } from 'zod'
import { useState, type ChangeEvent } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { documentsApi, type Document } from '@/api/documents'
import { uploadApi } from '@/api/upload'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200),
  description: z.string().optional().or(z.literal('')),
  file_url: z.string().min(1, 'Обязательное поле'),
  category: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
  is_featured: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function DocumentFormPage() {
  const { isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Document, FormData>(documentsApi, {
    queryKey: 'document',
    listQueryKey: 'documents',
    navigateTo: '/panel/documents',
    schema,
    defaultValues: { title: '', description: '', file_url: '', category: '', order: 0, is_visible: true, is_featured: false },
    mapToForm: (item) => ({
      title: item.title,
      description: item.description || '',
      file_url: item.file_url,
      category: item.category || '',
      order: item.order,
      is_visible: item.is_visible,
      is_featured: item.is_featured,
    }),
    entityName: { created: 'Документ создан', updated: 'Документ обновлён' },
  })

  const [uploading, setUploading] = useState(false)
  const { register, setValue, watch, formState: { errors, isSubmitting } } = form
  const fileUrl = watch('file_url')

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Нужно загрузить PDF-файл')
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      const result = await uploadApi.upload(file)
      setValue('file_url', result.url, { shouldDirty: true, shouldValidate: true })
      toast.success('PDF загружен')
    } catch {
      toast.error('Не удалось загрузить PDF')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

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

            <div className="space-y-2">
              <label className="text-sm font-medium">PDF-файл *</label>
              <div className="flex flex-col gap-2">
                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                    disabled={uploading || isSubmitting}
                  />
                  {uploading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Загружаем PDF...
                    </span>
                  ) : (
                    'Выбрать PDF и загрузить'
                  )}
                </label>
                <Input {...register('file_url')} placeholder="/static/uploads/documents/file.pdf" disabled={uploading || isSubmitting} />
                <p className="text-xs text-muted-foreground">
                  PDF загружается автоматически, но ссылку можно указать вручную как fallback.
                </p>
              </div>
              {errors.file_url && <p className="text-sm text-destructive mt-1">{errors.file_url.message}</p>}
              {fileUrl && (
                <p className="text-xs text-muted-foreground break-all">
                  Текущий файл: <span className="font-medium text-foreground">{fileUrl}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Категория</label>
              <select
                {...register('category')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Без категории</option>
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Порядок</label>
              <Input type="number" {...register('order')} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_featured" {...register('is_featured')} className="h-4 w-4" />
              <label htmlFor="is_featured" className="text-sm font-medium">Показывать в featured-блоке</label>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_visible" {...register('is_visible')} className="h-4 w-4" />
              <label htmlFor="is_visible" className="text-sm font-medium">Виден на сайте</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || uploading}>
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
