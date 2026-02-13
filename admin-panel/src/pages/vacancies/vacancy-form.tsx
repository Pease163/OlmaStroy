import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { vacanciesApi } from '@/api/vacancies'
import { FormSkeleton } from '@/components/loading-skeleton'
import { useCrudForm } from '@/hooks/use-crud-form'
import { EMPLOYMENT_TYPES } from '@/lib/constants'
import type { Vacancy } from '@/types/models'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200),
  location: z.string().min(1, 'Обязательное поле').max(200),
  description: z.string().min(1, 'Обязательное поле'),
  salary: z.string().max(100).optional().or(z.literal('')),
  requirements: z.string().optional().or(z.literal('')),
  employment_type: z.string().min(1, 'Обязательное поле'),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function VacancyFormPage() {
  const { isEdit, navigate, isLoading, form, onSubmit } = useCrudForm<Vacancy, FormData>(vacanciesApi, {
    queryKey: 'vacancy',
    listQueryKey: 'vacancies',
    navigateTo: '/panel/vacancies',
    schema,
    defaultValues: {
      title: '', location: '', description: '', salary: '',
      requirements: '', employment_type: 'Полная занятость', is_active: true,
    },
    mapToForm: (v) => ({
      title: v.title,
      location: v.location,
      description: v.description,
      salary: v.salary || '',
      requirements: v.requirements || '',
      employment_type: v.employment_type,
      is_active: v.is_active,
    }),
    entityName: { created: 'Вакансия создана', updated: 'Вакансия обновлена' },
  })

  const { register, formState: { errors, isSubmitting } } = form

  if (isEdit && isLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/vacancies')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование вакансии' : 'Новая вакансия'}</h1>
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
              <label className="text-sm font-medium">Локация *</label>
              <Input {...register('location')} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Тип занятости *</label>
              <select
                {...register('employment_type')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.employment_type && <p className="text-sm text-destructive mt-1">{errors.employment_type.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Зарплата</label>
              <Input {...register('salary')} placeholder="от 50 000 руб." />
            </div>

            <div>
              <label className="text-sm font-medium">Описание *</label>
              <textarea
                {...register('description')}
                className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Требования</label>
              <textarea
                {...register('requirements')}
                className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
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
              <Button type="button" variant="outline" onClick={() => navigate('/panel/vacancies')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
