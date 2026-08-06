import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Drug } from './types'

const DB_NAME = 'rxlookup-db'
const DB_VERSION = 1
const DRUGS_STORE = 'drugs'
const META_STORE = 'meta'

interface RxLookupDB extends DBSchema {
  drugs: {
    key: string
    value: Drug
  }
  meta: {
    key: string
    value: string | number
  }
}

let dbPromise: Promise<IDBPDatabase<RxLookupDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<RxLookupDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(DRUGS_STORE)) {
          db.createObjectStore(DRUGS_STORE, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE)
        }
      },
    })
  }
  return dbPromise
}

export async function getAllDrugs(): Promise<Drug[]> {
  const db = await getDB()
  return db.getAll(DRUGS_STORE)
}

export async function putDrugs(drugs: Drug[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(DRUGS_STORE, 'readwrite')
  await Promise.all(drugs.map((drug) => tx.store.put(drug)))
  await tx.done
}

export async function clearDrugs(): Promise<void> {
  const db = await getDB()
  await db.clear(DRUGS_STORE)
}

export async function getMeta(key: string): Promise<string | number | undefined> {
  const db = await getDB()
  return db.get(META_STORE, key)
}

export async function setMeta(key: string, value: string | number): Promise<void> {
  const db = await getDB()
  await db.put(META_STORE, value, key)
}

export async function countDrugs(): Promise<number> {
  const db = await getDB()
  return db.count(DRUGS_STORE)
}
