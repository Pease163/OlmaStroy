import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MailOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { contactsApi } from '@/api/contacts'
import { FormSkeleton } from '@/components/loading-skeleton'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.get(Number(id)),
    enabled: !!id,
  })

  const markReadMutation = useMutation({
    mutationFn: () => contactsApi.markRead(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Отмечено как прочитанное')
    },
  })

  if (isLoading) return <FormSkeleton />
  if (!contact) return null

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/panel/contacts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Заявка #{contact.id}</h1>
        <Badge variant={contact.is_read ? 'secondary' : 'warning'}>
          {contact.is_read ? 'Прочитано' : 'Новое'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о заявке</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Имя</p>
              <p className="font-medium">{contact.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Дата</p>
              <p className="font-medium">{formatDateTime(contact.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Телефон</p>
              <p className="font-medium">{contact.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{contact.email || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Тема</p>
              <p className="font-medium">{contact.subject || '—'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Сообщение</p>
            <div className="rounded-md border p-4 bg-muted/50">
              <p className="whitespace-pre-wrap">{contact.message || '—'}</p>
            </div>
          </div>

          {!contact.is_read && (
            <>
              <Separator />
              <Button onClick={() => markReadMutation.mutate()} disabled={markReadMutation.isPending}>
                {markReadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <MailOpen className="mr-2 h-4 w-4" />
                Отметить как прочитанное
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
