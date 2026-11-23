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

// ---- "What to do right now": built from the scam type and from what is in the message ----

// Advice for each scam type the model can detect
const TYPE_STEPS = {
  fake_scheme: [
    {
      en: 'No real lottery, prize or government scheme asks you to pay a fee first.',
      hi: 'कोई असली लॉटरी, इनाम या सरकारी योजना पहले पैसे नहीं मांगती।',
      cg: 'कोनो सच के लॉटरी, इनाम या सरकारी योजना पहिली पैसा नइ मांगय।',
    },
    {
      en: 'Check bills and schemes only on the official website, app or office, never through a link in a message.',
      hi: 'बिल या योजना की जानकारी केवल आधिकारिक वेबसाइट, ऐप या दफ़्तर से जाँचें, मैसेज के लिंक से नहीं।',
      cg: 'बिल या योजना ल खाली सरकारी वेबसाइट, ऐप या दफ़्तर ले जाँचव, मैसेज के लिंक ले नहीं।',
    },
  ],
  kyc: [
    {
      en: "Banks never block your account by SMS or ask for KYC through a link. Visit your branch or use the bank's official app.",
      hi: 'बैंक SMS से खाता ब्लॉक नहीं करता और न लिंक से KYC मांगता है। अपनी शाखा जाएँ या बैंक का आधिकारिक ऐप इस्तेमाल करें।',
      cg: 'बैंक SMS ले खाता बंद नइ करय अउ लिंक ले KYC नइ मांगय। अपन शाखा जावव या बैंक के सरकारी ऐप चलावव।',
    },
  ],
  otp: [
    {
      en: 'Never share an OTP with anyone, not even someone who says they are from the bank.',
      hi: 'OTP किसी को न बताएं, बैंक का नाम लेने वाले को भी नहीं।',
      cg: 'ओटीपी कोनो ल झन बतावव, बैंक के नाव लेवइया ल घलो नहीं।',
    },
  ],
  digital_arrest: [
    {
      en: 'Police never arrest anyone over a video call or ask for money. Cut the call: you are not in trouble.',
      hi: 'पुलिस कभी वीडियो कॉल पर गिरफ़्तार नहीं करती और पैसे नहीं मांगती। फोन काटें, आप किसी मुसीबत में नहीं हैं।',
      cg: 'पुलिस कभू वीडियो कॉल म गिरफ़्तार नइ करय अउ पैसा नइ मांगय। फोन काट देवव, तुमन कोनो मुसीबत म नइ हव।',
    },
    {
      en: "Tell a family member right away. Scammers keep you on the call so you can't ask anyone.",
      hi: 'तुरंत परिवार के किसी सदस्य को बताएं। ठग आपको कॉल पर इसलिए रोकते हैं ताकि आप किसी से पूछ न सकें।',
      cg: 'तुरते घर के कोनो ल बतावव। ठग कॉल म एकरे सेती रोकथें कि तुमन कोनो ले झन पूछ सकव।',
    },
  ],
  loan_app: [
    {
      en: 'Do not install loan apps from links. Borrow only from an RBI-registered bank or company.',
      hi: 'लिंक से लोन ऐप इंस्टॉल न करें। केवल RBI-पंजीकृत बैंक या कंपनी से ही लोन लें।',
      cg: 'लिंक ले लोन ऐप झन डालव। खाली RBI म दर्ज बैंक या कंपनी ले लोन लेवव।',
    },
    {
      en: 'If an app threatens you or your contacts, do not pay. Report it on cybercrime.gov.in.',
      hi: 'अगर कोई ऐप आपको या आपके संपर्कों को धमकाए, तो पैसे न दें। cybercrime.gov.in पर शिकायत करें।',
      cg: 'अगर कोनो ऐप तुमन ल या तुंहर चिन्हार मन ल धमकाय, त पैसा झन देवव। cybercrime.gov.in म सिकायत करव।',
    },
  ],
  mule_recruitment: [
    {
      en: "Never lend or rent out your bank account, UPI or SIM. You can be arrested for the scammer's crime.",
      hi: 'अपना बैंक खाता, UPI या सिम किसी को किराए पर न दें। ठग के अपराध में आप फँस सकते हैं।',
      cg: 'अपन बैंक खाता, UPI या सिम कोनो ल किराया म झन देवव। ठग के अपराध म तुमन फँस सकथव।',
    },
    {
      en: "An 'easy money' job that only needs your bank account is always a trap.",
      hi: "जिस 'आसान कमाई' वाली नौकरी में सिर्फ़ आपका खाता चाहिए, वह हमेशा जाल होती है।",
      cg: "जउन 'आसान कमाई' वाला काम म खाली तुंहर खाता लगथे, वो हमेशा जाल आय।",
    },
  ],
  other: [
    {
      en: 'Do not reply, and do not share any personal or bank details.',
      hi: 'जवाब न दें और कोई निजी या बैंक जानकारी साझा न करें।',
      cg: 'जवाब झन देवव अउ कोनो निजी या बैंक जानकारी झन बतावव।',
    },
  ],
}

