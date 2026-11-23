// Official login. Citizens never log in; only the dashboard does.
// The token lives in sessionStorage, so it is gone when the tab is closed.
const KEY = 'sachet_official_token'
const BASE = import.meta.env.VITE_API_BASE ?? ''

export function getToken() {
  try {
    return sessionStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {}
}

// Returns { ok: true } or { ok: false, reason: 'wrong' | 'not_configured' | 'unreachable' }
export async function login(username, password) {
  const ctrl = new AbortController()
  // Generous timeout: the free server can take up to a minute to wake up
  const timer = setTimeout(() => ctrl.abort(), 60000)
  try {
    const res = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: ctrl.signal,
    })
    if (res.status === 401) return { ok: false, reason: 'wrong' }
    if (res.status === 503) return { ok: false, reason: 'not_configured' }
    if (!res.ok) return { ok: false, reason: 'unreachable' }
    const { token } = await res.json()
    sessionStorage.setItem(KEY, token)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'unreachable' }
  } finally {
    clearTimeout(timer)
  }
}
