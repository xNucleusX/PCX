import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useData } from '../context/DataContext'

const MAX_RESULTS = 200

export function Home() {
  const { drugs, syncStatus, totalDrugs } = useData()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return drugs.filter(
      (d) =>
        d.genericNameSearch?.toLowerCase().includes(q) ||
        d.brandNameSearch?.toLowerCase().includes(q) ||
        d.synonymsSearch?.toLowerCase().includes(q),
    )
  }, [drugs, query])

  const visibleResults = results.slice(0, MAX_RESULTS)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl">
      <div className="flex flex-col space-y-1.5 p-6 md:p-8">
        <h1 className="flex items-center text-2xl font-extrabold tracking-tight text-primary">
          Drug Database
        </h1>
        <p className="text-sm text-muted-foreground">
          Search drugs by Generic Name, Synonyms, or Brand Name
        </p>
      </div>
      <div className="px-6 pb-6 md:px-8">
        <div className="relative">
          <label htmlFor="drugSearchInput" className="sr-only">
            Search drugs by Generic Name, Synonyms, or Brand Name
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="drugSearchInput"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Generic Name, Synonyms, or Brand Name..."
            className="h-11 w-full rounded-md border border-input bg-background pl-12 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
          />
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b [&_tr]:border-border">
              <tr>
                <th className="w-[60%] px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Generic Name
                </th>
                <th className="w-[40%] px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Brand Name(s)
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {visibleResults.map((drug) => (
                <tr
                  key={drug.id}
                  className="border-b border-border transition-colors hover:bg-accent/50"
                >
                  <td className="px-6 py-4">
                    <Link to={`/drug/${drug.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                      {drug.genericName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {drug.brandName || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {query.trim() === '' && (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            {syncStatus === 'syncing'
              ? 'Loading drug database…'
              : `Start typing to search ${totalDrugs.toLocaleString()} entries.`}
          </div>
        )}
        {query.trim() !== '' && results.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No drugs found matching "{query}".
          </div>
        )}
        {results.length > MAX_RESULTS && (
          <div className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
            Showing {MAX_RESULTS} of {results.length} matches — refine your search for more precise results.
          </div>
        )}
      </div>
    </div>
  )
}
