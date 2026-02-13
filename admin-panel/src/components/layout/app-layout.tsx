import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { PageSkeleton } from '@/components/loading-skeleton'

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <PageSkeleton />
  if (!isAuthenticated) return <Navigate to="/panel/login" replace />

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
