import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Briefcase, Building2,
  MessageSquare, Users, Shield, Settings, ScrollText,
  Bell, ChevronLeft, ChevronRight, ExternalLink,
  Wrench, FileCheck, Star, Truck, Image,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/sidebar-context'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, Briefcase, Building2,
  MessageSquare, Users, Shield, Settings, ScrollText, Bell,
  Wrench, FileCheck, Star, Truck, Image,
}

const navItems = NAV_ITEMS.map((item) => ({
  ...item,
  end: item.path === '/panel',
}))

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-sidebar transition-all duration-300 lg:relative lg:z-auto',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/20">
          {!isCollapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              Олма<span className="text-sidebar-active">СТРОЙ</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8 text-sidebar-foreground hover:bg-white/10"
            onClick={toggleCollapsed}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon]
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        'hover:bg-white/10',
                        isActive
                          ? 'bg-white/15 text-sidebar-active font-medium'
                          : 'text-sidebar-foreground/70',
                        isCollapsed && 'justify-center px-2'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-white/20" />
        <div className="p-4 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              'hover:bg-white/10 text-sidebar-foreground/70',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Открыть сайт</span>}
          </a>
          {!isCollapsed && (
            <p className="text-xs text-sidebar-foreground/50">Admin Panel v2.0</p>
          )}
        </div>
      </aside>
    </>
  )
}
