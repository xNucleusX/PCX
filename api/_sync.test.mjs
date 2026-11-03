// Guard checks for the sync endpoint: node api/_sync.test.mjs
// Underscore-prefixed so Vercel does not deploy it as a route.
// Verifies auth/method rejection without touching GitHub.
import assert from 'node:assert/strict'

process.env.SYNC_SECRET = 'test-secret'
delete process.env.GH_TOKEN

const { default: handler } = await import('./sync.mjs')

const mockRes = () => {
  const r = { code: 0, body: null, headers: {}, ended: false }
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v }
  r.status = (c) => { r.code = c; return r }
  r.json = (b) => { r.body = b; return r }
  r.end = () => { r.ended = true; return r }
  return r
}
const call = async (req) => { const res = mockRes(); await handler(req, res); return res }

// Preflight short-circuits before any auth check.
{
  const res = await call({ method: 'OPTIONS', headers: {} })
  assert.equal(res.code, 204)
  assert.equal(res.headers['access-control-allow-origin'], 'https://xnucleusx.github.io')
}

// GET is not a write verb.
assert.equal((await call({ method: 'GET', headers: {} })).code, 405)

// No secret, and wrong secret, must both be refused before anything is fetched.
assert.equal((await call({ method: 'POST', headers: {} })).code, 401)
assert.equal((await call({ method: 'POST', headers: { 'x-sync-secret': 'nope' } })).code, 401)

// Correct secret but no token: fails closed with a config error, never a push.
{
  const res = await call({ method: 'POST', headers: { 'x-sync-secret': 'test-secret' } })
  assert.equal(res.code, 500)
  assert.match(res.body.error, /GH_TOKEN/)
}

// With SYNC_SECRET unset the endpoint must refuse everything, not open up.
{
  delete process.env.SYNC_SECRET
  const res = await call({ method: 'POST', headers: { 'x-sync-secret': 'anything' } })
  assert.equal(res.code, 401, 'missing SYNC_SECRET must deny, not allow')
}

console.log('all sync guard checks passed')
