import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { SyncStatus } from './SyncStatus'
import { RepoSync } from './RepoSync'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <Link to="/" className="group mr-6 flex items-center space-x-2">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Lautan Poison logo" className="h-6 w-6" />
          <span className="text-2xl font-extrabold text-foreground transition-colors group-hover:text-primary sm:inline-block">
            Lautan Poison
          </span>
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
        <SyncStatus />
        <RepoSync />
      </div>
    </header>
  )
}
