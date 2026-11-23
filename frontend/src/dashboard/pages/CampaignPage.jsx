import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import Tile from '../components/Tile.jsx'
import CampaignPoster, { PosterQr } from '../components/CampaignPoster.jsx'
import { MegaphoneIcon, PrinterIcon, CopyIcon, PlayIcon, StopIcon, FileIcon, ClockIcon, QrIcon } from '../components/icons.jsx'
import { DISTRICTS } from '../../shared/districts.js'
import { SCAM_TYPES, scamLabel } from '../../shared/scamTypes.js'
import { countBy, sortedCounts, pctChange, risingDistrict } from '../lib/stats.js'
import { buildCampaign, smsParts, KIT_LANGS } from '../data/campaignTemplates.js'
import { makePayload, signAlert, canSign, normWord, MAX_QUOTE, MAX_WORDS, MAX_BLOCKED, normPhone, normUpi, normLink, showId } from '../../shared/alertSign.js'
import { alertWords } from '../../shared/alertWords.js'
import { analyzeMessage } from '../../citizen/lib/scamDetector.js'
import { downloadQrPng } from '../../shared/QrCode.jsx'

// Page labels follow the dashboard language; poster language is chosen separately.
const UI = {
  en: {
    setup: 'Set up campaign', district: 'District', type: 'Scam type', posterLang: 'Poster language', style: 'Poster style',
    styleA: 'Bold warning', styleB: 'Calm myth-buster', evidence: 'Why this campaign', thisWeek: 'reports this week',
    lastWeek: 'last week', topChannel: 'Mostly via', noData: 'No reports for this district and scam yet.',
    poster: 'Poster (A4)', print: 'Print / Save PDF', sms: 'SMS', copy: 'Copy', copied: 'Copied ✓',
    chars: 'characters', parts: 'SMS', script: 'Announcer script · about 30 s', play: 'Play', stop: 'Stop',
    noVoice: 'This browser has no voice for this language.',
    realTitle: 'Real scam message (optional)', realHint: 'Paste a message people are getting. Our ML model picks the scam type and the words to warn about; the poster and QR then carry it.',
    analyse: 'Analyse with ML', analysing: 'Analysing…', mlScam: (p, l) => `ML: ${p}% scam · ${l}`, mlSafe: (p) => `ML: only ${p}% scam. Check this is really a scam message.`,
    words: 'Words the ML picked (phones warn on these)', addWord: '+ add word', clearReal: 'Remove', mlFail: 'Could not load the ML model.',
    step1: "What's happening", step2: 'Language (poster, SMS, announcement)', step3: 'Signed QR',
    tabPoster: 'Poster', tabScript: 'Announcement', tabQr: 'Signed QR', realPlaceholder: 'e.g. “This is Mumbai Crime Branch. A parcel with drugs was found in your name…”',
    printNote: 'A4, one page. Print it or save as PDF for WhatsApp groups.', smsHint: 'For bulk SMS or WhatsApp groups. Edit before copying.',
    smsLong: 'Hindi SMS use 67 characters per part', scriptHint: 'For panchayat speakers, munadi or radio. Edit, listen, then copy.',
    qrOff: 'Signed QR is off', qrInside: 'What this QR carries (signed, cannot be changed)', qrQuote: 'Real message', qrWords: 'ML words',
    qrAddReal: 'Tip: paste a real scam message in step 1 so the QR also carries it and the words phones should watch for.',
    how1: 'Citizen scans it with SACHET or the phone camera.', how2: 'The phone checks the signature itself, even offline.', how3: 'They show the same QR to others: the alert spreads phone to phone.',
    copyLink: 'Copy link',
    idsTitle: 'Reported scammer IDs · last 30 days', idsHint: 'Tick the ones you trust. They go on the poster and into the signed QR; phones that scanned it warn when a message or payment QR uses one, even offline.',
    idsNone: 'No phone numbers, UPI IDs or links reported here in 30 days.', idsPicked: (n, m) => `${n} of ${m} max on poster & QR`, reportsN: (n) => `${n} report${n === 1 ? '' : 's'}`,
    noCrypto: 'QR signing needs https:// or localhost. Open the dashboard that way.',
    qr: 'Signed QR on poster', validFor: 'Valid for', days: 'days', downloadQr: 'Download QR',
    signing: 'Signing…', official: '✓ Signed with the official key', demo: 'Demo signature · server key not set up yet',
    qrHelp: 'Citizens scan it to check the alert is genuine, even offline. Their phone can then show the same QR so neighbours scan it too.',
  },
  hi: {
    setup: 'अभियान तैयार करें', district: 'ज़िला', type: 'धोखाधड़ी प्रकार', posterLang: 'पोस्टर की भाषा', style: 'पोस्टर शैली',
    styleA: 'तेज़ चेतावनी', styleB: 'शांत सच', evidence: 'यह अभियान क्यों', thisWeek: 'शिकायतें इस हफ़्ते',
    lastWeek: 'पिछले हफ़्ते', topChannel: 'ज़्यादातर', noData: 'इस ज़िले और प्रकार की अभी कोई शिकायत नहीं।',
    poster: 'पोस्टर (A4)', print: 'प्रिंट / PDF', sms: 'SMS', copy: 'कॉपी', copied: 'कॉपी हुआ ✓',
    chars: 'अक्षर', parts: 'SMS', script: 'घोषणा स्क्रिप्ट · लगभग 30 सेकंड', play: 'सुनें', stop: 'रोकें',
    noVoice: 'इस ब्राउज़र में इस भाषा की आवाज़ नहीं है।',
    realTitle: 'असली ठगी संदेश (वैकल्पिक)', realHint: 'लोगों को आ रहा संदेश चिपकाएँ। हमारा ML मॉडल ठगी का प्रकार और चेतावनी वाले शब्द चुनता है; पोस्टर और QR में वही जाता है।',
    analyse: 'ML से जाँचें', analysing: 'जाँच हो रही है…', mlScam: (p, l) => `ML: ${p}% ठगी · ${l}`, mlSafe: (p) => `ML: सिर्फ़ ${p}% ठगी। देखें कि यह सच में ठगी का संदेश है।`,
    words: 'ML के चुने शब्द (फ़ोन इन पर चेताएँगे)', addWord: '+ शब्द जोड़ें', clearReal: 'हटाएँ', mlFail: 'ML मॉडल लोड नहीं हुआ।',
    step1: 'क्या हो रहा है', step2: 'भाषा (पोस्टर, SMS, घोषणा)', step3: 'हस्ताक्षरित QR',
    tabPoster: 'पोस्टर', tabScript: 'घोषणा', tabQr: 'हस्ताक्षरित QR', realPlaceholder: 'जैसे: “मैं मुंबई क्राइम ब्रांच से बोल रहा हूँ, आपके नाम के पार्सल में ड्रग्स मिले…”',
    printNote: 'A4, एक पेज। प्रिंट करें या WhatsApp समूहों के लिए PDF बनाएँ।', smsHint: 'बल्क SMS या WhatsApp समूहों के लिए। कॉपी से पहले बदल सकते हैं।',
    smsLong: 'हिंदी SMS में एक भाग 67 अक्षर का होता है', scriptHint: 'पंचायत स्पीकर, मुनादी या रेडियो के लिए। बदलें, सुनें, फिर कॉपी करें।',
    qrOff: 'हस्ताक्षरित QR बंद है', qrInside: 'इस QR में क्या है (हस्ताक्षरित, बदला नहीं जा सकता)', qrQuote: 'असली संदेश', qrWords: 'ML शब्द',
    qrAddReal: 'सुझाव: चरण 1 में असली ठगी संदेश डालें, ताकि QR में वह और फ़ोन के लिए चेतावनी वाले शब्द भी जाएँ।',
    how1: 'नागरिक इसे SACHET या फ़ोन कैमरे से स्कैन करता है।', how2: 'फ़ोन खुद हस्ताक्षर जाँचता है, बिना इंटरनेट भी।', how3: 'वह वही QR दूसरों को दिखाता है: सूचना फ़ोन से फ़ोन फैलती है।',
    copyLink: 'लिंक कॉपी',
    idsTitle: 'शिकायत में आए ठग नंबर / ID · पिछले 30 दिन', idsHint: 'जिन पर भरोसा हो उन्हें चुनें। ये पोस्टर और हस्ताक्षरित QR में जाते हैं; QR स्कैन करने वाले फ़ोन किसी संदेश या भुगतान QR में ये दिखते ही चेताएँगे, बिना इंटरनेट भी।',
    idsNone: 'पिछले 30 दिन में यहाँ कोई नंबर, UPI ID या लिंक की शिकायत नहीं।', idsPicked: (n, m) => `${n} / ${m} पोस्टर और QR में`, reportsN: (n) => `${n} शिकायत`,
    noCrypto: 'QR हस्ताक्षर के लिए https:// या localhost पर खोलें।',
    qr: 'पोस्टर पर हस्ताक्षरित QR', validFor: 'मान्य', days: 'दिन', downloadQr: 'QR डाउनलोड',
    signing: 'हस्ताक्षर हो रहे हैं…', official: '✓ आधिकारिक कुंजी से हस्ताक्षरित', demo: 'डेमो हस्ताक्षर · सर्वर कुंजी अभी नहीं लगी',
    qrHelp: 'नागरिक इसे स्कैन कर जाँचते हैं कि सूचना असली है, बिना इंटरनेट भी। फिर उनका फ़ोन वही QR दिखा सकता है ताकि पड़ोसी भी स्कैन करें।',
  },
  cg: {
    setup: 'अभियान तइयार करव', district: 'जिला', type: 'ठगी के किसम', posterLang: 'पोस्टर के भाखा', style: 'पोस्टर के ढंग',
    styleA: 'तेज चेतावनी', styleB: 'सांत सच', evidence: 'ए अभियान काबर', thisWeek: 'सिकायत ए हफ्ता',
    lastWeek: 'पाछू हफ्ता', topChannel: 'जादा करके', noData: 'ए जिला अउ किसम के अभी कोनो सिकायत नइ हे।',
    poster: 'पोस्टर (A4)', print: 'प्रिंट / PDF', sms: 'SMS', copy: 'कॉपी', copied: 'कॉपी होगे ✓',
    chars: 'अक्छर', parts: 'SMS', script: 'मुनादी स्क्रिप्ट · करीब 30 सेकंड', play: 'सुनव', stop: 'रोकव',
    noVoice: 'ए ब्राउज़र म ए भाखा के आवाज नइ हे।',
    realTitle: 'असली ठगी संदेस (मन होय त)', realHint: 'मनखे मन ल आवत संदेस चिपकावव। हमर ML मॉडल ठगी के किसम अउ चेतावनी वाला सब्द चुनथे; पोस्टर अउ QR म उही जाथे।',
    analyse: 'ML ले जाँचव', analysing: 'जाँचत हन…', mlScam: (p, l) => `ML: ${p}% ठगी · ${l}`, mlSafe: (p) => `ML: खाली ${p}% ठगी। देखव कि ए सच म ठगी के संदेस आय।`,
    words: 'ML के चुने सब्द (फोन एमन म चेताही)', addWord: '+ सब्द जोड़व', clearReal: 'हटावव', mlFail: 'ML मॉडल लोड नइ होइस।',
    step1: 'का होवत हे', step2: 'भाखा (पोस्टर, SMS, मुनादी)', step3: 'दस्तखत वाला QR',
    tabPoster: 'पोस्टर', tabScript: 'मुनादी', tabQr: 'दस्तखत वाला QR', realPlaceholder: 'जइसे: “मैं मुंबई क्राइम ब्रांच ले बोलत हंव, तुंहर नाव के पार्सल म ड्रग्स मिलिस…”',
    printNote: 'A4, एक पेज। प्रिंट करव या WhatsApp बर PDF बनावव।', smsHint: 'बल्क SMS या WhatsApp बर। कॉपी ले पहिली बदल सकथव।',
    smsLong: 'हिंदी SMS म एक भाग 67 अक्छर के होथे', scriptHint: 'पंचायत स्पीकर, मुनादी या रेडियो बर। बदलव, सुनव, फेर कॉपी करव।',
    qrOff: 'दस्तखत वाला QR बंद हे', qrInside: 'ए QR म का हे (दस्तखत वाला, बदले नइ जा सकय)', qrQuote: 'असली संदेस', qrWords: 'ML सब्द',
    qrAddReal: 'सलाह: चरन 1 म असली ठगी संदेस डारव, ताकि QR म ओ अउ फोन बर चेतावनी वाला सब्द घलो जाय।',
    how1: 'मनखे एला SACHET या फोन कैमरा ले स्कैन करथे।', how2: 'फोन खुदे दस्तखत जाँचथे, बिना इंटरनेट घलो।', how3: 'ओ उही QR दूसर मन ल देखाथे: सूचना फोन ले फोन बगरथे।',
    copyLink: 'लिंक कॉपी',
    idsTitle: 'सिकायत म आए ठग नंबर / ID · पाछू 30 दिन', idsHint: 'जेमा भरोसा हे ओला चुनव। ए पोस्टर अउ दस्तखत वाला QR म जाथे; QR स्कैन करइया फोन कोनो संदेस या पेमेंट QR म एला देखते चेताही, बिना इंटरनेट घलो।',
    idsNone: 'पाछू 30 दिन म इहाँ कोनो नंबर, UPI ID या लिंक के सिकायत नइ हे।', idsPicked: (n, m) => `${n} / ${m} पोस्टर अउ QR म`, reportsN: (n) => `${n} सिकायत`,
    noCrypto: 'QR दस्तखत बर https:// या localhost म खोलव।',
    qr: 'पोस्टर म दस्तखत वाला QR', validFor: 'चलही', days: 'दिन', downloadQr: 'QR डाउनलोड',
    signing: 'दस्तखत होवत हे…', official: '✓ सरकारी चाबी ले दस्तखत', demo: 'डेमो दस्तखत · सर्वर चाबी अभी नइ लगे हे',
    qrHelp: 'मनखे मन एला स्कैन करके जाँचथें कि सूचना असली हे, बिना इंटरनेट घलो। फेर ओकर फोन उही QR देखा सकथे ताकि परोसी घलो स्कैन करें।',
  },
}
const CHANNEL = { sms: 'SMS', whatsapp: 'WhatsApp', call: 'Phone call', other: 'Other' }
const DAY = 864e5
const POSTER_W = 794
const POSTER_H = 1123