// Advice for things actually present in the message (checked in this order)
const FEATURE_STEPS = [
  {
    id: 'apk',
    test: /\.apk\b|\bapk\b|एपीके/i,
    en: 'Do not install any app (.apk) sent to you.',
    hi: 'भेजा गया कोई ऐप (.apk) इंस्टॉल न करें।',
    cg: 'भेजे गे कोनो ऐप (.apk) ल झन डालव।',
  },
  {
    id: 'pin_qr',
    test: /\bQR\b|क्यूआर|\bscan\b|स्कैन|\bPIN\b|पिन/i,
    en: 'Never scan a QR code or enter your UPI PIN to receive money. The PIN is only for paying.',
    hi: 'पैसे पाने के लिए कभी QR स्कैन न करें और UPI पिन न डालें। पिन केवल पैसे भेजने के लिए है।',
    cg: 'पैसा पाए बर कभू QR स्कैन झन करव अउ UPI पिन झन डालव। पिन खाली पैसा भेजे बर होथे।',
  },
  {
    id: 'bill',
    test: /बिजली|electricity|power bill|bijli|बिल\b|\bbill\b|connection/i,
    en: 'For electricity or other bills, check only on the official app, website or office. No one cuts power over SMS.',
    hi: 'बिजली या दूसरे बिल केवल आधिकारिक ऐप, वेबसाइट या दफ़्तर से ही जाँचें। SMS पर कोई बिजली नहीं काटता।',
    cg: 'बिजली या दूसर बिल ल खाली सरकारी ऐप, वेबसाइट या दफ़्तर ले जाँचव। SMS म कोनो बिजली नइ काटय।',
  },
  {
    id: 'job',
    test: /part[\s-]?time|\bjob\b|commission|earn\b|daily income|कमाई|नौकरी|किराए|rent your|account on rent/i,
    en: "An 'easy money' job that only needs your bank account is always a trap.",
    hi: "जिस 'आसान कमाई' वाली नौकरी में सिर्फ़ आपका खाता चाहिए, वह हमेशा जाल होती है।",
    cg: "जउन 'आसान कमाई' वाला काम म खाली तुंहर खाता लगथे, वो हमेशा जाल आय।",
  },
  {
    id: 'link',
    test: /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|online|xyz|top|site|link|pw|info|net|co|ly|me|app|live|click)\b/i,
    en: 'Do not open the link in this message.',
    hi: 'इस मैसेज का लिंक न खोलें।',
    cg: 'ए मैसेज के लिंक ल झन खोलव।',
  },
  {
    id: 'phone',
    test: /(?:\+?91[\s-]?)?\b[6-9]\d{9}\b/,
    en: 'Do not call or WhatsApp the number in this message.',
    hi: 'इस मैसेज में दिए नंबर पर कॉल या WhatsApp न करें।',
    cg: 'ए मैसेज के नंबर म फोन या WhatsApp झन करव।',
  },
  {
    id: 'otp',
    test: /\bOTP\b|ओटीपी/i,
    en: 'Never share an OTP with anyone, not even someone who says they are from the bank.',
    hi: 'OTP किसी को न बताएं, बैंक का नाम लेने वाले को भी नहीं।',
    cg: 'ओटीपी कोनो ल झन बतावव, बैंक के नाव लेवइया ल घलो नहीं।',
  },
]

// Always the last step for a scam: the official handoff
const FINAL_SCAM_STEP = {
  en: 'Already paid or shared an OTP? Call 1930 now. If not, tap "Report this Scam" below.',
  hi: 'पैसे भेज दिए या OTP बता दिया? अभी 1930 पर कॉल करें। नहीं तो नीचे "इसकी शिकायत करें" दबाएं।',
  cg: 'पैसा भेज दे हव या ओटीपी बता दे हव? अभी 1930 म फोन करव। नइ त नीचे "एकर रपट लिखावव" दबावव।',
}

const GENUINE_STEPS = [
  {
    en: 'The model found no strong scam signals in this message.',
    hi: 'मॉडल को इस संदेश में ठगी के मज़बूत संकेत नहीं मिले।',
    cg: 'मॉडल ल ए मैसेज म ठगी के मजबूत संकेत नइ मिलिस।',
  },
  {
    en: 'Still, never share an OTP, PIN or password with anyone.',
    hi: 'फिर भी, OTP, पिन या पासवर्ड किसी को न बताएं।',
    cg: 'तभो ले, ओटीपी, पिन या पासवर्ड कोनो ल झन बतावव।',
  },
]

const GENUINE_LINK_STEP = {
  en: "If you weren't expecting this message, open the official app instead of the link.",
  hi: 'अगर आपको इस मैसेज की उम्मीद नहीं थी, तो लिंक के बजाय आधिकारिक ऐप खोलें।',
  cg: 'अगर ए मैसेज के आस नइ रिहिस, त लिंक के जगह सरकारी ऐप खोलव।',
}

function buildActionSteps(isScam, scamType, text) {
  const numbered = (steps) => steps.map((s, i) => ({ num: i + 1, en: s.en, hi: s.hi, cg: s.cg }))
  const hasLink = FEATURE_STEPS.find((f) => f.id === 'link').test.test(text)

  if (!isScam) return numbered(hasLink ? [...GENUINE_STEPS, GENUINE_LINK_STEP] : GENUINE_STEPS)

  const core = TYPE_STEPS[scamType] || TYPE_STEPS.other
  const features = FEATURE_STEPS.filter((f) => f.test.test(text))
    // don't repeat what the type advice already says
    .filter((f) => !core.some((c) => c.en === f.en))
  // At most 3 specific steps, then the official handoff
  return numbered([...core, ...features].slice(0, 3).concat(FINAL_SCAM_STEP))
}

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
    actionSteps: buildActionSteps(isScam, scamType, text),
    relatedLessonId: LESSON_FOR_TYPE[scamType] || 'otp',
    originalText: text,
  }
}
