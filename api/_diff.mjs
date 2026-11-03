// Shared diff logic for the Rx Note sync. Kept separate from the handler so it
// can be unit-tested without network or secrets.

// Fields that change on every upstream build without the data actually moving:
//   lastUpdated - re-stamped each time they regenerate the file
//   mdc, neml   - null on all rows (absent in older exports, present-as-null now)
// Verified 2026-11-03 against both files: 3449 rows "changed" on these alone.
export const NOISE_FIELDS = new Set(['lastUpdated', 'mdc', 'neml'])

/**
 * Compare two Rx Note payloads by drug id.
 * @returns {{added:string[], removed:string[], changed:string[], hasRealChange:boolean}}
 */
export function diffDrugs(oldData, newData) {
  const oldById = new Map((oldData?.drugs ?? []).map((d) => [d.id, d]))
  const newById = new Map((newData?.drugs ?? []).map((d) => [d.id, d]))

  const added = [...newById.keys()].filter((id) => !oldById.has(id))
  const removed = [...oldById.keys()].filter((id) => !newById.has(id))

  const changed = []
  for (const [id, next] of newById) {
    const prev = oldById.get(id)
    if (!prev) continue
    const fields = new Set([...Object.keys(prev), ...Object.keys(next)])
    for (const f of fields) {
      if (NOISE_FIELDS.has(f)) continue
      if (JSON.stringify(prev[f]) !== JSON.stringify(next[f])) {
        changed.push(id)
        break
      }
    }
  }

  return {
    added,
    removed,
    changed,
    hasRealChange: added.length > 0 || removed.length > 0 || changed.length > 0,
  }
}
