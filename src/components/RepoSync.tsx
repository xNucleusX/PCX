import { CloudDownload, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../context/DataContext'
import { cn } from '../lib/utils'

const SECRET_KEY = 'pcx-sync-secret'
const API = import.meta.env.VITE_SYNC_API as string | undefined

interface SyncResult {
  changed: boolean
  added?: number
  removed?: number
  modified?: number
  totalDrugs?: number
  error?: string
}

// Pulls fresh data from Rx Note via the Vercel function, which commits it to the
// repo. The push triggers a Pages rebuild, so new data appears after that deploy.
export function RepoSync() {
  const { resetDatabase } = useData()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  // ponytail: secret in localStorage, typed once by the operator. Ceiling — it is
  // a shared password, not per-user auth. Upgrade to real auth if more than one
  // person ever needs to press this.
  async function run() {
    if (!API) {
      setResult({ changed: false, error: 'VITE_SYNC_API not configured at build time' })
      return
    }
    let secret = localStorage.getItem(SECRET_KEY)
    if (!secret) {
      secret = window.prompt('Sync password (stored in this browser only):')
      if (!secret) return
      localStorage.setItem(SECRET_KEY, secret)
    }

    setBusy(true)
    setResult(null)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-sync-secret': secret },
      })
      const body = await res.json()
      if (res.status === 401) {
        localStorage.removeItem(SECRET_KEY)
        setResult({ changed: false, error: 'Wrong password — cleared, press again to retry' })
        return
      }
      if (!res.ok) {
        setResult({ changed: false, error: body.error ?? `Sync failed (${res.status})` })
        return
      }
      setResult({
        changed: body.changed,
        added: body.added,
        removed: body.removed,
        modified: body.modified,
        totalDrugs: body.totalDrugs,
      })
      // Drop the local cache so the next Pages deploy's data is picked up.
      if (body.changed) await resetDatabase()
    } catch (err) {
      setResult({ changed: false, error: err instanceof Error ? err.message : 'Network error' })
    } finally {
      setBusy(false)
    }
  }

  const label = busy
    ? 'Checking Rx Note for updates...'
    : result?.error
      ? result.error
      : result
        ? result.changed
          ? `Pushed: +${result.added} / -${result.removed} / ~${result.modified} — ${result.totalDrugs} drugs. Live after the deploy finishes.`
          : 'Already up to date with Rx Note'
        : 'Pull latest data from Rx Note'

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-full border-none bg-transparent p-2 transition-colors',
        busy ? 'cursor-default text-muted-foreground' : 'cursor-pointer hover:bg-accent',
        result?.error && 'text-destructive',
      )}
    >
      {busy ? (
        <RotateCw className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <CloudDownload className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  )
}
