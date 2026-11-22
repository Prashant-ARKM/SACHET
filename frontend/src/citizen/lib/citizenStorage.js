// Local storage helper for Citizen App (offline-first)
const DISTRICT_KEY = 'sachet_citizen_district'
const LANG_KEY = 'sachet_citizen_lang'
const SCORE_KEY = 'sachet_citizen_literacy_score'
const CHECKS_KEY = 'sachet_citizen_recent_checks'
const REPORTS_KEY = 'sachet_citizen_my_reports'
export const GLOBAL_CUSTOM_REPORTS_KEY = 'sachet_custom_reports'

export function getSavedDistrict() {
  try {
    return localStorage.getItem(DISTRICT_KEY) || 'Raipur'
  } catch {
    return 'Raipur'
  }
}

export function saveDistrict(district) {
  try {
    localStorage.setItem(DISTRICT_KEY, district)
  } catch {}
}

export function getSavedLanguage() {
  try {
    return localStorage.getItem(LANG_KEY) || 'en'
  } catch {
    return 'en'
  }
}

export function saveLanguage(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {}
}

export function getSavedScore() {
  try {
    const val = localStorage.getItem(SCORE_KEY)
    return val ? parseInt(val, 10) : 75
  } catch {
    return 75
  }
}

export function saveScore(score) {
  try {
    localStorage.setItem(SCORE_KEY, score.toString())
  } catch {}
}

export function getRecentChecks() {
  try {
    const raw = localStorage.getItem(CHECKS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecentCheck(item) {
  try {
    const list = getRecentChecks()
    const updated = [
      { id: 'chk_' + Date.now(), timestamp: new Date().toISOString(), ...item },
      ...list.filter((c) => c.originalText !== item.originalText).slice(0, 9),
    ]
    localStorage.setItem(CHECKS_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export function getCitizenReports() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}


// ---- send reports to the server (POST /api/reports) ----
const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const inFlight = new Set()

function readShared() {
  try {
    const raw = localStorage.getItem(GLOBAL_CUSTOM_REPORTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function postToServer(r) {
  if (inFlight.has(r.id)) return false
  inFlight.add(r.id)
  try {
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scam_type: r.scam_type,
        district: r.district,
        channel: r.channel,
        scammer: r.scammer,
        amount_lost: r.amount_lost,
        consent: true,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    localStorage.setItem(
      GLOBAL_CUSTOM_REPORTS_KEY,
      JSON.stringify(readShared().filter((x) => x.id !== r.id)),
    )
    return true
  } catch (err) {
    console.warn('Report kept locally, will retry when online', err)
    return false
  } finally {
    inFlight.delete(r.id)
  }
}

// Retry anything that is still only stored locally.
export async function flushPendingReports() {
  for (const r of readShared()) {
    if (r.source === 'citizen_app') await postToServer(r)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', flushPendingReports)
  setTimeout(flushPendingReports, 2000)
}

export function saveCitizenReport(report) {
  try {
    // 1. Save in citizen's private storage
    const myReports = getCitizenReports()
    const updatedMy = [report, ...myReports]
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedMy))

    // 2. If consented, publish to shared custom reports for the Official Dashboard
    if (report.consent) {
      const rawShared = localStorage.getItem(GLOBAL_CUSTOM_REPORTS_KEY)
      const sharedList = rawShared ? JSON.parse(rawShared) : []
      const officialReport = {
        id: report.id || `cit-${Date.now()}`,
        scam_type: report.scam_type || 'other',
        district: report.district || 'Raipur',
        channel: report.channel || 'sms',
        scammer: {
          phone: report.scammer_phone || null,
          upi_id: report.scammer_upi || null,
          url: report.scammer_url || null,
        },
        amount_lost: Number(report.amount_lost || 0),
        created_at: new Date().toISOString(),
        consent: true,
        source: 'citizen_app',
      }
      localStorage.setItem(GLOBAL_CUSTOM_REPORTS_KEY, JSON.stringify([officialReport, ...sharedList]))
      // 3. Also send it to the real server so officials on OTHER devices can see it.
      //    On success the local copy is removed (the dashboard then shows the server copy, no duplicate).
      //    On failure (offline) it stays in the local list and is retried later.
      postToServer(officialReport)
    }
    return true
  } catch (err) {
    console.error('Failed to save citizen report', err)
    return false
  }
}