// Shortest useful quote of the real message: the sentence with most flagged words, cut around the first one.
function pickQuote(text, keywords) {
  const keys = keywords.map(normWord)
  const sentences = text.split(/(?<=[।.!?\n])\s*/).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean)
  const hits = (x) => x.split(' ').filter((w) => keys.some((k) => k && normWord(w).includes(k))).length
  // Most-flagged sentences first; join as many as fit, then put them back in message order
  const ranked = sentences.map((x, i) => ({ x, i, h: hits(x) })).sort((a, b) => b.h - a.h || a.i - b.i)
  const picked = []
  let len = 0
  for (const r of ranked) {
    if (r.h === 0 && picked.length) break
    if (len + r.x.length + 1 > MAX_QUOTE) continue
    picked.push(r)
    len += r.x.length + 1
  }
  if (picked.length) return picked.sort((a, b) => a.i - b.i).map((r) => r.x).join(' ')
  const best = ranked[0]?.x || ''
  const first = best.split(' ').findIndex((w) => keys.some((k) => k && normWord(w).includes(k)))
  const start = first > 0 ? best.split(' ').slice(0, first).join(' ').length + 1 : 0
  const from = Math.max(0, start - 20)
  let cut = best.slice(from, from + MAX_QUOTE - 2)
  cut = cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : cut.length)
  return `${from > 0 ? '…' : ''}${cut.trim()}…`
}

