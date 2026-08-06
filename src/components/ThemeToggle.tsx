import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const Icon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Change theme. Current theme: ${theme[0].toUpperCase()}${theme.slice(1)}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Change theme</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="menuitem"
              onClick={() => {
                setTheme(opt.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                theme === opt.value && 'font-medium text-primary',
              )}
            >
              <opt.icon className="h-4 w-4" aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
