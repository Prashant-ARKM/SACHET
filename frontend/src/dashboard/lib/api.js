import { MOCK_REPORTS } from '../data/mockReports.js'

// Set VITE_API_BASE in .env for a deployed server (e.g. https://sachet.onrender.com).
// Empty = same origin (dev proxy in vite.config.js forwards /api to :8000).
const BASE = import.meta.env.VITE_API_BASE ?? ''

function getLocalCitizenReports() {
  try {
    const raw = localStorage.getItem('sachet_custom_reports')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// GET /api/reports?limit=  → Report[]  (or { reports: Report[] })
// Merges locally submitted citizen reports and falls back to local sample data if the server is down.
export async function fetchReports(limit = 1000) {
  const custom = getLocalCitizenReports()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(`${BASE}/api/reports?limit=${limit}`, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const rawReports = Array.isArray(data) ? data : data.reports ?? []
    return { reports: [...custom, ...rawReports], source: 'live' }
  } catch {
    return { reports: [...custom, ...MOCK_REPORTS], source: 'sample' }
  } finally {
    clearTimeout(timer)
  }
}
