// Signed QR alerts (QR relay).
// An official makes a campaign in the dashboard -> the alert is signed -> its QR goes on the poster.
// A citizen scans it in SACHET -> the signature is checked ON THE PHONE (WebCrypto, no internet)
// -> "Genuine" -> the citizen's phone can show the same QR so the next person scans it (relay).
//
// Token:  A1.<payload>.<signature>        (both base64url)
// QR:     <site>/a#<token>   (short path = smaller QR; /a forwards to /citizen/alert. The # part never reaches a server)
// payload = JSON {v:1, d:district id, t:scam type, i:issued YYYY-MM-DD, x:expires YYYY-MM-DD, n:random,
//                 m?: short quote of the real scam message, k?: up to 5 words the ML model flagged in it,
//                 b?: up to 6 scammer IDs citizens reported, approved by the official: "p|9876543210|5"
//                     (p = phone, u = UPI ID, l = link domain, then how many reports)}
// m + k make the QR an offline "pattern update": phones that saved the alert warn when a new
// message contains those words, and the relay carries the update phone to phone.
// The JSON is "packed" before base64: Devanagari letters (U+0900–U+097F) take 1 byte instead of 3,
// so a Hindi quote makes a much less dense QR. ASCII stays as is; any other character is 0x01 + 3 bytes.
// signature = ECDSA P-256 / SHA-256 over the payload string's bytes (the base64url text), raw r||s (64 bytes).
//
// Keys
//  - OFFICIAL: the server signs with a private key kept only on the server (env var).
//    The matching PUBLIC key goes in VITE_ALERT_PUBLIC_KEY (base64url, 65-byte uncompressed point).
//    A public key is safe to ship in the app; the private key must never be in this repo.
//  - DEMO: used when the server can't sign. Its private key is in this file, so anyone could copy it:
//    demo-signed alerts are always shown as "Demo signature", never as "from police".
import { DISTRICTS } from './districts.js'
import { SCAM_TYPES } from './scamTypes.js'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const OFFICIAL_PUBLIC_KEY = import.meta.env.VITE_ALERT_PUBLIC_KEY || ''
const SITE = import.meta.env.VITE_PUBLIC_URL || ''

const DEMO_KEY = {
  kty: 'EC',
  crv: 'P-256',
  x: '-RBt6LiUGEdOvh-ShskYlMvOKq7wqUPRSF9USR_QsEg',
  y: 'b3rt9lH91UlYzGvWkpZ05RLCaEXnvMokwYMaMk_NFo8',
}
const DEMO_PRIVATE_D = 'jw0Feyxt5pCw0wY5bC7scR8A-IPgurutuuHJ9z41Fng'

const ALG = { name: 'ECDSA', namedCurve: 'P-256' }
const SIGN = { name: 'ECDSA', hash: 'SHA-256' }

// ---------- base64url ----------
const enc = new TextEncoder()
function toB64u(bytes) {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64u(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

// ---------- compact text packing ----------
function pack(str) {
  const out = []
  for (const ch of str) {
    const cp = ch.codePointAt(0)
    if (cp < 0x80 && cp !== 0x01) out.push(cp)
    else if (cp >= 0x900 && cp <= 0x97f) out.push(0x80 + (cp - 0x900))
    else out.push(0x01, (cp >> 16) & 0xff, (cp >> 8) & 0xff, cp & 0xff)
  }
  return Uint8Array.from(out)
}
function unpack(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b === 0x01) {
      s += String.fromCodePoint((bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3])
      i += 3
    } else s += b < 0x80 ? String.fromCharCode(b) : String.fromCharCode(0x900 + (b - 0x80))
  }
  return s
}

// ---------- keys ----------
const hasCrypto = () => typeof crypto !== 'undefined' && !!crypto.subtle
let keysPromise = null
function getKeys() {
  if (!keysPromise) {
    keysPromise = (async () => {
      const demoPublic = await crypto.subtle.importKey('jwk', { ...DEMO_KEY, ext: true }, ALG, false, ['verify'])
      let official = null
      if (OFFICIAL_PUBLIC_KEY) {
        try {
          official = await crypto.subtle.importKey('raw', fromB64u(OFFICIAL_PUBLIC_KEY), ALG, false, ['verify'])
        } catch (err) {
          console.warn('VITE_ALERT_PUBLIC_KEY is not a valid P-256 public key', err)
        }
      }
      return { demoPublic, official }
    })()
  }
  return keysPromise
}

// ---------- making an alert (dashboard) ----------
const isoDay = (date) => date.toISOString().slice(0, 10)

export const canSign = () => hasCrypto()

export const MAX_QUOTE = 90
export const MAX_WORDS = 5
export const MAX_BLOCKED = 6

