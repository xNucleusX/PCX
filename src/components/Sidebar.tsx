import { House, Info, RotateCcw } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { cn } from '../lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { resetDatabase, syncStatus } = useData()

  const navItems = [
    { to: '/', label: 'Home', icon: House },
    { to: '/about', label: 'About', icon: Info },
  ]

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:sticky md:top-16 md:h-[calc(100svh-4rem)] md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav className="flex h-full flex-col gap-2 overflow-y-auto p-4">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Menu
          </span>
          <ul className="flex w-full min-w-0 flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    data-active={active}
                    className="flex h-8 w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                type="button"
                aria-label="Reset local drug database"
                disabled={syncStatus === 'syncing'}
                onClick={() => {
                  onClose()
                  resetDatabase()
                }}
                className="flex h-8 w-full items-center gap-2 rounded-md p-2 text-left text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Reset Database
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}
