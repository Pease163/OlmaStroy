import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { rolesApi } from '@/api/roles'
import { FormSkeleton } from '@/components/loading-skeleton'
import { toast } from 'sonner'

export default function RoleFormPage() {
  const { id } = useParams()
  const isEdit = id !== 'new' && id !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.get(Number(id)),
    enabled: isEdit,
  })

  const { data: permGroups, isLoading: permsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.permissions(),
  })

  useEffect(() => {
    if (role) {
      setName(role.name)
      setDescription(role.description || '')
      setSelectedPerms(role.permissions)
    }
  }, [role])

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { name, description, permissions: selectedPerms }
      return isEdit ? rolesApi.update(Number(id), data) : rolesApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(isEdit ? 'Роль обновлена' : 'Роль создана')
      navigate('/panel/roles')
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      toast.error(err.response?.data?.error?.message || 'Ошибка сохранения')
    },
  })

  const togglePerm = (codename: string) => {
    setSelectedPerms((prev) =>
      prev.includes(codename) ? prev.filter((p) => p !== codename) : [...prev, codename]
    )
  }

  const toggleGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => selectedPerms.includes(p))
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((p) => !groupPerms.includes(p)))
    } else {
      setSelectedPerms((prev) => [...new Set([...prev, ...groupPerms])])
    }
  }

  if ((isEdit && roleLoading) || permsLoading) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/roles')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Редактирование роли' : 'Новая роль'}</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Название *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Описание</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Права доступа</CardTitle>
        </CardHeader>
        <CardContent>
          {permGroups && Object.entries(permGroups).map(([group, perms]) => (
            <div key={group} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">{group}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleGroup(perms.map((p) => p.codename))}
                  disabled={role?.is_system}
                >
                  {perms.every((p) => selectedPerms.includes(p.codename)) ? 'Снять все' : 'Выбрать все'}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {perms.map((p) => (
                  <label key={p.codename} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPerms.includes(p.codename)}
                      onChange={() => togglePerm(p.codename)}
                      className="h-4 w-4"
                      disabled={role?.is_system}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !name || role?.is_system}
        >
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/panel/roles')}>
          Отмена
        </Button>
      </div>
    </div>
  )
}
