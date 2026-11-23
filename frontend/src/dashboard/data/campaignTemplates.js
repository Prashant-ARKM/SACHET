// Awareness campaign kit: content templates per scam type, plus builders for SMS and announcer script.
// hi + en are complete. cg uses a Chhattisgarhi frame (greeting, call-to-action) and falls back to the
// Hindi scam-specific lines until they are translated (ask the team to review cg).
import { scamLabel } from '../../shared/scamTypes.js'

// truth: one-line fact that busts the scam. lines: what scammers say. tips: three things to do.
const CONTENT = {
  otp: {
    hi: {
      truth: 'बैंक कभी फ़ोन या SMS पर OTP नहीं माँगता।',
      lines: ['आपके खाते में गलती से पैसे आ गए, OTP बताइए', 'रिवॉर्ड पॉइंट भुनाने के लिए OTP भेजें'],
      tips: ['OTP किसी को न बताएँ, बैंक वाले को भी नहीं।', 'OTP वाला SMS पूरा पढ़ें: वह पैसे भेजने के लिए भी हो सकता है।', 'शक हो तो कॉल काटें और बैंक के आधिकारिक नंबर पर खुद कॉल करें।'],
    },
    en: {
      truth: 'Banks never ask for your OTP on a call or SMS.',
      lines: ['Money came to you by mistake, tell me the OTP', 'Send the OTP to redeem your reward points'],
      tips: ['Never share an OTP, not even with "bank staff".', 'Read the full OTP SMS: it may be for sending money.', 'If in doubt, hang up and call your bank\'s official number yourself.'],
    },
  },
  kyc: {
    hi: {
      truth: 'KYC के नाम पर "आज खाता बंद" वाली धमकी झूठी होती है।',
      lines: ['आपका खाता आज ब्लॉक हो जाएगा, KYC अपडेट करें', 'इस लिंक पर PAN या आधार अपडेट करें'],
      tips: ['KYC सिर्फ़ बैंक शाखा या बैंक के आधिकारिक ऐप से करें।', 'मैसेज में आए लिंक पर क्लिक न करें।', 'कोई AnyDesk जैसा ऐप डलवाए तो मना करें।'],
    },
    en: {
      truth: '"Your account will be blocked today, update KYC" messages are fake.',
      lines: ['Your account will be blocked today, update your KYC', 'Update your PAN or Aadhaar at this link'],
      tips: ['Do KYC only at your bank branch or in the bank\'s official app.', 'Don\'t tap links in such messages.', 'Refuse if anyone asks you to install an app like AnyDesk.'],
    },
  },
  fake_qr: {
    hi: {
      truth: 'पैसे लेने के लिए QR स्कैन या UPI PIN डालने की ज़रूरत नहीं होती।',
      lines: ['पेमेंट पाने के लिए यह QR स्कैन करें', 'इनाम की राशि लेने के लिए PIN डालें'],
      tips: ['UPI PIN सिर्फ़ पैसे भेजने के लिए है, लेने के लिए नहीं।', 'स्कैन करने के बाद पाने वाले का नाम ज़रूर मिलाएँ।', 'दुकान पर लगा QR बदला हुआ तो नहीं, जाँचते रहें।'],
    },
    en: {
      truth: 'You never need to scan a QR or enter your UPI PIN to receive money.',
      lines: ['Scan this QR to receive your payment', 'Enter your PIN to collect the prize money'],
      tips: ['Your UPI PIN is only for sending money, never for receiving.', 'After scanning, always check the payee name.', 'Shopkeepers: check that your QR sticker hasn\'t been swapped.'],
    },
  },
  phishing_link: {
    hi: {
      truth: '"आज रात बिजली कटेगी" या "इनाम जीता" वाले लिंक ठगी के जाल हैं।',
      lines: ['आज रात आपकी बिजली कट जाएगी, इस लिंक पर बिल भरें', 'आपने ₹5,000 जीते, लिंक खोलें'],
      tips: ['अनजान लिंक न खोलें, bit.ly जैसे छोटे लिंक से ख़ास सावधान रहें।', 'बिल हमेशा आधिकारिक ऐप या वेबसाइट से भरें।', 'किसी लिंक पर बैंक या कार्ड की जानकारी न डालें।'],
    },
    en: {
      truth: '"Power cut tonight" or "you won a prize" links are traps.',
      lines: ['Your electricity will be cut tonight, pay at this link', 'You won ₹5,000, open the link'],
      tips: ['Don\'t open unknown links, especially short ones like bit.ly.', 'Pay bills only in the official app or website.', 'Never enter bank or card details on a link.'],
    },
  },
  loan_app: {
    hi: {
      truth: 'बिना जाँच "तुरंत लोन" देने वाले ऐप बाद में धमकी और ब्लैकमेल करते हैं।',
      lines: ['सिर्फ़ आधार से 5 मिनट में लोन', 'लोन चाहिए तो पहले प्रोसेसिंग फ़ीस भरें'],
      tips: ['लोन सिर्फ़ RBI-पंजीकृत बैंक या NBFC से लें।', 'लोन से पहले फ़ीस माँगी जाए तो वह ठगी है।', 'ऐप को कॉन्टैक्ट और फ़ोटो की अनुमति न दें।'],
    },
    en: {
      truth: '"Instant loan" apps with no checks later threaten and blackmail.',
      lines: ['Loan in 5 minutes with just Aadhaar', 'Pay the processing fee first to get your loan'],
      tips: ['Borrow only from RBI-registered banks or NBFCs.', 'A fee before the loan means it\'s a scam.', 'Don\'t give loan apps access to contacts or photos.'],
    },
  },
  scam_call: {
    hi: {
      truth: 'बैंक या कंपनी वाले फ़ोन पर PIN, CVV या पासवर्ड नहीं पूछते।',
      lines: ['मैं बैंक मैनेजर बोल रहा हूँ, आपका कार्ड बंद हो रहा है', 'आपकी बीमा पॉलिसी का बोनस निकला है'],
      tips: ['फ़ोन पर PIN, CVV या OTP कभी न बताएँ।', 'जल्दबाज़ी कराई जाए तो कॉल काट दें।', 'ऐसे नंबर की शिकायत Chakshu (संचार साथी) पर करें।'],
    },
    en: {
      truth: 'Banks and companies never ask for your PIN, CVV or password on a call.',
      lines: ['I\'m your bank manager, your card is being blocked', 'A bonus is due on your insurance policy'],
      tips: ['Never share your PIN, CVV or OTP on a call.', 'If they rush you, hang up.', 'Report the number on Chakshu (Sanchar Saathi).'],
    },
  },
  digital_arrest: {
    hi: {
      truth: 'पुलिस या CBI कभी वीडियो कॉल पर गिरफ़्तार नहीं करती।',
      lines: ['आपके नाम से ड्रग्स वाला पार्सल मिला है', 'कैमरा बंद मत करना, जाँच चल रही है'],
      tips: ['"डिजिटल अरेस्ट" जैसा कुछ नहीं होता।', 'डराकर पैसे माँगें तो तुरंत फ़ोन काटें।', 'घरवालों को बताएँ और 1930 पर कॉल करें।'],
    },
    en: {
      truth: 'Police or CBI never arrest anyone on a video call.',
      lines: ['A parcel with drugs was found in your name', 'Don\'t switch off your camera, the inquiry is on'],
      tips: ['There is no such thing as a "digital arrest".', 'If they scare you and ask for money, hang up.', 'Tell your family and call 1930.'],
    },
  },
  courier_customs: {
    hi: {
      truth: '"आपका पार्सल कस्टम में रुका है, फ़ीस भरें" वाले कॉल ठगी हैं।',
      lines: ['आपका पार्सल कस्टम में रुका है, ₹2,000 भरें', 'आपके पार्सल में गैरकानूनी सामान मिला है'],
      tips: ['जो पार्सल आपने मँगाया ही नहीं, उसकी फ़ीस न भरें।', 'कूरियर कंपनी के आधिकारिक नंबर पर खुद जाँचें।', 'आधार या बैंक जानकारी न बताएँ।'],
    },
    en: {
      truth: '"Your parcel is held at customs, pay a fee" calls are scams.',
      lines: ['Your parcel is held at customs, pay ₹2,000', 'Illegal items were found in your parcel'],
      tips: ['Don\'t pay for a parcel you never ordered.', 'Check with the courier company\'s official number yourself.', 'Don\'t share Aadhaar or bank details.'],
    },
  },
  fake_scheme: {
    hi: {
      truth: 'सरकारी योजना का पैसा पाने के लिए कोई फ़ीस नहीं लगती।',
      lines: ['योजना में नाम जुड़वाने के लिए ₹500 रजिस्ट्रेशन फ़ीस भरें', 'योजना का फ़ॉर्म इस लिंक से भरें'],
      tips: ['योजना की जानकारी पंचायत या सरकारी दफ़्तर से ही लें।', 'फ़ीस माँगी जाए तो वह ठगी है।', 'अपना आधार, बैंक या OTP किसी को न दें।'],
    },
    en: {
      truth: 'Government schemes never charge a fee to pay you.',
      lines: ['Pay a ₹500 registration fee to join the scheme', 'Fill in the scheme form at this link'],
      tips: ['Get scheme information only from the panchayat or a government office.', 'If they ask for a fee, it\'s a scam.', 'Never share your Aadhaar, bank details or OTP.'],
    },
  },
  mule_recruitment: {
    hi: {
      truth: 'अपना बैंक खाता या सिम किराए पर देना अपराध है।',
      lines: ['घर बैठे कमाई, बस अपना खाता इस्तेमाल करने दें', 'हर ट्रांज़ैक्शन पर कमीशन मिलेगा'],
      tips: ['खाता, ATM कार्ड या सिम किसी को न दें।', 'आसान कमाई का लालच ठगी का जाल है।', 'आपके खाते से ठगी का पैसा गया तो केस आप पर बनेगा।'],
    },
    en: {
      truth: 'Renting out your bank account or SIM is a crime.',
      lines: ['Earn from home, just let us use your account', 'You\'ll get commission on every transaction'],
      tips: ['Never hand over your account, ATM card or SIM.', 'Easy-money offers are a trap.', 'If scam money passes through your account, the case is on you.'],
    },
  },
  other: {
    hi: {
      truth: 'जल्दबाज़ी, डर या लालच: ये तीनों ठगी के संकेत हैं।',
      lines: ['तुरंत करें, वरना नुकसान होगा', 'आपने बड़ा इनाम जीता है'],
      tips: ['OTP या PIN किसी को न बताएँ।', 'अनजान लिंक न खोलें।', 'शक हो तो 1930 पर कॉल करें।'],
    },
    en: {
      truth: 'Hurry, fear or greed: all three are signs of a scam.',
      lines: ['Do it now or you\'ll lose out', 'You have won a big prize'],
      tips: ['Never share your OTP or PIN.', 'Don\'t open unknown links.', 'If in doubt, call 1930.'],
    },
  },
}

