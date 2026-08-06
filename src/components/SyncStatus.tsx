import { CloudOff, RotateCw, CloudCheck, CircleAlert } from 'lucide-react'
import { useData } from '../context/DataContext'
import { cn } from '../lib/utils'

export function SyncStatus() {
  const { syncStatus, syncError, isOnline, totalDrugs, lastSyncTime, triggerSync } = useData()

  let icon = <CloudCheck className="h-5 w-5" aria-hidden="true" />
  let label = `Drug database ready — ${totalDrugs} entries`
  let interactive = true
  let colorClass = 'text-emerald-600 dark:text-emerald-400'

  if (syncStatus === 'syncing') {
    icon = <RotateCw className="h-5 w-5 animate-spin" aria-hidden="true" />
    label = 'Syncing drug database...'
    interactive = false
    colorClass = 'text-muted-foreground'
  } else if (!isOnline && syncStatus !== 'ready') {
    icon = <CloudOff className="h-5 w-5" aria-hidden="true" />
    label = 'Offline — using cached database'
    colorClass = 'text-muted-foreground'
  } else if (syncStatus === 'error') {
    icon = <CircleAlert className="h-5 w-5" aria-hidden="true" />
    label = syncError ? `Sync failed: ${syncError}` : 'Sync failed'
    colorClass = 'text-destructive'
  }

  if (lastSyncTime && syncStatus === 'ready') {
    label += ` · last synced ${new Date(lastSyncTime).toLocaleString()}`
  }

  return (
    <button
      type="button"
      onClick={() => interactive && triggerSync()}
      disabled={!interactive}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-full border-none bg-transparent p-2 transition-colors',
        interactive ? 'cursor-pointer hover:bg-accent' : 'cursor-default',
        colorClass,
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  )
}
