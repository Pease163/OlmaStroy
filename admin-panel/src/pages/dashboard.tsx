import { useQuery } from '@tanstack/react-query'
import { FileText, Briefcase, Building2, MessageSquare, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageSkeleton } from '@/components/loading-skeleton'
import { dashboardApi } from '@/api/dashboard'
import { formatDateTime } from '@/lib/utils'
import { ACTION_LABELS, ENTITY_LABELS } from '@/lib/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.stats,
  })

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: dashboardApi.charts,
  })

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardApi.activity,
  })

  if (statsLoading) return <PageSkeleton />

  const statCards = [
    { label: 'Посты', value: stats?.blog_posts ?? 0, sub: `${stats?.blog_posts_published ?? 0} опубл.`, icon: FileText, color: 'text-blue-500' },
    { label: 'Вакансии', value: stats?.vacancies ?? 0, sub: `${stats?.vacancies_active ?? 0} активн.`, icon: Briefcase, color: 'text-green-500' },
    { label: 'Проекты', value: stats?.projects ?? 0, sub: `${stats?.projects_visible ?? 0} видимых`, icon: Building2, color: 'text-amber-500' },
    { label: 'Заявки', value: stats?.contacts ?? 0, sub: `${stats?.contacts_unread ?? 0} новых`, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Пользователи', value: stats?.users ?? 0, sub: '', icon: Users, color: 'text-rose-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                  {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {!chartsLoading && charts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Posts by month */}
          <Card>
            <CardHeader><CardTitle className="text-base">Публикации по месяцам</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.posts_by_month}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Contacts by week */}
          <Card>
            <CardHeader><CardTitle className="text-base">Заявки по неделям</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.contacts_by_week}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vacancies by type */}
          <Card>
            <CardHeader><CardTitle className="text-base">Вакансии по типу</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={charts.vacancies_by_type} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                    {charts.vacancies_by_type.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by category */}
          <Card>
            <CardHeader><CardTitle className="text-base">Проекты по категориям</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={charts.projects_by_category} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                    {charts.projects_by_category.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent activity */}
      <Card>
        <CardHeader><CardTitle className="text-base">Последние действия</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity?.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {ACTION_LABELS[log.action] || log.action}
                  </Badge>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{log.user || 'Система'}</span>
                      {' — '}
                      {ENTITY_LABELS[log.entity_type || ''] || log.entity_type}
                      {log.entity_title && `: ${log.entity_title}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            ))}
            {(!activity || activity.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Нет действий</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
