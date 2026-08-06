export interface Drug {
  id: string
  genericName: string
  synonyms: string | null
  brandName: string | null
  prescriberCategory: string | null
  indications: string | null
  prescribingRestrictions: string | null
  dosages: string | null
  adverseReactions: string | null
  contraindications: string | null
  interactions: string | null
  precautions: string | null
  methodOfPurchase: string | null
  notes: string | null
  genericNameSearch: string
  brandNameSearch: string
  synonymsSearch: string
  lastUpdated: string
}

export interface DrugDataFile {
  metadata: {
    generatedAt: string
    source: string
    totalDrugs: number
  }
  drugs: Drug[]
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'ready'
