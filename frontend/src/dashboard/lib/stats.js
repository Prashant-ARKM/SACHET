// Pure counting helpers. The dashboard only draws counts; the ML model only classifies.
const DAY = 86400000

export function filterReports(reports, { district = '', type = '', days = 0 } = {}) {
  const since = days ? Date.now() - days * DAY : 0
  return reports.filter(
    (r) =>
      (!district || r.district === district) &&
      (!type || r.scam_type === type) &&
      (!since || new Date(r.created_at).getTime() >= since),
  )
}

export function countBy(reports, key) {
  const out = {}
  for (const r of reports) out[r[key]] = (out[r[key]] ?? 0) + 1
  return out
}

export const sortedCounts = (counts) =>
  Object.entries(counts).sort((a, b) => b[1] - a[1])

// Reports per rolling 24 h window for the last `days` days, oldest first.
// (Rolling, not calendar days, so "today" never looks like a sudden drop.)
export function dailySeries(reports, days = 30) {
  const now = Date.now()
  const buckets = Array.from({ length: days }, (_, i) => ({
    date: new Date(now - (days - 1 - i) * DAY),
    count: 0,
  }))
  for (const r of reports) {
    const ago = Math.floor((now - new Date(r.created_at).getTime()) / DAY)
    if (ago >= 0 && ago < days) buckets[days - 1 - ago].count++
  }
  return buckets
}

// Last 7 days vs the 7 days before, per district.
export function districtTrend(reports) {
  const now = Date.now()
  const rows = {}
  for (const r of reports) {
    const age = now - new Date(r.created_at).getTime()
    const row = (rows[r.district] ??= { district: r.district, last7: 0, prev7: 0 })
    if (age < 7 * DAY) row.last7++
    else if (age < 14 * DAY) row.prev7++
  }
  return Object.values(rows)
    .map((r) => ({ ...r, change: r.prev7 ? (r.last7 - r.prev7) / r.prev7 : r.last7 ? 1 : 0 }))
    .sort((a, b) => b.last7 - a.last7)
}

export function totals(reports) {
  const lost = reports.filter((r) => r.amount_lost > 0)
  return {
    count: reports.length,
    amountLost: lost.reduce((s, r) => s + r.amount_lost, 0),
    victimsWithLoss: lost.length,
    last24h: reports.filter((r) => Date.now() - new Date(r.created_at).getTime() < DAY).length,
  }
}

export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

// Sum of valueFn per rolling 24 h window (for sparklines). Default: count.
export function dailyValues(reports, days = 14, valueFn = () => 1) {
  const now = Date.now()
  const out = Array(days).fill(0)
  for (const r of reports) {
    const ago = Math.floor((now - new Date(r.created_at).getTime()) / DAY)
    if (ago >= 0 && ago < days) out[days - 1 - ago] += valueFn(r)
  }
  return out
}

// Reports in the window just before the current one (same length), for "vs previous".
export function previousWindow(reports, days) {
  if (!days) return null
  const now = Date.now()
  return reports.filter((r) => {
    const age = now - new Date(r.created_at).getTime()
    return age >= days * DAY && age < 2 * days * DAY
  })
}

export const pctChange = (now, before) => (before ? (now - before) / before : now ? 1 : 0)

// Biggest absolute rise this week (ignores tiny numbers).
function biggestRise(reports, key) {
  const now = Date.now()
  const rows = {}
  for (const r of reports) {
    const age = now - new Date(r.created_at).getTime()
    const row = (rows[r[key]] ??= { name: r[key], last7: 0, prev7: 0 })
    if (age < 7 * DAY) row.last7++
    else if (age < 14 * DAY) row.prev7++
  }
  return (
    Object.values(rows)
      .filter((r) => r.last7 >= 5)
      .map((r) => ({ ...r, diff: r.last7 - r.prev7, change: pctChange(r.last7, r.prev7) }))
      .sort((a, b) => b.diff - a.diff)[0] ?? null
  )
}
export const risingDistrict = (reports) => biggestRise(reports, 'district')
export const risingType = (reports) => biggestRise(reports, 'scam_type')

// Short Indian format for tight spaces: ₹74.7 L, ₹1.2 Cr, ₹9,500
export function inrShort(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`
  return inr(n)
}
