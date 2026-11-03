// POST /api/sync — pull fresh drug data from Rx Note and commit it to this repo.
//
// Runs on Vercel so GH_TOKEN never reaches the browser. The static site (GitHub
// Pages) calls this endpoint; the resulting push triggers deploy.yml, which
// rebuilds Pages with the new data.
import { diffDrugs } from './_diff.mjs'

const UPSTREAM = 'https://lookup.myrxnote.com/data/drugs.json'
const DATA_PATH = 'public/data/initial-drugs.json'
const REPO = process.env.GH_REPO ?? 'xNucleusX/PCX'
const BRANCH = process.env.GH_BRANCH ?? 'main'
// Pages is a separate origin from this function, so CORS is required.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://xnucleusx.github.io'
// Vercel will not rename a Sensitive env var's key, so accept either spelling.
export const token = () => process.env.GH_TOKEN || process.env.PCX_GH_Token

const gh = async (path, init = {}) => {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token()}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      ...init.headers,
    },
  })
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status} ${await res.text()}`)
  return res.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-sync-secret')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  // Without this the endpoint is a public write button on the repo.
  if (!process.env.SYNC_SECRET || req.headers['x-sync-secret'] !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!token()) return res.status(500).json({ error: 'GH_TOKEN not configured' })

  try {
    const upRes = await fetch(UPSTREAM, { headers: { 'user-agent': 'pcx-sync' } })
    if (!upRes.ok) return res.status(502).json({ error: `Rx Note returned ${upRes.status}` })
    const fresh = await upRes.json()
    if (!Array.isArray(fresh?.drugs) || fresh.drugs.length === 0) {
      return res.status(502).json({ error: 'Upstream payload malformed or empty' })
    }

    // Current committed copy, read through the raw host (the Contents API caps at ~1 MB).
    const curRes = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_PATH}`,
      { headers: { 'cache-control': 'no-cache' } },
    )
    const current = curRes.ok ? await curRes.json() : { drugs: [] }

    const { added, removed, changed, hasRealChange } = diffDrugs(current, fresh)
    // `modified`, not `changed`: the top-level `changed` flag is a boolean and a
    // same-named count here would silently overwrite it in the spread below.
    const counts = {
      added: added.length,
      removed: removed.length,
      modified: changed.length,
      totalDrugs: fresh.drugs.length,
      generatedAt: fresh.metadata?.generatedAt ?? null,
    }

    if (!hasRealChange) return res.status(200).json({ changed: false, ...counts })

    // Commit via the Git Data API: blob -> tree -> commit -> ref. The Contents
    // API would reject a ~10 MB base64 body.
    const ref = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`)
    const parentSha = ref.object.sha
    const parentCommit = await gh(`/repos/${REPO}/git/commits/${parentSha}`)

    const blob = await gh(`/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: Buffer.from(JSON.stringify(fresh, null, 2)).toString('base64'),
        encoding: 'base64',
      }),
    })
    const tree = await gh(`/repos/${REPO}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: parentCommit.tree.sha,
        tree: [{ path: DATA_PATH, mode: '100644', type: 'blob', sha: blob.sha }],
      }),
    })
    const commit = await gh(`/repos/${REPO}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message:
          `Sync drug data from Rx Note (${counts.totalDrugs} drugs)\n\n` +
          `+${counts.added} / -${counts.removed} / ~${counts.modified}\n` +
          `upstream generatedAt: ${counts.generatedAt}`,
        tree: tree.sha,
        parents: [parentSha],
      }),
    })
    // Not forced: a concurrent push wins and this returns 422 rather than clobbering it.
    await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    })

    return res.status(200).json({ changed: true, commit: commit.sha, ...counts })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
