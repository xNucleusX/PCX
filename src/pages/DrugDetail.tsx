import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext'
import type { Drug } from '../lib/types'

const FIELD_SECTIONS: { key: keyof Drug; label: string }[] = [
  { key: 'indications', label: 'Indications' },
  { key: 'dosages', label: 'Dosages' },
  { key: 'prescribingRestrictions', label: 'Prescribing Restrictions' },
  { key: 'contraindications', label: 'Contraindications' },
  { key: 'precautions', label: 'Precautions' },
  { key: 'interactions', label: 'Interactions' },
  { key: 'adverseReactions', label: 'Adverse Reactions' },
  { key: 'methodOfPurchase', label: 'Method of Purchase' },
  { key: 'notes', label: 'Notes' },
]

function HtmlBlock({ html }: { html: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(html), [html])
  return <div className="prose-content text-sm text-foreground" dangerouslySetInnerHTML={{ __html: clean }} />
}

export function DrugDetail() {
  const { id } = useParams<{ id: string }>()
  const { drugById, syncStatus } = useData()
  const drug = id ? drugById.get(id) : undefined

  if (syncStatus === 'syncing' && !drug) {
    return <p className="p-8 text-center text-muted-foreground">Loading drug database…</p>
  }

  if (!drug) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="mb-4 text-lg font-semibold">Drug not found</p>
        <p className="mb-6 text-sm text-muted-foreground">
          This entry doesn't exist in the local database, or the database hasn't finished loading yet.
        </p>
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl">
        <div className="space-y-2 border-b border-border p-6 md:p-8">
          <h1 className="text-2xl font-extrabold text-primary">{drug.genericName}</h1>
          {drug.brandName && (
            <p className="text-sm text-muted-foreground">
              Brand name(s): <span className="text-foreground">{drug.brandName}</span>
            </p>
          )}
          {drug.synonyms && (
            <div className="text-sm text-muted-foreground">
              Synonyms: <HtmlBlock html={drug.synonyms} />
            </div>
          )}
          {drug.prescriberCategory && drug.prescriberCategory !== 'NOT APPLICABLE' && (
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Prescriber Category: {drug.prescriberCategory}
            </span>
          )}
        </div>

        <div className="divide-y divide-border">
          {FIELD_SECTIONS.filter((section) => drug[section.key]).map((section) => (
            <div key={section.key} className="p-6 md:p-8">
              <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {section.label}
              </h2>
              <HtmlBlock html={drug[section.key] as string} />
            </div>
          ))}
          {FIELD_SECTIONS.every((section) => !drug[section.key]) && (
            <div className="p-6 text-sm text-muted-foreground md:p-8">
              No additional clinical information available for this entry.
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground md:px-8">
          Last updated {new Date(drug.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
