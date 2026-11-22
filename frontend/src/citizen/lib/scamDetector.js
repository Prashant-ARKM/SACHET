// SACHET scam detector: runs the real on-device model (public/model.json) via src/ml/score.js.
// Output shape is unchanged from the old regex version so the UI needs no changes.
import { score } from '../../ml/score.js'

export const SAMPLE_MESSAGES = [
  {
    label: 'बिजली बिल फ्रॉड (Electricity Bill)',
    text: 'प्रिय उपभोक्ता, आपके पिछले माह का बिजली बिल अपडेट नहीं हुआ है। आज रात 9:30 बजे आपका बिजली कनेक्शन काट दिया जाएगा। तुरंत हमारे बिजली अधिकारी श्री वर्मा से 9876543210 पर संपर्क करें या लिंक bit.ly/cseb-bill से अपडेट करें।',
  },
  {
    label: 'बैंक KYC खाता ब्लॉक (Bank KYC Block)',
    text: 'प्रिय ग्राहक, आपका SBI Yono खाता आज रात ब्लॉक कर दिया जाएगा क्योंकि आपका पैन कार्ड और KYC अपडेट नहीं है। खाता चालू रखने के लिए तुरंत इस लिंक पर क्लिक करें: http://sbi-kyc-update-portal.online और अपना OTP सत्यापित करें।',
  },
  {
    label: 'लॉटरी व QR कोड फ्रॉड (Lottery QR)',
    text: 'बधाई हो! आपको छत्तीसगढ़ राज्य लॉटरी योजना में ₹25,000 का नकद पुरस्कार मिला है। यह पैसा अपने बैंक खाते में तुरंत पाने के लिए नीचे दिए गए QR कोड को PhonePe / GPay से स्कैन करें और अपना 4 अंकों का UPI पिन दर्ज करें।',
  },
  {
    label: 'डिजिटल अरेस्ट / पुलिस (Digital Arrest)',
    text: 'अंतिम चेतावनी: आपके आधार कार्ड पर ताइवान से एक संदिग्ध पार्सल भेजा गया है जिसमें 50 ग्राम ड्रग्स पाई गई है। आपके खिलाफ दिल्ली साइबर सेल और CBI द्वारा गैर-जमानती वारंट जारी किया गया है। तत्काल 9123456789 पर वीडियो कॉल करके डिजिटल अरेस्ट में शामिल हों अन्यथा पुलिस घर पहुंचेगी।',
  },
  {
    label: 'असली बैंक संदेश (Genuine Bank SMS)',
    text: 'SBI: INR 500.00 debited from A/C **1234 on 22-Nov-26 at ATM BILASPUR. Available Bal: INR 14,250.00. If not done by you, SMS BLOCK to 567676 or call 1800111109.',
  },
]

// Model scam_type -> label shown in the UI
const TYPE_NAMES = {
  fake_scheme: { hi: 'फर्जी योजना / लॉटरी / बिल घोटाला', cg: 'फर्जी योजना / लॉटरी / बिल ठगी', en: 'Fake Scheme / Lottery / Utility Fraud' },
  kyc: { hi: 'बैंक KYC / खाता ब्लॉक धोखाधड़ी', cg: 'बैंक KYC / खाता ब्लॉक ठगी', en: 'Bank KYC / Account Block Fraud' },
  otp: { hi: 'OTP चोरी / वित्तीय जालसाजी', cg: 'ओटीपी चोरी / वित्तीय ठगी', en: 'OTP Theft & Impersonation' },
  digital_arrest: { hi: 'डिजिटल अरेस्ट / पुलिस वसूली', cg: 'डिजिटल अरेस्ट / फर्जी पुलिस वसूली', en: 'Digital Arrest Extortion' },
  loan_app: { hi: 'अवैध लोन ऐप ब्लैकमेल', cg: 'फर्जी लोन ऐप ठगी', en: 'Illegal Loan App Extortion' },
  mule_recruitment: { hi: 'बैंक खाता किराए पर लेने का जाल', cg: 'बैंक खाता किराया म लेय के जाल', en: 'Bank Account Mule Recruitment' },
  other: { hi: 'संदेहास्पद साइबर धोखाधड़ी', cg: 'संदेहास्पद साइबर ठगी', en: 'Suspicious Cyber Fraud' },
}

// Which lesson to suggest (lesson ids used by the Learn page: otp, upi_pin, qr)
const LESSON_FOR_TYPE = { fake_scheme: 'qr', kyc: 'otp', otp: 'otp', digital_arrest: 'otp', loan_app: 'otp', mule_recruitment: 'otp' }

