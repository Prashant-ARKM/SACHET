// Explainable risk signals that sit on top of the ML model.
//
// Why: the model learns word patterns, so genuine bank/service alerts that use scam-like words
// ("blocked", "Dear customer", "OTP") can be false alarms, and new scam styles can be missed.
// Real scams almost always ASK you to do something risky (open a lookalike link, share an OTP,
// pay a fee, install an app, call a personal number). Genuine alerts INFORM, and often warn
// "never share your OTP" or give an official helpline. These signals capture that, each with a
// plain-language reason, and adjust the model's score (in log-odds) before the final verdict.
//
// Works offline, with any model.json. Weights were set by hand and checked on the dev split;
// see ml/results_realworld.md for before/after numbers.

const OFFICIAL_DOMAINS = [
  'gov.in', 'nic.in', 'bank.in', 'rbi.org.in', 'npci.org.in', 'sbi.co.in', 'onlinesbi.sbi', 'sbi',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotak.com', 'pnbindia.in', 'bankofbaroda.in',
  'unionbankofindia.co.in', 'canarabank.com', 'paytm.com', 'phonepe.com', 'amazon.in', 'amzn.in',
  'flipkart.com', 'jio.com', 'airtel.in', 'irctc.co.in', 'licindia.in', 'cspdcl.co.in', 'indiapost.gov.in',
]
const SHORTENERS = ['bit.ly', 'tinyurl.com', 'cutt.ly', 'rb.gy', 'is.gd', 't.ly', 'shorturl.at', 'tiny.cc', 'ow.ly', 'goo.gl', 'rebrand.ly']
const RISKY_TLD = /\.(online|xyz|top|site|click|live|info|buzz|icu|monster|cc|tk|ml|ga|cf|gq|work|loan|shop|vip|win|rest|cyou)$/i
const BRAND_WORDS =
  /sbi|hdfc|icici|axis|kotak|pnb|paytm|phonepe|gpay|amazon|flipkart|netflix|kyc|refund|reward|incometax|itr|parivahan|challan|yojana|subsidy|lpg|gov|epfo|uidai|aadhaar|rbi|npci|upi|bank|bijli|electricity|cspdcl|trai|jio|airtel|customs|fedex|dhl|bluedart|indiapost/i

// Find website addresses in the text (not amounts like Rs.250.00)
// Real web endings only, so "blocked.YONO" or "Rs.250" are not taken for websites
const TLDS = /\.(com|in|net|org|co|info|online|xyz|top|site|click|live|ly|me|app|io|gov|sbi|bank|pw|cc|tk|ml|ga|cf|gq|work|loan|shop|vip|win|rest|cyou|icu|buzz|monster|link|to|ai|biz|us|uk|gd|at|page|store|tech|club|website|space|fun|today|life|world|support|services|help)$/i
function findDomains(text) {
  const out = []
  const re = /(https?:\/\/|www\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})(\/\S*)?/gi
  let m
  while ((m = re.exec(text))) {
    const host = m[2].toLowerCase().replace(/^www\./, '')
    if (!m[1] && !TLDS.test(host)) continue
    out.push({ host, full: m[0] })
  }
  return out
}
const isOfficial = (host) => OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith('.' + d))
const isShortener = (host) => SHORTENERS.includes(host)

const NEGATION = /(never|do not|don't|dont|not|na|mat|मत|न|ना|कभी|kabhi)\W{0,3}\S{0,12}\W{0,3}$/i

// Asks to share a secret (OTP / PIN / CVV / password), not counting "never share"
function asksForSecret(text) {
  if (/deliver/i.test(text)) return false // "share OTP with the delivery agent" is normal
  const re = /(share|tell|send|give|bata\w*|बता\w*|शेयर|daal\w*|डाल\w*|enter|provide|confirm)\W{1,4}(?:\S+\W{1,3}){0,4}?(otp|pin|cvv|password|ओटीपी|पिन)|(otp|pin|cvv|ओटीपी|पिन)\W{1,4}(?:\S+\W{1,3}){0,4}?(share|bata\w*|बता\w*|batao|send|tell|daalo|डालें|दें|दीजिए)/gi
  let m
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 20), m.index)
    if (!NEGATION.test(before)) return true
  }
  return false
}

