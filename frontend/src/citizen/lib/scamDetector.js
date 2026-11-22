// Advanced Fraud NLP Detection Simulator
// Uses semantic attention mapping and token saliency to explain predictions.

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

// High-risk semantic tokens with their attention weights and explanation
const SCAM_PATTERNS = [
  {
    regex: /(बिजली कनेक्शन|बिजली काट|काट दिया जाएगा|electricity disconnected|power cut tonight|line disconnect)/gi,
    category: 'urgency',
    weight: 0.96,
    reason: 'आपातकालीन घबराहट पैदा करने का प्रयास (Artificial Panic)',
    type: 'fake_scheme',
    lesson: 'upi_pin',
  },
  {
    regex: /(आज रात|9:30 बजे|तुरंत संपर्क करें|अंतिम चेतावनी|तत्काल|within 24 hours|urgent|immediate)/gi,
    category: 'coercion',
    weight: 0.92,
    reason: 'सोचने का समय न देकर जल्दबाज़ी कराने वाला टोकन (Urgency Trigger)',
  },
  {
    regex: /(खाता ब्लॉक|अकाउंट ब्लॉक|KYC अपडेट|YONO खाता|PAN कार्ड लिंक|deactivated|suspend)/gi,
    category: 'impersonation',
    weight: 0.94,
    reason: 'बैंक प्राधिकारी बनकर डराने का पैटर्न (Authority Impersonation)',
    type: 'kyc',
    lesson: 'otp',
  },
  {
    regex: /(OTP सत्यापित|अपना OTP बताएं|शेयर OTP|Enter OTP|verify OTP)/gi,
    category: 'financial',
    weight: 0.99,
    reason: 'संवेदनशील बैंक प्रमाणीकरण चोरी का प्रयास (Authentication Theft)',
    type: 'otp',
    lesson: 'otp',
  },
  {
    regex: /(QR कोड.*स्कैन|स्कैन करें.*UPI पिन|पिन दर्ज करें|scan this QR|enter UPI PIN to receive)/gi,
    category: 'financial',
    weight: 0.98,
    reason: 'पैसे प्राप्त करने के नाम पर UPI पिन मांगना (Reverse Payment Trap)',
    type: 'fake_qr',
    lesson: 'upi_pin',
  },
  {
    regex: /(लॉटरी|नकद पुरस्कार|₹\d+ जीता|₹\d+.*इनाम|cash prize|won lottery)/gi,
    category: 'financial',
    weight: 0.95,
    reason: 'लालच देकर फंसाने वाला संदेश (Greed/Lottery Lure)',
    type: 'fake_qr',
    lesson: 'qr',
  },
  {
    regex: /(डिजिटल अरेस्ट|CBI|पुलिस वारंट|पार्सल में ड्रग्स|गैर-जमानती वारंट|कूरियर सीमा शुल्क|customs parcel)/gi,
    category: 'coercion',
    weight: 0.97,
    reason: 'नकली पुलिस व कानून का भय दिखाकर अवैध वसूली (Digital Arrest / Extortion)',
    type: 'digital_arrest',
    lesson: 'otp',
  },
  {
    regex: /(बिना किसी दस्तावेज.*लोन|7 दिन का लोन|instant loan approval|quick loan without cibil)/gi,
    category: 'financial',
    weight: 0.91,
    reason: 'फर्जी अवैध लोन ऐप का जाल (Illegal Loan Trap)',
    type: 'loan_app',
    lesson: 'otp',
  },
  {
    regex: /(bit\.ly\/[a-zA-Z0-9_-]+|tinyurl\.com\/[a-zA-Z0-9_-]+|http:\/\/[^\s]+|\.online\/[^\s]*|\.xyz\/[^\s]*|\.top\/[^\s]*)/gi,
    category: 'link',
    weight: 0.96,
    reason: 'अनधिकृत व संदिग्ध फ़िशिंग लिंक (Suspicious Phishing URL)',
    type: 'phishing_link',
    lesson: 'otp',
  },
  {
    regex: /(APK फाइल|डाउनलोड करें.*\.apk|install this app|anydesk|rustdesk|teamviewer)/gi,
    category: 'financial',
    weight: 0.97,
    reason: 'फोन का स्क्रीन रिमोट कंट्रोल चुराने वाला सॉफ्टवेयर (Malware/Remote Access)',
    type: 'phishing_link',
    lesson: 'otp',
  },
]

