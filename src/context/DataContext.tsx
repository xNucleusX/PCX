import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { clearDrugs, countDrugs, getAllDrugs, getMeta, putDrugs, setMeta } from '../lib/db'
import type { Drug, DrugDataFile, SyncStatus } from '../lib/types'

interface DataContextValue {
  drugs: Drug[]
  drugById: Map<string, Drug>
  syncStatus: SyncStatus
  syncError: string | null
  isOnline: boolean
  lastSyncTime: string | null
  totalDrugs: number
  triggerSync: () => Promise<void>
  resetDatabase: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

const DATA_URL = `${import.meta.env.BASE_URL}data/initial-drugs.json`.replace(/\/\//g, '/')
const META_GENERATED_AT = 'generatedAt'
const META_LAST_SYNC = 'lastSyncTime'

export function DataProvider({ children }: { children: ReactNode }) {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const hasInitialized = useRef(false)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const loadFromBundle = useCallback(async () => {
    setSyncStatus('syncing')
    setSyncError(null)
    try {
      const res = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to fetch drug database (${res.status})`)
      const data: DrugDataFile = await res.json()
      await putDrugs(data.drugs)
      await setMeta(META_GENERATED_AT, data.metadata.generatedAt)
      const now = new Date().toISOString()
      await setMeta(META_LAST_SYNC, now)
      setLastSyncTime(now)
      setDrugs(data.drugs)
      setSyncStatus('ready')
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Unknown sync error')
      setSyncStatus('error')
    }
  }, [])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    ;(async () => {
      const existingCount = await countDrugs()
      if (existingCount > 0) {
        const cached = await getAllDrugs()
        setDrugs(cached)
        setSyncStatus('ready')
        const storedSync = await getMeta(META_LAST_SYNC)
        if (typeof storedSync === 'string') setLastSyncTime(storedSync)
      } else {
        await loadFromBundle()
      }
    })()
  }, [loadFromBundle])

  const resetDatabase = useCallback(async () => {
    await clearDrugs()
    setDrugs([])
    await loadFromBundle()
  }, [loadFromBundle])

  const drugById = useMemo(() => {
    const map = new Map<string, Drug>()
    for (const drug of drugs) map.set(drug.id, drug)
    return map
  }, [drugs])

  const value: DataContextValue = {
    drugs,
    drugById,
    syncStatus,
    syncError,
    isOnline,
    lastSyncTime,
    totalDrugs: drugs.length,
    triggerSync: loadFromBundle,
    resetDatabase,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
