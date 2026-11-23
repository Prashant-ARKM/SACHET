// Fake-QR checker: read what is inside a QR code and flag common UPI scams.
// Works fully offline. Nothing is sent anywhere.
import jsQR from 'jsqr'

// ---------- 1. Read the QR from a photo or screenshot ----------

async function loadBitmap(file) {
  if (window.createImageBitmap) return createImageBitmap(file)
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Returns the text inside the QR, or null if no QR was found
export async function decodeQrFromFile(file) {
  const image = await loadBitmap(file)

  // Fast path: the browser's own QR reader (Chrome on Android)
  if ('BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      const codes = await detector.detect(image)
      if (codes[0]?.rawValue) return codes[0].rawValue
    } catch {
      // fall through to jsQR
    }
  }

  // Works in every browser: jsQR on a resized copy of the image
  for (const maxSide of [1280, 800]) {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
    const w = Math.round(image.width * scale)
    const h = Math.round(image.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(image, 0, 0, w, h)
    const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' })
    if (found?.data) return found.data
  }
  return null
}

// ---------- 2. Understand what the QR contains ----------

// upi://pay?pa=<UPI ID>&pn=<payee name>&am=<amount>&tn=<note>
export function parseQr(raw) {
  const text = (raw || '').trim()
  if (/^upi:\/\//i.test(text)) {
    const query = text.includes('?') ? text.slice(text.indexOf('?') + 1) : ''
    const params = new URLSearchParams(query)
    const amount = parseFloat(params.get('am') || '')
    return {
      kind: 'upi',
      raw: text,
      upiId: (params.get('pa') || '').trim(),
      payeeName: (params.get('pn') || '').trim(),
      amount: Number.isFinite(amount) && amount > 0 ? amount : null,
      note: (params.get('tn') || '').trim(),
    }
  }
  if (/^(https?:\/\/|www\.)/i.test(text)) return { kind: 'url', raw: text }
  return { kind: 'text', raw: text }
}

// ---------- 3. Red flags ----------

const RECEIVE_WORDS =
  /prize|reward|refund|lucky|cash ?back|lottery|\bwon\b|winner|claim|receive|bonus|gift|इनाम|रिफंड|लॉटरी|जीत|कैशबैक|पाने|पावव|मिलेगा/i
const OFFICIAL_WORDS =
  /bank|\bsbi\b|hdfc|icici|axis|\bpnb\b|\brbi\b|police|cyber ?cell|govt|government|customer ?care|support|helpline|electricity|bijli|cspdcl|income ?tax|\bkyc\b|बैंक|पुलिस|सरकार|बिजली|कस्टमर/i
const PHONE_LIKE_ID = /^(\+?91)?[6-9]\d{9}$/

const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)

function namesMatch(expected, payee) {
  const a = words(expected)
  const b = words(payee)
  if (!a.length || !b.length) return false
  const joinedA = a.join('')
  const joinedB = b.join('')
  return a.some((w) => b.includes(w)) || joinedA.includes(joinedB) || joinedB.includes(joinedA)
}

const money = (n) => `₹${n.toLocaleString('en-IN')}`

