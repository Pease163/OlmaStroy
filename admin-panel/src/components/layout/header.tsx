import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/auth-context'
import { useSidebar } from '@/contexts/sidebar-context'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'
import { GlobalSearch } from '@/components/global-search'

export function Header() {
  const { user, logout } = useAuth()
  const { toggleMobile } = useSidebar()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/panel/login')
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobile}>
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            className="hidden sm:flex items-center gap-2 text-muted-foreground w-64"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Поиск...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">Ctrl</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/panel/notifications')}>
            <Bell className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm">{user?.username}</span>
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                align="end"
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                  onClick={() => navigate('/panel/profile')}
                >
                  <UserIcon className="h-4 w-4" />
                  Профиль
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