const SCAM_STEPS = [
  {
    num: 1,
    hi: 'इस संदेश में दिए गए किसी भी लिंक पर भूलकर भी क्लिक न करें।',
    cg: 'ए मैसेज म देहे कोनो लिंक म भूल के घलो क्लिक झन करव।',
    en: 'Do not click any link provided in this message.',
  },
  {
    num: 2,
    hi: 'संदेश में दिए गए मोबाइल नंबर पर कभी कॉल न करें और न ही कोई ऐप डाउनलोड करें।',
    cg: 'ए नंबर म कभू फोन मत लगावा अउ कोनो ऐप डाउनलोड झन करव।',
    en: 'Never call back on the phone number provided and do not install any APK.',
  },
  {
    num: 3,
    hi: 'यदि किसी ने आपसे संपर्क किया है, तो उसे तुरंत ब्लॉक करें और नीचे "शिकायत दर्ज करें" बटन दबाएं।',
    cg: 'अगर कोनो फोन करे हे त नंबर ल ब्लॉक करव अउ नीचे "रपट दर्ज करव" बटन दबावा।',
    en: 'Block the sender immediately and tap "Report this Scam" below.',
  },
]

const GENUINE_STEPS = [
  {
    num: 1,
    hi: 'यह एक सामान्य बैंक या सेवा का लेन-देन संदेश प्रतीत होता है।',
    cg: 'ए सामान्य बैंक या सेवा के मैसेज लगथय।',
    en: 'This appears to be a standard bank transaction or service update.',
  },
  {
    num: 2,
    hi: 'फिर भी याद रखें: कोई भी आधिकारिक संस्था आपसे फोन पर गुप्त पासवर्ड या OTP नहीं मांगती।',
    cg: 'तभो ले सुरता रखव: कोनो बैंक फोन म पासवर्ड या ओटीपी नइ मांगे।',
    en: 'Always remember: Never share one-time passwords with anyone.',
  },
]

const REASON = 'मॉडल ने इस शब्द को संदेह का मुख्य कारण पाया (Model flagged)'

// Turn the model's highlighted words into [{text,isFlagged}] pieces of the original message
function annotate(text, words) {
  const spans = []
  for (const w of words) {
    let from = 0
    while (true) {
      const i = text.indexOf(w, from)
      if (i < 0) break
      if (!spans.some((s) => i < s.end && i + w.length > s.start)) {
        spans.push({ start: i, end: i + w.length })
        break
      }
      from = i + 1
    }
  }
  spans.sort((a, b) => a.start - b.start)
  const tokens = []
  let cursor = 0
  for (const s of spans) {
    if (s.start > cursor) tokens.push({ text: text.slice(cursor, s.start), isFlagged: false })
    tokens.push({ text: text.slice(s.start, s.end), isFlagged: true, category: 'model', weight: 1, reason: REASON })
    cursor = s.end
  }
  if (cursor < text.length) tokens.push({ text: text.slice(cursor), isFlagged: false })
  return tokens.length ? tokens : [{ text, isFlagged: false }]
}

// NOTE: now async (the model is fetched once from /model.json, then cached).
export async function analyzeMessage(rawText) {
  if (!rawText || !rawText.trim()) return null
  const text = rawText.trim()

  const r = await score(text)
  const isScam = r.label === 'scam'
  const scamType = isScam ? r.scam_type || 'other' : 'other'
  const confidence = Math.round((isScam ? r.score : 1 - r.score) * 100)
  const tokens = annotate(text, isScam ? r.highlights : [])

  return {
    verdict: r.label,
    confidence,
    modelScore: r.score,
    scamType,
    typeName: TYPE_NAMES[scamType] || TYPE_NAMES.other,
    annotatedTokens: tokens,
    flaggedReasons: isScam && r.highlights.length ? [REASON] : [],
    explanation: isScam
      ? 'हमारे ऑन-डिवाइस मॉडल ने इस संदेश में ठगी वाले शब्दों और पैटर्न की पहचान की है। हाइलाइट किए गए शब्द सबसे बड़े संकेत हैं।'
      : 'इस संदेश में ठगी के मज़बूत संकेत नहीं मिले, फिर भी किसी लिंक या नंबर पर भरोसा करने से पहले सावधानी रखें।',
    actionSteps: isScam ? SCAM_STEPS : GENUINE_STEPS,
    relatedLessonId: LESSON_FOR_TYPE[scamType] || 'otp',
    originalText: text,
  }
}
