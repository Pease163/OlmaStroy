import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { settingsApi } from '@/api/settings'
import { PageSkeleton } from '@/components/loading-skeleton'
import { toast } from 'sonner'
import type { SiteSetting } from '@/types/models'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [initialized, setInitialized] = useState(false)

  const { data: groups, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    onSuccess: (data: Record<string, SiteSetting[]>) => {
      if (!initialized) {
        const initial: Record<string, string> = {}
        Object.values(data).flat().forEach((s) => {
          initial[s.key] = String(s.value ?? '')
        })
        setValues(initial)
        setInitialized(true)
      }
    },
  } as Parameters<typeof useQuery>[0])

  const saveMutation = useMutation({
    mutationFn: () => settingsApi.update(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Настройки сохранены')
    },
    onError: () => toast.error('Ошибка сохранения'),
  })

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const renderInput = (setting: SiteSetting) => {
    const val = values[setting.key] ?? ''
    switch (setting.value_type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={val === 'true'}
              onChange={(e) => handleChange(setting.key, String(e.target.checked))}
              className="h-4 w-4"
            />
            <span className="text-sm">{val === 'true' ? 'Включено' : 'Выключено'}</span>
          </label>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={val}
            onChange={(e) => handleChange(setting.key, e.target.value)}
          />
        )
      case 'text':
        return (
          <textarea
            value={val}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )
      case 'json':
        return (
          <textarea
            value={val}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )
      default:
        return (
          <Input
            value={val}
            onChange={(e) => handleChange(setting.key, e.target.value)}
          />
        )
    }
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки сайта</h1>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </div>

      {groups && Object.entries(groups).map(([group, settings]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-base">{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.key}>
                <label className="text-sm font-medium">{setting.label}</label>
                {setting.description && (
                  <p className="text-xs text-muted-foreground mb-1">{setting.description}</p>
                )}
                {renderInput(setting)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
