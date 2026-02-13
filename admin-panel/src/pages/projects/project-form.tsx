import { z } from 'zod'
import { useState } from 'react'
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { projectsApi } from '@/api/projects'
import { FormSkeleton } from '@/components/loading-skeleton'
import { ProjectGallery } from '@/components/project-gallery'
import { useCrudForm } from '@/hooks/use-crud-form'
import type { Project } from '@/types/models'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200),
  location: z.string().max(200).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  year: z.coerce.number().min(1900).max(2100).optional().or(z.literal(0)),
  order: z.coerce.number().min(0).default(0),
  is_visible: z.boolean(),
  meta_title: z.string().max(200).optional().or(z.literal('')),
  meta_description: z.string().max(500).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function ProjectFormPage() {
  const { id, isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Project, FormData>(projectsApi, {
    queryKey: 'project',
    listQueryKey: 'projects',
    navigateTo: '/panel/projects',
    schema,
    defaultValues: {
      title: '', location: '', description: '', content: '',
      image_url: '', category: '', year: new Date().getFullYear(), order: 0, is_visible: true,
      meta_title: '', meta_description: '',
    },
    mapToForm: (p) => ({
      title: p.title,
      location: p.location || '',
      description: p.description || '',
      content: p.content || '',
      image_url: p.image_url || '',
      category: p.category || '',
      year: p.year || 0,
      order: p.order,
      is_visible: p.is_visible,
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
    }),
    entityName: { created: 'Проект создан', updated: 'Проект обновлён' },
  })

  const [showSeo, setShowSeo] = useState(false)
  const { register, formState: { errors, isSubmitting } } = form

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование проекта' : 'Новый проект'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название *</label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Локация</label>
                <Input {...register('location')} />
              </div>
              <div>
                <label className="text-sm font-medium">Категория</label>
                <Input {...register('category')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Год</label>
                <Input type="number" {...register('year')} />
              </div>
              <div>
                <label className="text-sm font-medium">Порядок</label>
                <Input type="number" {...register('order')} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">URL изображения</label>
              <Input {...register('image_url')} placeholder="/static/uploads/image.jpg" />
            </div>

            <div>
              <label className="text-sm font-medium">Описание</label>
              <textarea
                {...register('description')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Контент</label>
              <textarea
                {...register('content')}
                className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_visible" {...register('is_visible')} className="h-4 w-4" />
              <label htmlFor="is_visible" className="text-sm font-medium">Видимый</label>
            </div>

            {/* SEO Section */}
            <div className="border rounded-md">
              <button
                type="button"
                className="flex items-center justify-between w-full p-3 text-sm font-medium"
                onClick={() => setShowSeo(!showSeo)}
              >
                SEO-настройки
                <ChevronDown className={`h-4 w-4 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
              </button>
              {showSeo && (
                <div className="p-3 pt-0 space-y-3">
                  <div>
                    <label className="text-sm font-medium">Meta Title</label>
                    <Input {...register('meta_title')} placeholder="SEO заголовок" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Meta Description</label>
                    <textarea
                      {...register('meta_description')}
                      placeholder="SEO описание"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/panel/projects')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEdit && id && (
        <Card>
          <CardContent className="pt-6">
            <ProjectGallery projectId={Number(id)} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
