import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { rolesApi } from '@/api/roles'
import { toast } from 'sonner'
import type { ApiError } from '@/types/api'

export default function RoleListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Роль удалена')
      setDeleteId(null)
    },
    onError: (e: ApiError) => {
      toast.error(e.response?.data?.error?.message || 'Ошибка удаления')
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Роли</h1>
        <Button onClick={() => navigate('/panel/roles/new')}>
          <Plus className="mr-2 h-4 w-4" />Создать роль
        </Button>
      </div>

      <div className="grid gap-4">
        {roles?.map((role) => (
          <Card key={role.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{role.name}</h3>
                    {role.is_system && <Badge variant="outline">Системная</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description || 'Нет описания'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Прав: {role.permissions.length}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/panel/roles/${role.id}`)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {!role.is_system && (
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(role.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить роль?"
        description="Все пользователи с этой ролью потеряют назначенные права."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