// Scammer phone / UPI / link IDs citizens reported in this district (last `days`), most reported first.
function reportedIds(reports, district, days = 30) {
  const now = Date.now()
  const map = new Map()
  for (const r of reports) {
    if (r.district !== district || now - new Date(r.created_at).getTime() > days * DAY) continue
    const sc = r.scammer || {}
    for (const [kind, value] of [
      ['p', normPhone(sc.phone)],
      ['u', normUpi(sc.upi_id)],
      ['l', normLink(sc.url)],
    ]) {
      if (!value) continue
      const key = `${kind}|${value}`
      const cur = map.get(key) || { key, kind, value, count: 0, last: '' }
      cur.count++
      if ((r.created_at || '') > cur.last) cur.last = r.created_at
      map.set(key, cur)
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.last.localeCompare(a.last)).slice(0, 8)
}

// Last 7 days vs the 7 days before, for one district + scam type.
function evidenceFor(reports, district, type) {
  const now = Date.now()
  const mine = reports.filter((r) => r.district === district && r.scam_type === type)
  let last7 = 0
  let prev7 = 0
  const recent = []
  for (const r of mine) {
    const age = now - new Date(r.created_at).getTime()
    if (age < 7 * DAY) {
      last7++
      recent.push(r)
    } else if (age < 14 * DAY) prev7++
  }
  const channel = sortedCounts(countBy(recent, 'channel'))[0]?.[0]
  return { last7, prev7, change: pctChange(last7, prev7), channel }
}

function useCopy() {
  const [done, setDone] = useState('')
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setDone(key)
    setTimeout(() => setDone(''), 1500)
  }
  return [done, copy]
}

