// Runnable check for the sync diff: node api/_diff.test.mjs
import assert from 'node:assert/strict'
import { diffDrugs } from './_diff.mjs'

const drug = (id, over = {}) => ({
  id,
  genericName: `Drug ${id}`,
  brandName: null,
  lastUpdated: '2026-01-01T00:00:00.000Z',
  mdc: null,
  neml: null,
  ...over,
})
const file = (drugs) => ({ metadata: { generatedAt: 'x' }, drugs })

// Noise-only churn must NOT count as a change — this is the whole point of the
// skip check. Upstream re-stamps lastUpdated on every build.
{
  const a = file([drug('1')])
  const b = file([drug('1', { lastUpdated: '2026-10-26T15:16:46.755Z' })])
  const d = diffDrugs(a, b)
  assert.equal(d.hasRealChange, false, 'lastUpdated alone must not trigger a commit')
  assert.equal(d.changed.length, 0)
}

// mdc/neml going from absent to present-as-null is also noise.
{
  const bare = { id: '1', genericName: 'Drug 1', brandName: null, lastUpdated: 'z' }
  const d = diffDrugs(file([bare]), file([{ ...bare, mdc: null, neml: null }]))
  assert.equal(d.hasRealChange, false, 'absent -> null on mdc/neml must not trigger')
}

// Real content change is caught even when buried next to noise.
{
  const a = file([drug('1')])
  const b = file([drug('1', { brandName: 'Panadol', lastUpdated: 'later' })])
  const d = diffDrugs(a, b)
  assert.equal(d.hasRealChange, true)
  assert.deepEqual(d.changed, ['1'])
}

// Add / remove accounting.
{
  const d = diffDrugs(file([drug('1'), drug('2')]), file([drug('2'), drug('3')]))
  assert.deepEqual(d.added, ['3'])
  assert.deepEqual(d.removed, ['1'])
  assert.equal(d.changed.length, 0)
  assert.equal(d.hasRealChange, true)
}

// Empty / missing current copy (first sync, or raw fetch 404) counts as all-added.
{
  const d = diffDrugs({ drugs: [] }, file([drug('1')]))
  assert.deepEqual(d.added, ['1'])
  assert.equal(d.hasRealChange, true)
  assert.equal(diffDrugs(undefined, file([drug('1')])).added.length, 1)
}

// Identical payloads: no commit.
assert.equal(diffDrugs(file([drug('1')]), file([drug('1')])).hasRealChange, false)

console.log('all diff checks passed')