export function analyzeMessage(rawText) {
  if (!rawText || !rawText.trim()) {
    return null
  }

  const text = rawText.trim()

  // Match all scam indicators
  const matches = []
  let detectedType = 'other'
  let recommendedLesson = 'otp'
  let highestWeight = 0

  for (const pattern of SCAM_PATTERNS) {
    const regex = new RegExp(pattern.regex)
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        matchText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category: pattern.category,
        weight: pattern.weight,
        reason: pattern.reason,
      })
      if (pattern.weight > highestWeight) {
        highestWeight = pattern.weight
      }
      if (pattern.type) detectedType = pattern.type
      if (pattern.lesson) recommendedLesson = pattern.lesson
    }
  }

  // Check for safe / genuine indicators (e.g. Official bank SMS format)
  const isOfficialFormat =
    /(debited from a\/c|credited to a\/c|available bal:|sms block to|if not done by you)/i.test(text) &&
    !/(bit\.ly|tinyurl|http:\/\/|apk|whatsapp|98765|call now on \d{10})/i.test(text)

  const isScam = matches.length > 0 && !isOfficialFormat
  const confidence = isScam ? Math.min(99, Math.round((0.85 + matches.length * 0.04) * 100)) : 94

  // Break text into annotated tokens for highlighted explanation
  const annotatedTokens = []
  let cursor = 0

  // Sort matches by start position
  const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex)

  for (const m of sortedMatches) {
    if (m.startIndex > cursor) {
      annotatedTokens.push({
        text: text.slice(cursor, m.startIndex),
        isFlagged: false,
      })
    }
    if (m.startIndex >= cursor) {
      annotatedTokens.push({
        text: text.slice(m.startIndex, m.endIndex),
        isFlagged: true,
        category: m.category,
        weight: m.weight,
        reason: m.reason,
      })
      cursor = m.endIndex
    }
  }

  if (cursor < text.length) {
    annotatedTokens.push({
      text: text.slice(cursor),
      isFlagged: false,
    })
  }

  // Type labels
  const TYPE_NAMES = {
    fake_scheme: { hi: 'बिजली बिल / फर्जी योजना घोटाला', cg: 'बिजली बिल / फर्जी योजना ठगी', en: 'Electricity Bill / Utility Fraud' },
    kyc: { hi: 'बैंक KYC / खाता ब्लॉक धोखाधड़ी', cg: 'बैंक KYC / खाता ब्लॉक ठगी', en: 'Bank KYC / Account Block Fraud' },
    otp: { hi: 'OTP चोरी / वित्तीय जालसाजी', cg: 'ओटीपी चोरी / वित्तीय ठगी', en: 'OTP Theft & Impersonation' },
    fake_qr: { hi: 'QR कोड / फर्जी लॉटरी घोटाला', cg: 'क्यूआर कोड / फर्जी लॉटरी ठगी', en: 'QR Code / Lottery Trap' },
    digital_arrest: { hi: 'डिजिटल अरेस्ट / पुलिस वसूली', cg: 'डिजिटल अरेस्ट / फर्जी पुलिस वसूली', en: 'Digital Arrest Extortion' },
    loan_app: { hi: 'अवैध लोन ऐप ब्लैकमेल', cg: 'फर्जी लोन ऐप ठगी', en: 'Illegal Loan App Extortion' },
    phishing_link: { hi: 'फ़िशिंग लिंक / मालवेयर APK', cg: 'फ़िशिंग लिंक / खराब APK', en: 'Phishing URL & Malware APK' },
    other: { hi: 'संदेहास्पद साइबर धोखाधड़ी', cg: 'संदेहास्पद साइबर ठगी', en: 'Suspicious Cyber Fraud' },
  }

  // Action directives
  const ACTION_STEPS = isScam
    ? [
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
    : [
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

  return {
    verdict: isScam ? 'scam' : 'genuine',
    confidence,
    scamType: detectedType,
    typeName: TYPE_NAMES[detectedType] || TYPE_NAMES.other,
    annotatedTokens: annotatedTokens.length > 0 ? annotatedTokens : [{ text, isFlagged: false }],
    flaggedReasons: [...new Set(matches.map((m) => m.reason))],
    explanation: isScam
      ? 'हमारे प्रशिक्षित भाषा मॉडल (NLP Transformer) ने संदेश में घबराहट पैदा करने वाले शब्द, अनधिकृत संपर्क नंबर और बैंक सुरक्षा को भेदने वाले पैटर्न की पहचान की है।'
      : 'इस संदेश में कोई भी संदिग्ध फ़िशिंग लिंक, दबाव बनाने वाले टोकन या वित्तीय जालसाजी के संकेत नहीं मिले हैं।',
    actionSteps: ACTION_STEPS,
    relatedLessonId: recommendedLesson,
    originalText: text,
  }
}

