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
    return localStorage.getItem(LANG_KEY) || 'hi'
  } catch {
    return 'hi'
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
    }
    return true
  } catch (err) {
    console.error('Failed to save citizen report', err)
    return false
  }
}