// ---------- scammer IDs (phone / UPI / link) ----------
// Phone -> last 10 digits of an Indian mobile; UPI -> lower case; link -> domain without www.
export function normPhone(s) {
  const d = String(s || '').replace(/\D/g, '')
  const ten = d.length >= 10 ? d.slice(-10) : ''
  return /^[6-9]\d{9}$/.test(ten) ? ten : ''
}
export const normUpi = (s) => {
  const v = String(s || '').trim().toLowerCase()
  return /^[a-z0-9._-]{2,}@[a-z0-9]{2,}$/.test(v) ? v : ''
}
// Link shorteners: the domain says nothing, so the short code is the ID (bit.ly/48213).
// Big platforms are never treated as a scammer ID.
const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at', 'tiny.cc', 'ow.ly'])
const PLATFORMS = new Set(['google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'whatsapp.com', 'wa.me', 't.me', 'telegram.org', 'gmail.com', 'gov.in', 'nic.in', 'npci.org.in', 'rbi.org.in'])
export function normLink(s) {
  const m = String(s || '').trim().toLowerCase().match(/^(?:[a-z]+:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:\/([a-z0-9_-]+))?/)
  if (!m) return ''
  const [, domain, code] = m
  if (SHORTENERS.has(domain)) return code ? `${domain}/${code}` : ''
  if (PLATFORMS.has(domain) || domain.endsWith('.gov.in') || domain.endsWith('.nic.in')) return ''
  return domain
}
const NORM = { p: normPhone, u: normUpi, l: normLink }

// For display: phone as 98765 43210
export const showId = (x) => (x.kind === 'p' ? `${x.value.slice(0, 5)} ${x.value.slice(5)}` : x.value)

// Every phone number, UPI ID and link domain in a piece of text
export function extractIds(text) {
  const t = String(text || '')
  const out = []
  for (const m of t.matchAll(/(?:\+?91[\s-]?|0)?[6-9](?:[\s-]?\d){9}/g)) {
    const v = normPhone(m[0])
    if (v) out.push({ kind: 'p', value: v })
  }
  for (const m of t.matchAll(/[a-z0-9._-]{2,}@[a-z0-9]{2,}(?![a-z0-9]*\.[a-z])/gi)) {
    const v = normUpi(m[0])
    if (v) out.push({ kind: 'u', value: v })
  }
  for (const m of t.matchAll(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/\S*)?/gi)) {
    const before = t[m.index - 1]
    const after = t[m.index + m[0].length]
    if (m[0].includes('@') || before === '@' || after === '@') continue // part of a UPI ID or e-mail
    const v = normLink(m[0])
    if (v) out.push({ kind: 'l', value: v })
  }
  return out
}

export function makePayload({ district, type, days = 30, message = '', keywords = [], blocked = [] }) {
  const d = DISTRICTS.find((x) => x.name === district || x.id === district)?.id || 'raipur'
  const now = new Date()
  const nonce = new Uint8Array(4)
  crypto.getRandomValues(nonce)
  return {
    v: 1,
    d,
    t: type,
    i: isoDay(now),
    x: isoDay(new Date(now.getTime() + days * 864e5)),
    n: Array.from(nonce, (b) => b.toString(16).padStart(2, '0')).join(''),
    ...(message ? { m: message.slice(0, MAX_QUOTE) } : {}),
    ...(keywords.length ? { k: keywords.slice(0, MAX_WORDS).map((w) => w.slice(0, 24)) } : {}),
    ...(blocked.length ? { b: blocked.slice(0, MAX_BLOCKED).map((x) => `${x.kind}|${x.value}|${x.count || 1}`) } : {}),
  }
}

// Returns { token, url, mode: 'official' | 'demo' }.
// Tries the server first: POST /api/alerts/sign { payload } -> { signature }.
export async function signAlert(payloadObj) {
  // WebCrypto only exists on https:// or localhost (not on http://192.168.x.x from a phone)
  if (!hasCrypto()) throw new Error('insecure-context')
  const payload = toB64u(pack(JSON.stringify(payloadObj)))
  const { official } = await getKeys()

  if (official) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(`${API_BASE}/api/alerts/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
        signal: ctrl.signal,
      })
      clearTimeout(timer)
      if (res.ok) {
        const { signature } = await res.json()
        const ok = await crypto.subtle.verify(SIGN, official, fromB64u(signature), enc.encode(payload))
        if (ok) return withUrl(`A1.${payload}.${signature}`, 'official')
      }
    } catch {
      // server down or no endpoint yet: fall back to demo
    }
  }

  const demoPrivate = await crypto.subtle.importKey('jwk', { ...DEMO_KEY, d: DEMO_PRIVATE_D, ext: true }, ALG, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign(SIGN, demoPrivate, enc.encode(payload)))
  return withUrl(`A1.${payload}.${toB64u(sig)}`, 'demo')
}

// The QR must open on a phone, so it never points at localhost / a LAN address:
// VITE_PUBLIC_URL if set, else this site when it is public, else the deployed SACHET site.
const DEPLOYED_SITE = 'https://sachet-pi.vercel.app'
const isLocalHost = (h) =>
  /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?$|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.endsWith('.local') || h === ''
const siteOrigin = () => {
  if (SITE) return SITE.replace(/\/$/, '')
  if (typeof location === 'undefined' || location.protocol === 'file:' || isLocalHost(location.hostname)) return DEPLOYED_SITE
  return location.origin
}
const withUrl = (token, mode) => ({ token, url: alertUrl(token), mode })
export const alertUrl = (token) => `${siteOrigin()}/a#${token}`

// ---------- reading an alert (citizen) ----------
const TOKEN_RE = /A1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/

// Finds a SACHET alert token in any text (a full URL, a bare token...). null if none.
export const findAlertToken = (text) => (text || '').match(TOKEN_RE)?.[0] || null

// Returns { status, alert, token }
//  status: 'official' | 'demo' | 'invalid' (bad / changed / fake) | 'unsupported' (old browser)
//  alert: { district, type, issued, expires, expired } when the payload could be read
export async function verifyAlert(text) {
  const token = findAlertToken(text)
  if (!token) return { status: 'invalid', alert: null, token: null }
  const [, payload, signature] = token.split('.')

  let data
  try {
    data = JSON.parse(unpack(fromB64u(payload)))
  } catch {
    return { status: 'invalid', alert: null, token }
  }
  const district = DISTRICTS.find((x) => x.id === data.d)?.name
  const typeOk = SCAM_TYPES.some((s) => s.id === data.t)
  if (data.v !== 1 || !district || !typeOk) return { status: 'invalid', alert: null, token }

  const alert = {
    district,
    type: data.t,
    issued: data.i,
    expires: data.x,
    expired: !!data.x && data.x < isoDay(new Date()),
    message: typeof data.m === 'string' ? data.m.slice(0, MAX_QUOTE) : '',
    keywords: Array.isArray(data.k) ? data.k.filter((w) => typeof w === 'string').slice(0, MAX_WORDS) : [],
    blocked: Array.isArray(data.b)
      ? data.b
          .map((x) => String(x).split('|'))
          .map(([kind, value, count]) => ({ kind, value: NORM[kind]?.(value) || '', count: Math.max(1, parseInt(count, 10) || 1) }))
          .filter((x) => x.value)
          .slice(0, MAX_BLOCKED)
      : [],
  }
  if (!hasCrypto()) return { status: 'unsupported', alert, token }

  let sig
  try {
    sig = fromB64u(signature)
  } catch {
    return { status: 'invalid', alert, token }
  }
  const { official, demoPublic } = await getKeys()
  const bytes = enc.encode(payload)
  try {
    if (official && (await crypto.subtle.verify(SIGN, official, sig, bytes))) return { status: 'official', alert, token }
    if (await crypto.subtle.verify(SIGN, demoPublic, sig, bytes)) return { status: 'demo', alert, token }
  } catch {
    // malformed signature
  }
  return { status: 'invalid', alert, token }
}

// ---------- alerts saved on this phone ----------
const SAVED_KEY = 'sachet_saved_alerts'

export function getSavedAlerts() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
  } catch {
    return []
  }
}

// Only genuine (official or demo-signed) alerts are saved. Newest first, max 20.
export function saveAlert({ token, status, alert }) {
  if (!token || !alert || (status !== 'official' && status !== 'demo')) return
  try {
    const list = getSavedAlerts().filter((a) => a.token !== token)
    list.unshift({ token, status, ...alert, savedAt: new Date().toISOString() })
    localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 20)))
  } catch {
    // storage full / private mode
  }
}