// Returns { level: 'danger' | 'warn' | 'ok', flags: [{ level, en, hi, cg }] }
// expectedName: who the user thinks they are paying (optional)
export function checkQr(info, expectedName = '') {
  const flags = []
  const add = (level, en, hi, cg) => flags.push({ level, en, hi, cg })

  if (info.kind === 'url') {
    add(
      'warn',
      'This QR opens a website, not a payment. Never enter bank details, OTP or PIN on a site opened from a QR.',
      'यह QR भुगतान नहीं, एक वेबसाइट खोलता है। QR से खुली साइट पर बैंक जानकारी, OTP या पिन कभी न डालें।',
      'ए QR पेमेंट नहीं, एक वेबसाइट खोलथे। QR ले खुले साइट म बैंक जानकारी, ओटीपी या पिन कभू झन डालव।',
    )
  } else if (info.kind === 'text') {
    add(
      'warn',
      'This QR only contains text, not a payment.',
      'इस QR में भुगतान नहीं, सिर्फ़ लिखा हुआ संदेश है।',
      'ए QR म पेमेंट नहीं, खाली लिखे संदेस हे।',
    )
  } else {
    const nameAndNote = `${info.payeeName} ${info.note}`

    // The classic fake-QR scam: "scan to receive money"
    if (RECEIVE_WORDS.test(nameAndNote)) {
      const amountEn = info.amount ? ` It will send ${money(info.amount)} from your account.` : ''
      const amountHi = info.amount ? ` यह आपके खाते से ${money(info.amount)} भेज देगा।` : ''
      const amountCg = info.amount ? ` ए तुंहर खाता ले ${money(info.amount)} भेज दिही।` : ''
      add(
        'danger',
        `This QR says you will receive money (prize, refund or cashback). Scanning a QR and entering your PIN always SENDS money, never receives it.${amountEn}`,
        `यह QR कहता है कि आपको पैसे मिलेंगे (इनाम, रिफंड या कैशबैक)। QR स्कैन करके पिन डालने से पैसे हमेशा जाते हैं, आते नहीं।${amountHi}`,
        `ए QR कहिथे कि तुमन ल पैसा मिलही (इनाम, रिफंड या कैशबैक)। QR स्कैन करके पिन डाले ले पैसा हमेशा जाथे, आवय नहीं।${amountCg}`,
      )
    } else if (info.amount) {
      add(
        'warn',
        `The amount ${money(info.amount)} is already filled in. Check it matches your bill before paying.`,
        `राशि ${money(info.amount)} पहले से भरी हुई है। भुगतान से पहले देखें कि यह आपके बिल से मेल खाती है।`,
        `रकम ${money(info.amount)} पहिली ले भराय हे। पेमेंट ले पहिली देखव कि ए तुंहर बिल ले मिलथे।`,
      )
    }

    // Official-sounding name, but the money goes to a personal phone-number UPI ID
    const localPart = info.upiId.split('@')[0] || ''
    if (OFFICIAL_WORDS.test(info.payeeName) && PHONE_LIKE_ID.test(localPart)) {
      add(
        'danger',
        `The name says "${info.payeeName}", but the money goes to a personal UPI ID made from a phone number. Banks, police and government offices don't collect money like this.`,
        `नाम "${info.payeeName}" लिखा है, पर पैसा एक मोबाइल नंबर वाली निजी UPI ID में जाएगा। बैंक, पुलिस या सरकारी दफ़्तर ऐसे पैसे नहीं लेते।`,
        `नाव "${info.payeeName}" लिखाय हे, फेर पैसा एक मोबाइल नंबर वाला निजी UPI ID म जाही। बैंक, पुलिस या सरकारी दफ़्तर अइसन पैसा नइ लेवय।`,
      )
    }

    if (!info.payeeName) {
      add(
        'warn',
        'This QR does not show a payee name. Check the name shown in your UPI app before entering your PIN.',
        'इस QR में पाने वाले का नाम नहीं है। पिन डालने से पहले अपने UPI ऐप में दिखा नाम ज़रूर देखें।',
        'ए QR म पवइया के नाव नइ हे। पिन डाले ले पहिली अपन UPI ऐप म दिखे नाव ल जरूर देखव।',
      )
    }

    // Does the payee match who the user expects to pay?
    const expected = expectedName.trim()
    if (expected && info.payeeName) {
      if (namesMatch(expected, info.payeeName)) {
        add(
          'ok',
          `The payee name matches "${expected}".`,
          `पाने वाले का नाम "${expected}" से मेल खाता है।`,
          `पवइया के नाव "${expected}" ले मिलथे।`,
        )
      } else {
        add(
          'danger',
          `You expect to pay "${expected}", but this QR pays "${info.payeeName}". Don't pay. Ask the shop to show their own QR.`,
          `आप "${expected}" को भुगतान करना चाहते हैं, पर यह QR "${info.payeeName}" को पैसे भेजेगा। भुगतान न करें, दुकान से उनका अपना QR मांगें।`,
          `तुमन "${expected}" ल पेमेंट करना चाहथव, फेर ए QR "${info.payeeName}" ल पैसा भेजही। पेमेंट झन करव, दुकान ले ओकर अपन QR मांगव।`,
        )
      }
    }
  }

  const level = flags.some((f) => f.level === 'danger')
    ? 'danger'
    : flags.some((f) => f.level === 'warn')
    ? 'warn'
    : 'ok'
  return { level, flags }
}
