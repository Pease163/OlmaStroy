import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { notificationsApi } from '@/api/notifications'
import { PageSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { formatDateTime } from '@/lib/utils'
import { NOTIFICATION_TYPE_VARIANTS } from '@/lib/constants'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.list({ page }),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Все уведомления отмечены как прочитанные')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Уведомление удалено')
    },
  })

  if (isLoading) return <PageSkeleton />

  const notifications = data?.data || []
  const unreadCount = data?.meta.unread_count || 0

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Уведомления</h1>
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} непрочитанных</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Нет уведомлений" description="Здесь появятся уведомления о событиях" icon={Bell} />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? 'opacity-60' : ''}>
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    <Badge variant={NOTIFICATION_TYPE_VARIANTS[n.type] || 'secondary'} className="text-xs">
                      {n.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDateTime(n.created_at)}</span>
                  </div>
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markReadMutation.mutate(n.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {data.meta.total_pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.total_pages} onClick={() => setPage(page + 1)}>
            Далее
          </Button>
        </div>
      )}
    </div>
  )
}