// ---------- matching new messages against saved alerts (citizen checker) ----------
// Letters, digits and Devanagari vowel signs only; lower case.
export const normWord = (w) => (w || '').toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, '')

// Returns { alert, hits } for the saved alert whose ML-flagged words best match this text, or null.
// Needs 2 hits (or every word, if the alert has fewer than 3 usable words).
export function matchSavedAlerts(text) {
  const words = (text || '').split(/\s+/).map(normWord).filter(Boolean)
  if (!words.length) return null
  let best = null
  for (const alert of getSavedAlerts()) {
    const keys = [...new Set((alert.keywords || []).map(normWord).filter((k) => k.length >= 3))]
    if (!keys.length) continue
    const hits = keys.filter((k) => words.some((w) => w.includes(k) || (w.length >= 4 && k.includes(w))))
    const needed = keys.length >= 3 ? 2 : keys.length
    if (hits.length >= needed && (!best || hits.length > best.hits.length)) best = { alert, hits }
  }
  return best
}

// Does this text (or a UPI ID / link from a QR) contain a scammer ID from a saved alert?
// Returns { alert, id: {kind, value, count} } or null. Exact ID match, so it is reliable even when the
// ML model is unsure.
export function matchBlocked(text, extra = []) {
  const found = [...extractIds(text), ...extra.filter((x) => x.value)]
  if (!found.length) return null
  for (const alert of getSavedAlerts()) {
    for (const id of alert.blocked || []) {
      if (found.some((f) => f.kind === id.kind && f.value === id.value)) return { alert, id }
    }
  }
  return null
}