// Scales the A4 poster to fit its box.
function useFitScale() {
  const [el, ref] = useState(null) // callback ref: re-measures when the Poster tab mounts again
  const [scale, setScale] = useState(0.4)
  useLayoutEffect(() => {
    if (!el) return
    const fit = () => {
      const { width, height } = el.getBoundingClientRect()
      const s = Math.min(width / POSTER_W, (height || Infinity) / POSTER_H)
      if (s > 0 && Number.isFinite(s)) setScale(s)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return [ref, scale]
}

const seg = (active) =>
  `px-3 py-1.5 rounded-full text-sm font-medium transition ${active ? 'bg-forest text-card' : 'text-ink hover:bg-beige'}`
const btn =
  'inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink hover:bg-beige transition'

export default function CampaignPage() {
  const { reports = [], forTrend = [], lang = 'en' } = useOutletContext()
  const ui = UI[lang] || UI.en
  const [params] = useSearchParams()

  // Default: what the URL asks for, else this week's biggest rise and its top scam.
  const [district, setDistrict] = useState(() => {
    const fromUrl = params.get('district')
    if (fromUrl && DISTRICTS.some((d) => d.name === fromUrl)) return fromUrl
    return risingDistrict(forTrend.length ? forTrend : reports)?.name || 'Raipur'
  })
  const [type, setType] = useState(() => {
    const fromUrl = params.get('type')
    if (fromUrl && SCAM_TYPES.some((s) => s.id === fromUrl)) return fromUrl
    const recent = reports.filter((r) => r.district === district && Date.now() - new Date(r.created_at) < 7 * DAY)
    return sortedCounts(countBy(recent, 'scam_type'))[0]?.[0] || 'digital_arrest'
  })
  const [posterLang, setPosterLang] = useState('hi')
  const [style, setStyle] = useState('B')
  const [signingToken, setSigningToken] = useState('')
  const [qrOn, setQrOn] = useState(true)
  // Real scam message, analysed by the same on-device ML model citizens use
  const [realText, setRealText] = useState('')
  const [ml, setMl] = useState(null) // { pct, isScam, type } | { error }
  const [mlBusy, setMlBusy] = useState(false)
  const [keywords, setKeywords] = useState([])
  const [quote, setQuote] = useState('')
  const analyse = async () => {
    const text = realText.trim()
    if (!text) return
    setMlBusy(true)
    try {
      const res = await analyzeMessage(text)
      const mlType = res.verdict === 'scam' && res.scamType && res.scamType !== 'other' ? res.scamType : type
      const words = await alertWords(text, mlType)
      setKeywords(words)
      setQuote(pickQuote(text, words))
      setMl({ pct: Math.round(res.finalScore * 100), isScam: res.verdict === 'scam', type: res.scamType })
      setType(mlType)
    } catch (err) {
      console.error('ML analysis failed', err)
      setMl({ error: true })
    }
    setMlBusy(false)
  }
  const [newWord, setNewWord] = useState('')
  const addWord = () => {
    const w = newWord.trim().split(/\s+/)[0] || ''
    if (normWord(w).length >= 2 && keywords.length < MAX_WORDS && !keywords.some((k) => normWord(k) === normWord(w))) {
      const next = [...keywords, w]
      setKeywords(next)
      setQuote(pickQuote(realText, next))
    }
    setNewWord('')
  }
  const clearReal = () => {
    setRealText('')
    setMl(null)
    setKeywords([])
    setQuote('')
  }
  const real = quote ? { quote, keywords } : null

  // Reported scammer IDs: ones reported 2+ times are ticked by default; the official decides.
  const ids = useMemo(() => reportedIds(reports, district), [reports, district])
  const [picked, setPicked] = useState([])
  const seededFor = useRef('') // seed the ticks once per district, so report refreshes don't undo the official's choice
  useEffect(() => {
    if (seededFor.current === district || !ids.length) return
    seededFor.current = district
    setPicked(ids.filter((x) => x.count >= 2).slice(0, MAX_BLOCKED).map((x) => x.key))
  }, [ids, district])
  useEffect(() => {
    if (!ids.length) setPicked([])
  }, [ids.length])
  const blocked = ids.filter((x) => picked.includes(x.key)).map(({ kind, value, count }) => ({ kind, value, count }))
  const togglePick = (key) =>
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : p.length < MAX_BLOCKED ? [...p, key] : p))
  const [validDays, setValidDays] = useState(30)
  const [signed, setSigned] = useState(null) // { token, url, mode }

  // Sign a fresh alert whenever district / scam / validity changes.
  useEffect(() => {
    if (!qrOn) return
    if (!canSign()) {
      setSigned({ error: true })
      return
    }
    let live = true
    setSigned(null)
    signAlert(makePayload({ district, type, days: validDays, message: quote, keywords, blocked }), signingToken)
      .then((res) => live && setSigned(res))
      .catch((err) => {
        console.error('Alert signing failed', err)
        if (live) setSigned({ error: true })
      })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrOn, signingToken, district, type, validDays, quote, keywords.join('|'), picked.join(',')])

  const evidence = useMemo(() => evidenceFor(reports, district, type), [reports, district, type])
  const kit = useMemo(
    () => buildCampaign({ district, type, lang: posterLang, evidence: evidence.last7 ? evidence : null, real, blocked }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [district, type, posterLang, evidence, quote, keywords.join('|'), picked.join(',')],
  )

  // SMS and script are editable; reset them when the campaign changes.
  const [sms, setSms] = useState(kit.sms)
  const [script, setScript] = useState(kit.script)
  useEffect(() => {
    setSms(kit.sms)
    setScript(kit.script)
  }, [kit])

  const [copied, copy] = useCopy()
  const [fitRef, scale] = useFitScale()
  const parts = smsParts(sms)

  // Announcer script read aloud by the browser voice.
  const [speaking, setSpeaking] = useState(false)
  const [voiceMissing, setVoiceMissing] = useState(false)
  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  const toggleSpeak = () => {
    const synth = window.speechSynthesis
    if (!synth) return setVoiceMissing(true)
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const speechLang = KIT_LANGS.find((l) => l.id === posterLang)?.speech || 'hi-IN'
    const u = new SpeechSynthesisUtterance(script)
    u.lang = speechLang
    u.rate = 0.95
    const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(speechLang.slice(0, 2)))
    if (voice) u.voice = voice
    setVoiceMissing(!voice && synth.getVoices().length > 0)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    synth.cancel()
    synth.speak(u)
    setSpeaking(true)
  }

  // Copy the poster to a body-level node so print ignores the page layout and the preview scale.
  const posterRef = useRef(null)
  const printPoster = () => {
    if (!posterRef.current) return
    const holder = document.createElement('div')
    holder.id = 'poster-print-root'
    holder.innerHTML = posterRef.current.innerHTML
    document.body.appendChild(holder)
    const done = () => {
      holder.remove()
      window.removeEventListener('afterprint', done)
    }
    window.addEventListener('afterprint', done)
    window.print()
  }

  const sel = 'w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-card text-ink'
  const pct = Math.round(evidence.change * 100)

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      {/* 1. Set up */}
      <Tile title={ui.setup} icon={MegaphoneIcon} className="col-span-12 lg:col-span-3" bodyClass="overflow-auto pr-1 space-y-4">
        {/* real scam message -> ML */}
        <div className="rounded-2xl border border-line p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink">{ui.realTitle}</span>
            {ml && (
              <button className="text-xs text-muted underline" onClick={clearReal}>
                {ui.clearReal}
              </button>
            )}
          </div>
          {!ml && <p className="text-xs text-muted leading-relaxed">{ui.realHint}</p>}
          <textarea
            value={realText}
            onChange={(e) => setRealText(e.target.value)}
            rows={3}
            placeholder={ui.realPlaceholder}
            className="w-full rounded-xl border border-line bg-beige/50 p-2.5 text-sm text-ink resize-none outline-none focus:border-forest"
          />
          <button className={`${btn} py-1.5! whitespace-nowrap disabled:opacity-40`} onClick={analyse} disabled={!realText.trim() || mlBusy}>
            {mlBusy ? ui.analysing : ui.analyse}
          </button>
          {ml?.error && <div className="text-xs font-semibold text-scam">{ui.mlFail}</div>}
          {ml && !ml.error && (
            <div className={`text-xs font-semibold ${ml.isScam ? 'text-scam' : 'text-warn'}`}>
              {ml.isScam ? ui.mlScam(ml.pct, scamLabel(ml.type, lang)) : ui.mlSafe(ml.pct)}
            </div>
          )}
          {ml && !ml.error && (
            <div>
              <div className="text-xs text-muted mb-1">{ui.words}</div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((w) => (
                  <span key={w} className="inline-flex items-center gap-1 rounded-full bg-blush text-scam text-xs font-semibold pl-2.5 pr-1 py-0.5">
                    {w}
                    <button
                      className="grid place-items-center w-4 h-4 rounded-full hover:bg-scam/15"
                      aria-label={`Remove ${w}`}
                      onClick={() => {
                        const next = keywords.filter((x) => x !== w)
                        setKeywords(next)
                        setQuote(pickQuote(realText, next))
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {keywords.length < MAX_WORDS && (
                  <input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addWord()}
                    onBlur={addWord}
                    placeholder={ui.addWord}
                    className="w-24 rounded-full border border-dashed border-line bg-card px-2.5 py-0.5 text-xs outline-none focus:border-forest"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <label className="block">
          <span className="block text-xs font-medium text-muted mb-1">{ui.district}</span>
          <select className={sel} value={district} onChange={(e) => setDistrict(e.target.value)}>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-muted mb-1">{ui.type}</span>
          <select className={sel} value={type} onChange={(e) => setType(e.target.value)}>
            {SCAM_TYPES.map((s) => (
              <option key={s.id} value={s.id}>
                {scamLabel(s.id, lang)}
              </option>
            ))}
          </select>
        </label>

        {/* reported scammer IDs -> poster + signed QR */}
        <div className="rounded-2xl border border-line p-3 space-y-2">
          <div className="text-sm font-semibold text-ink">{ui.idsTitle}</div>
          {ids.length ? (
            <>
              <ul className="space-y-1">
                {ids.map((x) => {
                  const on = picked.includes(x.key)
                  const full = !on && picked.length >= MAX_BLOCKED
                  return (
                    <li key={x.key}>
                      <label className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${full ? 'opacity-40' : 'cursor-pointer hover:bg-beige'}`}>
                        <input type="checkbox" checked={on} disabled={full} onChange={() => togglePick(x.key)} className="w-4 h-4 accent-forest shrink-0" />
                        <span className="w-5 text-center text-sm shrink-0" aria-hidden="true">
                          {x.kind === 'p' ? '📞' : x.kind === 'u' ? '₹' : '🔗'}
                        </span>
                        <span className="font-mono text-xs text-ink truncate flex-1">{showId(x)}</span>
                        <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${x.count >= 2 ? 'bg-blush text-scam' : 'bg-beige text-muted'}`}>
                          {ui.reportsN(x.count)}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
              <div className="text-xs font-semibold text-forest">{ui.idsPicked(picked.length, MAX_BLOCKED)}</div>
              <p className="text-xs text-muted leading-relaxed">{ui.idsHint}</p>
            </>
          ) : (
            <p className="text-xs text-muted">{ui.idsNone}</p>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium text-muted mb-1">{ui.posterLang}</span>
          <div className="inline-flex flex-wrap border border-line rounded-full bg-card p-0.5" role="group">
            {KIT_LANGS.map((l) => (
              <button key={l.id} className={seg(posterLang === l.id)} onClick={() => setPosterLang(l.id)} aria-pressed={posterLang === l.id}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-muted mb-1">{ui.style}</span>
          <div className="inline-flex flex-wrap border border-line rounded-full bg-card p-0.5" role="group">
            <button className={seg(style === 'B')} onClick={() => setStyle('B')} aria-pressed={style === 'B'}>
              {ui.styleB}
            </button>
            <button className={seg(style === 'A')} onClick={() => setStyle('A')} aria-pressed={style === 'A'}>
              {ui.styleA}
            </button>
          </div>
        </div>

        {/* signed QR (relay) */}
        <div className="rounded-2xl border border-line p-3 space-y-2">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm font-semibold text-ink">{ui.qr}</span>
            <input type="checkbox" checked={qrOn} onChange={(e) => setQrOn(e.target.checked)} className="w-4 h-4 accent-forest" />
          </label>
          {qrOn && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted">
                {ui.validFor}
                <div className="inline-flex border border-line rounded-full bg-card p-0.5" role="group">
                  {[7, 30, 90].map((d) => (
                    <button key={d} className={`${seg(validDays === d)} px-2.5! py-1! text-xs!`} onClick={() => setValidDays(d)} aria-pressed={validDays === d}>
                      {d}
                    </button>
                  ))}
                </div>
                {ui.days}
              </div>
              <div className={`text-xs font-semibold ${!signed ? 'text-muted' : signed.error ? 'text-scam' : signed.mode === 'official' ? 'text-safe' : 'text-warn'}`}>
                {!signed ? ui.signing : signed.error ? ui.noCrypto : signed.mode === 'official' ? ui.official : ui.demo}
              </div>
              <p className="text-xs text-muted leading-relaxed">{ui.qrHelp}</p>
              <form onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                setSigningToken(new FormData(form).get('signingToken').trim())
                form.reset()
              }} className="flex flex-wrap items-end gap-2">
                <label className="text-xs text-muted">
                  Official signing token
                  <input name="signingToken" type="password" autoComplete="off" className="block rounded-lg border border-line px-2 py-1" />
                </label>
                <button type="submit" className="rounded-lg border border-line px-2 py-1 text-xs">Apply token</button>
              </form>
            </>
          )}
        </div>

        {/* evidence */}
        <div className="rounded-2xl bg-blush/70 border border-scam/15 p-4">
          <div className={`text-xs font-semibold text-scam ${lang === 'en' ? 'uppercase tracking-[0.15em]' : ''}`}>{ui.evidence}</div>
          {evidence.last7 ? (
            <>
              <div className="font-display text-3xl font-bold text-ink mt-2">
                {evidence.last7}{' '}
                {evidence.prev7 > 0 && pct !== 0 && (
                  <span className={`text-lg ${pct > 0 ? 'text-scam' : 'text-safe'}`}>
                    {pct > 0 ? '▲' : '▼'} {Math.abs(pct)}%
                  </span>
                )}
              </div>
              <div className="text-sm text-muted">
                {ui.thisWeek} · {ui.lastWeek}: {evidence.prev7}
              </div>
              {evidence.channel && (
                <div className="text-sm text-ink mt-2">
                  {ui.topChannel} <span className="font-semibold">{CHANNEL[evidence.channel] || evidence.channel}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted mt-2">{ui.noData}</div>
          )}
        </div>
      </Tile>

      {/* 2. Poster preview */}
      <Tile title={ui.poster} icon={FileIcon} tint="bg-sun-tint text-warn" className="col-span-12 md:col-span-7 lg:col-span-5">
        <div className="flex flex-col h-full gap-3">
          <div ref={fitRef} className="relative flex-1 min-h-[420px] lg:min-h-0">
            <div
              className="poster-scale absolute left-1/2 top-0 origin-top shadow-[0_12px_40px_-16px_rgba(31,77,51,0.35)] rounded-md overflow-hidden"
              style={{ width: POSTER_W, height: POSTER_H, transform: `translateX(-50%) scale(${scale})` }}
            >
              <div ref={posterRef}>
                <CampaignPoster
                  kit={kit}
                  style={style}
                  qr={
                    qrOn && signed?.url ? (
                      <PosterQr url={signed.url} lang={posterLang} dark={style === 'A'} demo={signed.mode === 'demo'} size={real ? 250 : 200} />
                    ) : null
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 shrink-0">
            <button className={`${btn} bg-forest! text-card! border-forest! hover:bg-forest-2!`} onClick={printPoster}>
              <PrinterIcon size={16} /> {ui.print}
            </button>
            {qrOn && signed?.url && (
              <button
                className={btn}
                onClick={() => downloadQrPng(signed.url, `sachet-alert-${district}-${type}.png`, 1024, `SACHET · ${district}`)}
              >
                <QrIcon size={16} /> {ui.downloadQr}
              </button>
            )}
          </div>
        </div>
      </Tile>

      {/* 3. SMS + script */}
      <div className="col-span-12 md:col-span-5 lg:col-span-4 flex flex-col gap-4 min-h-0">
        <Tile title={ui.sms} icon={FileIcon} className="shrink-0">
          <textarea
            value={sms}
            onChange={(e) => setSms(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-line bg-beige/50 p-3 text-sm text-ink resize-none outline-none focus:border-forest"
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className={`text-xs ${parts.parts > 2 ? 'text-warn' : 'text-muted'}`}>
              {parts.chars} {ui.chars} · {parts.parts} {ui.parts}
            </span>
            <button className={btn} onClick={() => copy('sms', sms)}>
              <CopyIcon size={15} /> {copied === 'sms' ? ui.copied : ui.copy}
            </button>
          </div>
        </Tile>

        <Tile title={ui.script} icon={ClockIcon} tint="bg-sun-tint text-warn" className="flex-1" bodyClass="flex flex-col">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full flex-1 min-h-[240px] lg:min-h-[160px] rounded-2xl border border-line bg-beige/50 p-3 text-sm leading-relaxed text-ink resize-none outline-none focus:border-forest"
          />
          {voiceMissing && <div className="text-xs text-warn mt-2">{ui.noVoice}</div>}
          <div className="flex items-center justify-end gap-2 mt-2">
            <button className={btn} onClick={toggleSpeak}>
              {speaking ? <StopIcon size={15} /> : <PlayIcon size={15} />} {speaking ? ui.stop : ui.play}
            </button>
            <button className={btn} onClick={() => copy('script', script)}>
              <CopyIcon size={15} /> {copied === 'script' ? ui.copied : ui.copy}
            </button>
          </div>
        </Tile>
      </div>
    </div>
  )
}
