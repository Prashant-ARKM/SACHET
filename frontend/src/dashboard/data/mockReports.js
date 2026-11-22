// UI-only fallback data, used when the FastAPI server is not reachable.
// The real demo data comes from M2's simulator (model-scored messages).
// Same shape as the shared Report contract. Deterministic (seeded).
import { DISTRICTS } from '../../shared/districts.js'

function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(42)
const pick = (weights) => {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [k, w] of entries) if ((r -= w) <= 0) return k
  return entries[0][0]
}

// Busy districts vs quiet ones (everything else gets weight 1).
const BASE_WEIGHT = {
  Raipur: 18, Bilaspur: 12, Durg: 12, Korba: 7, Raigarh: 6, Rajnandgaon: 5,
  'Janjgir-Champa': 4, 'Sarangarh-Bilaigarh': 3, Dantewada: 3, Mahasamund: 3, Surguja: 3,
}
// "Rising" in the last 7 days (matches reported local trends).
const RISING_WEIGHT = { Bilaspur: 22, 'Sarangarh-Bilaigarh': 12, Dantewada: 7 }

const TYPE_WEIGHT = {
  otp: 20, kyc: 14, fake_qr: 12, phishing_link: 12, loan_app: 10, scam_call: 8,
  digital_arrest: 8, courier_customs: 6, fake_scheme: 8, mule_recruitment: 5, other: 3,
}
// District-specific flavour.
const TYPE_BOOST = {
  Bilaspur: { digital_arrest: 30 },
  'Sarangarh-Bilaigarh': { fake_scheme: 40 },
  Dantewada: { mule_recruitment: 30 },
}
const CHANNEL_WEIGHT = { sms: 45, whatsapp: 35, call: 15, other: 5 }

const weightsFor = (recent) =>
  Object.fromEntries(
    DISTRICTS.map((d) => [d.name, (BASE_WEIGHT[d.name] ?? 1) + (recent ? RISING_WEIGHT[d.name] ?? 0 : 0)]),
  )

const digits = (n) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join('')

function makeReport(i, ageDays) {
  const recent = ageDays < 7
  const district = pick(weightsFor(recent))
  const scam_type = pick({ ...TYPE_WEIGHT, ...(TYPE_BOOST[district] ?? {}) })
  const lost = rand() < 0.35
  return {
    id: `demo-${i}`,
    scam_type,
    district,
    channel: pick(CHANNEL_WEIGHT),
    scammer: {
      phone: rand() < 0.8 ? `+91 9${digits(9)}` : null,
      upi_id: rand() < 0.5 ? `pay${digits(4)}@ybl` : null,
      url: rand() < 0.3 ? `http://bit.ly/${digits(5)}` : null,
    },
    amount_lost: lost ? Math.round(500 + rand() ** 2 * 150000) : 0,
    created_at: new Date(Date.now() - ageDays * 86400000).toISOString(),
    consent: true,
  }
}

const N = 450
export const MOCK_REPORTS = Array.from({ length: N }, (_, i) => {
  // More reports in recent days (skewed toward 0).
  const ageDays = 30 * rand() ** 1.4
  return makeReport(i, ageDays)
}).sort((a, b) => b.created_at.localeCompare(a.created_at))