// Fixed poster / script wording per language.
const FRAME = {
  hi: {
    beware: 'सावधान',
    knowTruth: 'सच जानिए',
    watchFor: 'ऐसी बातें सुनें तो सावधान:',
    realMessage: 'यह संदेश घूम रहा है:',
    blocked: 'इन नंबर / ID की शिकायतें आई हैं, सावधान:',
    doThis: 'क्या करें',
    lostMoney: 'पैसे कटे? तुरंत कॉल करें',
    callShort: 'पैसे कटे? 1930',
    awareness: 'जागरूकता अभियान',
    district: 'ज़िला',
    reportsThisWeek: (d, n) => `${d} में इस हफ़्ते ${n} ${n === 1 ? 'शिकायत' : 'शिकायतें'}`,
    upFromLast: (p) => `पिछले हफ़्ते से ${p}% ज़्यादा`,
    sms: (d, label, truth) => `सचेत: ${d} में ${label} के मामले बढ़ रहे हैं। ${truth} पैसे कटे तो तुरंत 1930 पर कॉल करें।`,
    script: (d, label, c) =>
      `ध्यान दें, ध्यान दें। ${d} ज़िले के सभी भाइयों और बहनों के लिए ज़रूरी सूचना। ` +
      `इन दिनों ${label} के मामले बढ़ रहे हैं। ${c.truth} ` +
      `अगर कोई कहे, "${c.lines[0]}", तो समझ जाइए कि यह ठगी है। ` +
      `याद रखिए: ${c.tips.join(' ')} ` +
      `अगर पैसे कट जाएँ, तो तुरंत 1930 पर कॉल करें। एक बार फिर: एक नौ तीन शून्य। सचेत रहें, सुरक्षित रहें।`,
  },
  cg: {
    beware: 'सावधान',
    knowTruth: 'सच जानव',
    watchFor: 'अइसन गोठ सुनव त सावधान:',
    realMessage: 'ए संदेस घूमत हे:',
    blocked: 'ए नंबर / ID के सिकायत आए हे, सावधान:',
    doThis: 'का करना हे',
    lostMoney: 'पइसा कट गे? तुरते फोन लगावव',
    callShort: 'पइसा कट गे? 1930',
    awareness: 'जागरूकता अभियान',
    district: 'जिला',
    reportsThisWeek: (d, n) => `${d} म ए हफ्ता ${n} सिकायत`,
    upFromLast: (p) => `पाछू हफ्ता ले ${p}% जादा`,
    sms: (d, label, truth) => `सचेत: ${d} म ${label} के मामला बाढ़त हे। ${truth} पइसा कट गे त तुरते 1930 म फोन लगावव।`,
    script: (d, label, c) =>
      `सुनव, सुनव। ${d} जिला के जम्मो भाई-बहिनी मन बर जरूरी सूचना। ` +
      `ए दिन ${label} के मामला बाढ़त हे। ${c.truth} ` +
      `कोनो कहय, "${c.lines[0]}", त समझ जावव के ए ठगी हे। ` +
      `सुरता राखव: ${c.tips.join(' ')} ` +
      `पइसा कट जाय त तुरते 1930 म फोन लगावव। फेर ले सुनव: एक नौ तीन सुन्ना। सचेत रहव, सुरक्छित रहव।`,
  },
  en: {
    beware: 'Beware',
    knowTruth: 'Know the truth',
    watchFor: 'If you hear this, be careful:',
    realMessage: 'This message is going around:',
    blocked: 'Reported by citizens, beware of:',
    doThis: 'What to do',
    lostMoney: 'Lost money? Call right away',
    callShort: 'Lost money? 1930',
    awareness: 'Awareness campaign',
    district: 'District',
    reportsThisWeek: (d, n) => `${n} ${n === 1 ? 'report' : 'reports'} in ${d} this week`,
    upFromLast: (p) => `up ${p}% from last week`,
    sms: (d, label, truth) => `SACHET alert: ${label} cases are rising in ${d}. ${truth} Lost money? Call 1930 now.`,
    script: (d, label, c) =>
      `Attention please. An important message for everyone in ${d} district. ` +
      `${label} cases are rising. ${c.truth} ` +
      `If someone says, "${c.lines[0]}", it is a scam. ` +
      `Remember: ${c.tips.join(' ')} ` +
      `If you lose money, call 1930 right away. Once more: one nine three zero. Stay alert, stay safe.`,
  },
}