const T = (en, hi, cg) => ({ en, hi, cg })

// Each check: id, weight in log-odds (+ = more likely scam), and a reason shown to the user.
function collectSignals(text) {
  const s = []
  const add = (id, weight, reason) => s.push({ id, weight, reason })
  const domains = findDomains(text)
  const lower = text.toLowerCase()

  // ---------- signs of a scam ----------
  for (const d of domains) {
    if (/\.apk(\b|$)|\.apk\./i.test(d.full)) {
      add('apk_link', 3, T('Asks you to install an app (.apk) from a link.', 'लिंक से ऐप (.apk) इंस्टॉल करने को कहता है।', 'लिंक ले ऐप (.apk) डाले बर कहिथे।'))
      break
    }
  }
  const lookalike = domains.find((d) => !isOfficial(d.host) && !isShortener(d.host) && BRAND_WORDS.test(d.host))
  if (lookalike)
    add('lookalike_link', 3, T(`The link "${lookalike.host}" pretends to be official but is not an official website.`, `लिंक "${lookalike.host}" असली जैसा दिखता है, पर यह आधिकारिक वेबसाइट नहीं है।`, `लिंक "${lookalike.host}" असली कस दिखथे, फेर ए सरकारी/आधिकारिक वेबसाइट नो हे।`))
  else if (domains.some((d) => !isOfficial(d.host) && RISKY_TLD.test(d.host)))
    add('risky_link', 1.5, T('Contains a link on a cheap, unusual website address.', 'संदेश में एक संदिग्ध वेबसाइट का लिंक है।', 'संदेस म एक संदिग्ध वेबसाइट के लिंक हे।'))
  if (domains.some((d) => isShortener(d.host)))
    add('short_link', 1.2, T('Uses a shortened link that hides the real website.', 'छोटा किया गया लिंक असली वेबसाइट छिपाता है।', 'छोटे करे लिंक असली वेबसाइट ल लुकाथे।'))

  if (asksForSecret(text))
    add('asks_secret', 3, T('Asks you to share an OTP, PIN or CVV. Banks never ask for these.', 'OTP, पिन या CVV बताने को कहता है। बैंक कभी ये नहीं मांगता।', 'ओटीपी, पिन या CVV बताए बर कहिथे। बैंक कभू ए नइ मांगय।'))

  if (/(receive|get|lene|pane|पाने|प्राप्त|refund|cashback|कैशबैक|रिफंड)/i.test(text) && /(\bpin\b|पिन|scan|स्कैन|\bqr\b)/i.test(text))
    add('pin_to_receive', 3, T('Says to scan a QR or enter your PIN to RECEIVE money. A PIN only ever sends money.', 'पैसे पाने के लिए QR स्कैन या पिन डालने को कहता है। पिन से पैसे सिर्फ़ जाते हैं।', 'पैसा पाए बर QR स्कैन या पिन डारे बर कहिथे। पिन ले पैसा खाली जाथे।'))

  if (/anydesk|teamviewer|quick ?support|rustdesk|screen ?shar/i.test(text))
    add('remote_app', 3, T('Asks you to install a screen-sharing app (like AnyDesk).', 'स्क्रीन शेयर करने वाला ऐप (जैसे AnyDesk) डालने को कहता है।', 'स्क्रीन शेयर करइया ऐप (जइसे AnyDesk) डाले बर कहिथे।'))

  if (/(fee|charge|शुल्क|फीस|processing|deposit)/i.test(text) && /(prize|lottery|won|winner|lucky|refund|claim|इनाम|लॉटरी|जीत|job|loan|parcel|customs)/i.test(text))
    add('pay_to_claim', 2, T('Asks you to pay a fee to get a prize, refund, job, loan or parcel.', 'इनाम, रिफंड, नौकरी, लोन या पार्सल पाने के लिए फीस मांगता है।', 'इनाम, रिफंड, नौकरी, लोन या पार्सल पाए बर फीस मांगथे।'))

  if (/digital arrest|डिजिटल अरेस्ट|money laundering|\bcbi\b|\bed officer|narcotics|drugs|investigation|\bfreeze\b|frozen|जांच|जाँच|फ्रीज़?|\bfir\b|case (registered|darj|filed)|केस दर्ज/i.test(text))
    add('fake_authority', 2.5, T('Threatens you with police, CBI or "digital arrest". Officials never do this on calls or messages.', 'पुलिस, CBI या "डिजिटल अरेस्ट" का डर दिखाता है। अधिकारी फोन या मैसेज पर ऐसा नहीं करते।', 'पुलिस, CBI या "डिजिटल अरेस्ट" के डर देखाथे। अधिकारी फोन या मैसेज म अइसन नइ करय।'))

  if (/(new number|naya number|नया नंबर|phone (is )?(broken|lost|kho)|फोन खो)/i.test(text) && /(send|bhej|भेज|transfer|upi|rs\.?|₹|rupa)/i.test(text))
    add('family_emergency', 2.5, T('"New number, send money urgently" is a common trick. Call the person on their old number first.', '"नया नंबर है, जल्दी पैसे भेजो" एक आम ठगी है। पहले पुराने नंबर पर फोन करके पूछें।', '"नवा नंबर हे, जल्दी पैसा भेजव" एक आम ठगी आय। पहिली जुन्ना नंबर म फोन करके पूछव।'))

  if (/(telegram|guaranteed|double your money|daily income|earn (rs\.?|₹)?\s?\d|kamaye|कमाएं|कमाई|part[\s-]?time)/i.test(text) && /(earn|invest|join|kama|कमा|profit|return|job|commission)/i.test(text))
    add('easy_money', 1.5, T('Promises easy money or guaranteed returns.', 'आसान कमाई या पक्के मुनाफ़े का लालच देता है।', 'आसान कमाई या पक्का मुनाफा के लालच देथे।'))

  const threat = /(block|suspend|disconnect|deactivat|band ho|बंद हो|काट|arrest|warrant|police case|court case|legal action|illegal)/i.test(text)
  const urgent = /(today|tonight|immediately|urgent|within \d+ ?(hours|hrs|minutes)|in \d+ hours|turant|तुरंत|\baaj\b|आज|right now|abhi)/i.test(text)
  if (threat && urgent)
    add('threat_urgent', 1, T('Threatens a block, disconnection or arrest, and pushes you to act now.', 'ब्लॉक, कनेक्शन काटने या गिरफ़्तारी का डर दिखाकर तुरंत कुछ करने को कहता है।', 'बंद करे, कनेक्शन काटे या गिरफ़्तारी के डर देखा के तुरते कुछु करे बर कहिथे।'))

  const personalNumber = /(?:\+?91[\s-]?)?\b[6-9]\d{9}\b/.test(text)
  if (personalNumber && /(call|contact|whatsapp|संपर्क|कॉल|फोन|sampark)/i.test(text))
    add('personal_number', 1, T('Asks you to call or WhatsApp a personal mobile number, not an official helpline.', 'आधिकारिक हेल्पलाइन की जगह एक निजी मोबाइल नंबर पर कॉल या WhatsApp करने को कहता है।', 'सरकारी हेल्पलाइन के जगह एक निजी मोबाइल नंबर म कॉल या WhatsApp करे बर कहिथे।'))

  const strongScam = s.some((x) => x.weight >= 2)
  // Anything that asks for money, an OTP/PIN, an install, or links to an unknown site
  // must never be talked down by the "genuine" signals below.
  const risky =
    /\b(otp|pin|cvv|password)\b.{0,40}\b(required|needed|verify|share|enter|confirm)\b|\b(pay|payment|transfer|deposit|install|download)\b|भुगतान|इंस्टॉल|डाउनलोड|ऐप डाल/i.test(text) &&
    !/(do not|don't|never|not to)\s+share/i.test(text)
  const unknownLink = domains.some((d) => !isOfficial(d.host))

  // ---------- signs of a genuine message (only when nothing above is strong or risky) ----------
  if (!strongScam && !risky && !unknownLink) {
    if (/(never|do not|don't|dont|not to)\s+share|share\s+mat|किसी को (न|ना|मत)|never asks? for|kabhi nahi mang|कभी नहीं मांग/i.test(text))
      add('protective', -2.5, T('Warns you never to share your OTP, as genuine bank messages do.', 'OTP किसी को न बताने की चेतावनी देता है, जैसा असली बैंक संदेश करते हैं।', 'ओटीपी कोनो ल झन बताय के चेतावनी देथे, जइसे असली बैंक संदेस करथें।'))

    if (/(debited|credited|received|sent rs|withdrawn|निकाले|जमा|डेबिट|क्रेडिट|instalment|installment|premium .*received|auto-debited)/i.test(text) && /(a\/c|acct|account|xx\d|\*\d|ending|wallet|खाते|खाता)/i.test(text))
      add('transaction_alert', -2, T('Looks like a normal transaction alert: it informs you and asks for nothing.', 'यह एक सामान्य लेनदेन की सूचना लगती है: सिर्फ़ जानकारी देती है, कुछ नहीं मांगती।', 'ए एक सामान्य लेनदेन के सूचना लगथे: खाली जानकारी देथे, कुछु नइ मांगय।'))

    if (domains.length && domains.every((d) => isOfficial(d.host)))
      add('official_link', -1, T('Its only links are official websites.', 'इसके सभी लिंक आधिकारिक वेबसाइट के हैं।', 'एकर सबो लिंक आधिकारिक वेबसाइट के हें।'))

    if (/\b(1800|1860)[\s-]?\d{3}[\s-]?\d{3,4}\b|\b1947\b|\b1930\b/.test(text))
      add('official_helpline', -1, T('Gives an official toll-free helpline.', 'आधिकारिक टोल-फ्री हेल्पलाइन देता है।', 'आधिकारिक टोल-फ्री हेल्पलाइन देथे।'))

    // A bank/service-style notice (account, card ending, amount, or a sender tag like "-SBI")
    // that asks you to do nothing: no link, no number to call, no request.
    const asks = /\b(click|tap|call|contact|share|send|pay|install|download|update|verify|reply|scan|whatsapp|dial|join|sms)\b|क्लिक|कॉल|संपर्क|भेज|अपडेट|डाउनलोड|इंस्टॉल|भुगतान|लिंक|दबाएं|करें/i.test(text)
    const noticeShape = /\b(a\/c|acct|account|card|ending|xx\d+|rs\.?|inr)\b|\*\d{3,}|₹|-\s?[A-Z][A-Za-z ]{1,15}$|खाते|खाता|रु\./.test(text)
    const offerOrThreat = threat || /(scheme|yojana|योजना|offer|free|lottery|loan|prize|लोन|इनाम|ऑफर)/i.test(text)
    if (!domains.length && !personalNumber && !asks && noticeShape && !offerOrThreat)
      add('no_ask', -1.5, T('A routine account notice that asks you to do nothing: no link, no number, no request.', 'खाते की सामान्य सूचना जो कुछ करने को नहीं कहती: न लिंक, न नंबर, न कोई मांग।', 'खाता के सामान्य सूचना जउन कुछु करे बर नइ कहय: न लिंक, न नंबर, न कोनो मांग।'))
    else if (/(order|shipped|out for delivery|recharge|plan valid|bill .*generated|due date|pnr|appointment|booking|statement|emi|policy)/i.test(lower))
      add('service_notice', -0.8, T('Looks like a routine service notice (order, bill, booking or statement).', 'यह एक सामान्य सेवा सूचना (ऑर्डर, बिल, बुकिंग या स्टेटमेंट) लगती है।', 'ए एक सामान्य सेवा सूचना (ऑर्डर, बिल, बुकिंग या स्टेटमेंट) लगथे।'))
  }
  return s
}

const logit = (p) => Math.log(Math.max(1e-6, p) / Math.max(1e-6, 1 - p))
const sigmoid = (z) => 1 / (1 + Math.exp(-z))

// Combine the model's probability with the signals. The model's own decision threshold
// (e.g. 0.38) is respected: the score is first re-centred so that threshold maps to 0.5.
// Returns the final probability (scam if >= 0.5) and the signals used.
export function applyRiskSignals(text, modelProbability, threshold = 0.5) {
  const signals = collectSignals(text)
  const centred = Math.max(-6, Math.min(6, logit(modelProbability) - logit(threshold)))
  const up = signals.filter((x) => x.weight > 0).reduce((a, x) => a + x.weight, 0)
  const down = Math.max(-3, signals.filter((x) => x.weight < 0).reduce((a, x) => a + x.weight, 0))
  const z = centred + up + down
  return { probability: sigmoid(z), signals }
}
