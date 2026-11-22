import { MOCK_REPORTS } from '../data/mockReports.js'

// Set VITE_API_BASE in .env for a deployed server (e.g. https://sachet.onrender.com).
// Empty = same origin (dev proxy in vite.config.js forwards /api to :8000).
const BASE = import.meta.env.VITE_API_BASE ?? ''

// GET /api/reports?limit=  → Report[]  (or { reports: Report[] })
// Falls back to local sample data if the server is down, so UI work never blocks.
export async function fetchReports(limit = 1000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3000)
  try {
    const res = await fetch(`${BASE}/api/reports?limit=${limit}`, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const reports = Array.isArray(data) ? data : data.reports ?? []
    return { reports, source: 'live' }
  } catch {
    return { reports: MOCK_REPORTS, source: 'sample' }
  } finally {
    clearTimeout(timer)
  }
}
