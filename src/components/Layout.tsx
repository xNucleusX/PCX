import { useState, type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 bg-background p-4 md:p-6 lg:p-8">
          <div className="container mx-auto px-0 sm:px-2">{children}</div>
        </main>
      </div>
      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        Lautan Poison
      </footer>
    </div>
  )
}
