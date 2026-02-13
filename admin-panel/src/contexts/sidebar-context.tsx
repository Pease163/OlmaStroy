import { createContext, useContext, useState, type ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapsed: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev))
      return !prev
    })
  }

  const toggleMobile = () => setIsMobileOpen((prev) => !prev)
  const closeMobile = () => setIsMobileOpen(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within SidebarProvider')
  return context
}