export const KIT_LANGS = [
  { id: 'hi', label: 'हिंदी', speech: 'hi-IN' },
  { id: 'cg', label: 'छ.ग.', speech: 'hi-IN' },
  { id: 'en', label: 'English', speech: 'en-IN' },
]

// Everything the kit needs for one district + scam type + language.
// real: optional { quote, keywords } from a real scam message the official pasted (ML-analysed).
// The quote replaces the template "what scammers say" lines; keywords get highlighted.
export function buildCampaign({ district, type, lang, evidence, real, blocked = [] }) {
  const frame = FRAME[lang] || FRAME.hi
  const byType = CONTENT[type] || CONTENT.other
  const base = byType[lang] || byType.hi // cg falls back to Hindi lines for now
  const content = real?.quote ? { ...base, lines: [real.quote] } : base
  const label = scamLabel(type, lang === 'cg' ? 'cg' : lang)

  const evidenceLine = evidence
    ? [
        frame.reportsThisWeek(district, evidence.last7),
        evidence.prev7 > 0 && evidence.last7 > evidence.prev7 ? frame.upFromLast(Math.round(evidence.change * 100)) : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  return {
    lang,
    district,
    label,
    frame,
    content,
    evidenceLine,
    real: real?.quote ? { quote: real.quote, keywords: real.keywords || [] } : null,
    blocked,
    sms: frame.sms(district, label, content.truth),
    script: frame.script(district, label, content),
  }
}

// SMS length: Unicode (Hindi) messages fit 70 characters per SMS, plain English 160.
export function smsParts(text) {
  const unicode = /[^\u0000-\u007F]/.test(text)
  const single = unicode ? 70 : 160
  const multi = unicode ? 67 : 153
  const n = [...text].length
  return { chars: n, parts: n <= single ? 1 : Math.ceil(n / multi), unicode }
}
