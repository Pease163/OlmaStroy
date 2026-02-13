import { z } from 'zod'
import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, X, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { blogPostsApi } from '@/api/blog-posts'
import { tagsApi, type Tag } from '@/api/tags'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'
import { TiptapEditor } from '@/components/tiptap-editor'
import type { BlogPost } from '@/types/models'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200),
  content: z.string().min(1, 'Обязательное поле'),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  is_published: z.boolean(),
  publish_at: z.string().optional().or(z.literal('')),
  meta_title: z.string().max(200).optional().or(z.literal('')),
  meta_description: z.string().max(500).optional().or(z.literal('')),
  tag_ids: z.array(z.number()).optional(),
})

type FormData = z.infer<typeof schema>

export default function BlogFormPage() {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')
  const [showSeo, setShowSeo] = useState(false)

  const { data: allTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list(),
  })

  const { isEdit, navigate, isLoading, data: postData, form, onSubmit } = useCrudForm<BlogPost, FormData>(blogPostsApi, {
    queryKey: 'blog-post',
    listQueryKey: 'blog-posts',
    navigateTo: '/panel/blog',
    schema,
    defaultValues: {
      title: '', content: '', excerpt: '', image_url: '',
      is_published: false, publish_at: '', meta_title: '', meta_description: '', tag_ids: [],
    },
    mapToForm: (post) => ({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      image_url: post.image_url || '',
      is_published: post.is_published,
      publish_at: post.publish_at ? post.publish_at.slice(0, 16) : '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      tag_ids: post.tags?.map((t) => t.id) || [],
    }),
    entityName: { created: 'Пост создан', updated: 'Пост обновлён' },
  })

  useEffect(() => {
    if (postData?.tags) {
      setSelectedTags(postData.tags)
    }
  }, [postData])

  const { register, formState: { errors, isSubmitting } } = form

  const handleAddTag = async () => {
    if (!newTag.trim()) return
    const tag = await tagsApi.create(newTag.trim())
    if (!selectedTags.find((t) => t.id === tag.id)) {
      const updated = [...selectedTags, tag]
      setSelectedTags(updated)
      form.setValue('tag_ids', updated.map((t) => t.id))
    }
    setNewTag('')
  }

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      const updated = [...selectedTags, tag]
      setSelectedTags(updated)
      form.setValue('tag_ids', updated.map((t) => t.id))
    }
  }

  const handleRemoveTag = (tagId: number) => {
    const updated = selectedTags.filter((t) => t.id !== tagId)
    setSelectedTags(updated)
    form.setValue('tag_ids', updated.map((t) => t.id))
  }

  if (isEdit && isLoading) return <FormSkeleton />

  const availableTags = allTags?.filter((t) => !selectedTags.find((s) => s.id === t.id)) || []

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/blog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование поста' : 'Новый пост'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Заголовок *</label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Краткое описание</label>
              <Input {...register('excerpt')} />
            </div>

            <div>
              <label className="text-sm font-medium">URL изображения</label>
              <Input {...register('image_url')} placeholder="/static/uploads/image.jpg" />
            </div>

            <div>
              <label className="text-sm font-medium">Контент *</label>
              <TiptapEditor
                content={form.watch('content')}
                onChange={(html) => form.setValue('content', html, { shouldValidate: true })}
              />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium">Теги</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.name}
                    <button type="button" onClick={() => handleRemoveTag(tag.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Новый тег..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>+</Button>
              </div>
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleSelectTag(tag)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" {...register('is_published')} className="h-4 w-4" />
                <label htmlFor="is_published" className="text-sm font-medium">Опубликовать</label>
              </div>
            </div>

            {/* Scheduled publishing */}
            <div>
              <label className="text-sm font-medium">Запланировать публикацию</label>
              <Input type="datetime-local" {...register('publish_at')} />
              <p className="text-xs text-muted-foreground mt-1">Оставьте пустым для немедленной публикации</p>
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
              <Button type="button" variant="outline" onClick={() => navigate('/panel/blog')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
