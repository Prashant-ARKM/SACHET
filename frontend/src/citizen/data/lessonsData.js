// 4 Visual Lessons for first-time phone users: OTP, ATM PIN, UPI PIN, QR Code
export const LESSONS = [
  {
    id: 'otp',
    num: 1,
    title: {
      hi: 'OTP किसी को भी न बताएं',
      cg: 'ओटीपी कोनो ल झन बतावव',
      en: 'Never Share Your OTP',
    },
    tagline: {
      hi: 'बैंक कभी फोन करके OTP नहीं मांगता',
      cg: 'बैंक कभू फोन करके ओटीपी नइ मांगे',
      en: 'Banks will NEVER call asking for OTP',
    },
    accent: '#B3261E',
    bgColor: '#FBE3DF',
    badge: 'पहला नियम (Rule 1)',
    audioScript: {
      hi: 'नमस्ते संगवारी! ध्यान से सुनो — OTP यानी वन टाइम पासवर्ड आपके बैंक की चाबी है। अगर कोई खुद को बैंक मैनेजर, बिजली अधिकारी या पुलिस बताकर आपसे OTP मांगे, तो कभी मत बताओ। OTP बताते ही आपका पूरा खाता खाली हो सकता है।',
      cg: 'जोहार संगवारी! कान लगा के सुनव — ओटीपी मतलब तुंहर बैंक खाता के सांचो ताला चाभी आय। कोनो घलो फोन करके कहे कि मैं बैंक मैनेजर या बिजली वाला बोलत हंव, ओटीपी बताओ — कभू झन बताहू! ओटीपी बताए ले खाता पूरा साफ़ हो जही।',
      en: 'Listen carefully: An OTP is your personal digital key. No bank officer, police, or electricity board will ever call asking for your OTP. Sharing your OTP will instantly empty your bank account.',
    },
    dos: [
      { hi: 'OTP केवल खुद खरीदारी करते समय अपने फोन में टाइप करें', cg: 'ओटीपी ल खाली अपन हाथ ले फोन म लिखव' },
      { hi: 'संदेश में लिखी राशि और दुकान का नाम ज़रूर पढ़ें', cg: 'मैसेज म लिखे पैसा अउ दुकान के नाव ल जरूर पढ़व' },
    ],
    donts: [
      { hi: 'फोन पर किसी को भी OTP बोलकर न बताएं', cg: 'फोन म कोनो ल ओटीपी बोल के झन बतावव' },
      { hi: 'लॉटरी, बिजली बिल या KYC के नाम पर आने वाले OTP किसी को न दें', cg: 'लॉटरी या बिजली बिल वाले ल ओटीपी झन देवा' },
    ],
    goldenRule: {
      hi: 'गोल्डन नियम: अगर कोई OTP मांग रहा है, तो वह 100% ठग है!',
      cg: 'पक्का नियम: जे ओटीपी मांगत हे, वो पूरा ठग आय!',
      en: 'Golden Rule: Anyone asking for your OTP is 100% a fraudster.',
    },
  },

  {
    id: 'atm_pin',
    num: 2,
    title: {
      hi: 'ATM पिन हमेशा छुपा कर रखें',
      cg: 'एटीएम पिन ल लुका के रखव',
      en: 'Always Conceal Your ATM PIN',
    },
    tagline: {
      hi: 'पिन सिर्फ आपके दिमाग में होना चाहिए, कागज़ पर नहीं',
      cg: 'पिन खाली तुंहर दिमाग म रहे, कोनो कागज़ म नइ',
      en: 'PIN belongs only in your mind, never on paper',
    },
    accent: '#9A5B00',
    bgColor: '#FCEFD2',
    badge: 'दूसरा नियम (Rule 2)',
    audioScript: {
      hi: 'ATM मशीन में पैसे निकालते समय हमेशा दूसरे हाथ से कीपैड को छुपाएं। कभी भी अपने ATM कार्ड के पीछे पिन न लिखें और न ही किसी अजनबी को पैसे निकालने के लिए कार्ड दें। वे पलक झपकते ही आपका कार्ड बदल सकते हैं।',
      cg: 'एटीएम ले पैसा निकाले के टेम दूसरा हाथ ले कीपैड ल झांक के रखव। कार्ड के पाछू कभू पिन झन लिखहू। कोनो अनजान मनखे ल कार्ड देके पैसा मत निकलावा, वो मन कार्ड बदल देथें।',
      en: 'When withdrawing cash, always cover the keypad with your free hand. Never write your PIN behind the card, and never hand your card to a stranger for help.',
    },
    dos: [
      { hi: 'पिन डालते समय कीपैड को हाथ या पर्स से ढँकें', cg: 'पिन डाबर टेम कीपैड ल हाथ ले तोपव' },
      { hi: 'मशीन में कार्ड का स्लॉट हिलाकर देखें कि कोई चिप तो नहीं लगी', cg: 'एटीएम मशीन म कार्ड डारे के जगा ल हिला के देखव' },
    ],
    donts: [
      { hi: 'ATM कार्ड पर या डायरी में पिन कभी न लिखें', cg: 'कार्ड के ऊपर पिन कभू मत लिखव' },
      { hi: 'मदद के बहाने किसी अजनबी को अपना कार्ड न सौंपें', cg: 'मदद के नाव म अनजान ल कार्ड झन थमावव' },
    ],
    goldenRule: {
      hi: 'गोल्डन नियम: एटीएम में अकेले जाएं, मदद के लिए किसी अजनबी को कार्ड न दें।',
      cg: 'पक्का नियम: एटीएम म एक्के झन जावव, अनजान ले मदद झन मांगव।',
      en: 'Golden Rule: Never give your card to strangers under the pretext of help.',
    },
  },

  {
    id: 'upi_pin',
    num: 3,
    title: {
      hi: 'पैसे पाने के लिए पिन नहीं लगता!',
      cg: 'पैसा पाए बर पिन नइ लागे!',
      en: 'Entering UPI PIN = SENDING Money',
    },
    tagline: {
      hi: 'पिन डालने का मतलब है आपके खाते से पैसे कटना',
      cg: 'पिन दबाए के मतलब हे तुंहर खाता ले पैसा कट जही',
      en: 'Entering PIN means money leaves YOUR account',
    },
    accent: '#B3261E',
    bgColor: '#FBE3DF',
    badge: 'सबसे बड़ा धोखा (Biggest Trap)',
    audioScript: {
      hi: 'यह भारत का सबसे बड़ा फ्रॉड है — ठग कहते हैं कि हम आपको 5000 रुपये भेज रहे हैं, अपना UPI पिन डालिए। याद रखिए, पैसे पाने के लिए कभी भी पिन नहीं डालना होता! पिन सिर्फ तभी डाला जाता है जब आप किसी को पैसे भेज रहे हों।',
      cg: 'ए सबले बड़े ठगी आय संगवारी — ठग मन कहिथें कि हम तुंहर खाता म 5000 रुपया भेजत हन, अपन यूपीआई पिन डारव। सुरता रखव, पैसा पाए बर कभू पिन नइ लगे! पिन खाली तब लगे जब तुमन कोनो ल पैसा भेजत हव।',
      en: 'This is India’s biggest scam: fraudsters claim "I am sending money, enter your UPI PIN to accept". Remember: You NEVER need a PIN to receive money. PIN is ONLY used to transfer money away!',
    },
    dos: [
      { hi: 'पैसे प्राप्त करते समय केवल अपना बैंक SMS या बैलेंस चेक करें', cg: 'पैसा आए हे त खाली बैंक बैलेंस चेक करव' },
      { hi: 'जब भी पिन का स्क्रीन आए, तुरंत रुकें और सोचें — क्या मैं पैसे भेज रहा हूँ?', cg: 'पिन मांगे त सोचव — का मैं पैसा भेजत हंव?' },
    ],
    donts: [
      { hi: 'इनाम, लॉटरी या रिफंड पाने के लिए कभी भी UPI पिन न डालें', cg: 'इनाम पाए बर कभू यूपीआई पिन झन डारव' },
      { hi: 'फोनपे/गूगलपे पर आए किसी अनचाहे "Pay" या "Request" पर क्लिक न करें', cg: 'कोनो अनजान "Pay" या "Request" ल झन दबावा' },
    ],
    goldenRule: {
      hi: 'गोल्डन नियम: पिन दबाया तो पैसे गए! पैसे लेने के लिए सिर्फ मोबाइल नंबर या QR काफी है।',
      cg: 'पक्का नियम: पिन दबाइस त पैसा गे! पैसा लेहे बर पिन के जरूरत नइये।',
      en: 'Golden Rule: Enter PIN = Money OUT. Receiving money NEVER asks for a PIN.',
    },
  },

  {
    id: 'qr',
    num: 4,
    title: {
      hi: 'QR स्कैन का मतलब: पैसे भेजना',
      cg: 'क्यूआर स्कैन मतलब पैसा भेजना',
      en: 'Scanning QR = Paying Money',
    },
    tagline: {
      hi: 'इनाम या लॉटरी पाने के लिए QR स्कैन न करें',
      cg: 'इनाम पाए बर कभू क्यूआर स्कैन झन करव',
      en: 'Never scan a QR code to claim rewards or prizes',
    },
    accent: '#1F4D33',
    bgColor: '#DDEEE2',
    badge: 'चौथा नियम (Rule 4)',
    audioScript: {
      hi: 'ठग अक्सर WhatsApp पर एक QR कोड भेजते हैं और कहते हैं कि इसे स्कैन करो और 2000 रुपये पाओ। जैसे ही आप कैमरे से QR स्कैन करके पिन दबाते हैं, आपके खाते से 2000 कट जाते हैं। QR कोड सिर्फ दुकान पर पैसे देने के लिए होता है, लेने के लिए नहीं।',
      cg: 'ठग मन WhatsApp म क्यूआर कोड भेजथें अउ कहिथें कि एला स्कैन करव त 2000 रुपया मिलही। जइसे ही तुमन स्कैन करके पिन दबाहू, तुंहर खाता ले 2000 कट जही। क्यूआर कोड खाली दुकान म पैसा देहे बर होथे, पाए बर नइ।',
      en: 'Scammers send a QR code on WhatsApp saying "Scan this to claim ₹2,000". The moment you scan and type PIN, ₹2,000 is deducted from your balance. QR is exclusively for sending payments!',
    },
    dos: [
      { hi: 'दुकानदार का QR कोड सिर्फ सामान खरीदते समय पैसे देने के लिए स्कैन करें', cg: 'दुकानदार के क्यूआर खाली सामान खरीदे के टेम स्कैन करव' },
      { hi: 'स्कैन करने के बाद स्क्रीन पर दिखने वाला नाम ज़रूर जांचें', cg: 'स्कैन करे के बाद स्क्रीन म दुकानदार के नाव जरूर पढ़व' },
    ],
    donts: [
      { hi: 'किसी अजनबी के भेजे गए QR कोड को पैसे पाने के लिए स्कैन न करें', cg: 'कोनो अनजान के भेजे क्यूआर कोड ल पैसा पाए बर स्कैन मत करव' },
      { hi: 'पुराना सामान (OLX/Facebook) बेचते समय खरीदार का भेजा QR स्कैन न करें', cg: 'सामान बेचे के टेम खरीददार के भेजे क्यूआर ल कभू स्कैन मत करव' },
    ],
    goldenRule: {
      hi: 'गोल्डन नियम: QR कोड से पैसे आते नहीं, हमेशा पैसे जाते हैं।',
      cg: 'पक्का नियम: क्यूआर कोड ले पैसा आवत नइये, हमेशा पैसा जाथे।',
      en: 'Golden Rule: Scanning a QR code sends money. It never deposits money.',
    },
  },
]

// 4 Interactive Quiz Questions to calculate Digital Financial Literacy Score
export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: {
      hi: 'एक व्यक्ति फोन करके कहता है: "मैं SBI बैंक से बोल रहा हूँ, आपका खाता बंद हो रहा है, तुरंत OTP बताएं।" आपको क्या करना चाहिए?',
      cg: 'कोनो फोन करके कहिथे: "मैं बैंक ले बोलत हंव, खाता बंद होवत हे, ओटीपी बतावा।" का करना चाही?',
      en: 'A caller claims: "I am calling from SBI, your account is expiring, share your OTP immediately." What should you do?',
    },
    options: [
      {
        text: { hi: 'तुरंत फोन काट दें और किसी को OTP न बताएं', cg: 'तुरते फोन काट देवव अउ कोनो ल ओटीपी झन देवा', en: 'Cut the call immediately and never share OTP' },
        correct: true,
      },
      {
        text: { hi: 'खाता बचाने के लिए OTP बता दें', cg: 'खाता बचाए बर ओटीपी बता देवव', en: 'Share OTP to keep account active' },
        correct: false,
      },
      {
        text: { hi: 'पड़ोसी से पूछकर बताएं', cg: 'पड़ोसी ले पूछ के बताहू', en: 'Ask neighbor and then share' },
        correct: false,
      },
    ],
    explanation: {
      hi: 'सही! बैंक कभी भी फोन पर OTP नहीं मांगता। फोन काटने पर ही आपका पैसा सुरक्षित रहेगा।',
      cg: 'सहीं जवाब! बैंक कभू फोन म ओटीपी नइ मांगे। फोन काटे म ही पैसा बांचही।',
      en: 'Correct! Banks never ask for OTP over a phone call.',
    },
  },

  {
    id: 'q2',
    question: {
      hi: 'किसी ने WhatsApp पर संदेश भेजा: "आपको ₹5,000 की लॉटरी मिली है। पैसे पाने के लिए इस QR कोड को स्कैन करके UPI पिन डालें।"',
      cg: 'कोनो WhatsApp म कहिस: "तुमन 5,000 के लॉटरी जीते हव। पैसा पाए बर क्यूआर कोड स्कैन करके पिन डारव।" का करहू?',
      en: 'You receive a WhatsApp message: "You won ₹5,000 lottery! Scan this QR code and enter UPI PIN to receive money."',
    },
    options: [
      {
        text: { hi: 'यह फ्रॉड है! पैसे पाने के लिए कभी पिन नहीं डालना होता', cg: 'ए पूरा ठगी आय! पैसा पाए बर कभू पिन नइ लागे', en: 'It is a scam! You never need a PIN to receive money' },
        correct: true,
      },
      {
        text: { hi: 'QR कोड स्कैन करके जल्दी पिन डाल देंगे ताकि पैसे मिल जाएं', cg: 'तुरते स्कैन करके पिन डारबो ताकि पैसा मिल जाय', en: 'Scan QR and enter PIN to get ₹5,000' },
        correct: false,
      },
      {
        text: { hi: 'अपने दोस्त को भेज देंगे कि वह निकाल ले', cg: 'संगवारी ल भेज देबो कि वो निकाल ले', en: 'Forward it to friend to withdraw' },
        correct: false,
      },
    ],
    explanation: {
      hi: 'बिल्कुल सही! UPI पिन केवल पैसे भेजने के लिए होता है। पैसे आने के लिए कोई पिन नहीं लगता।',
      cg: 'सांचो! यूपीआई पिन खाली पैसा भेजे बर होथे, पैसा पाए बर कभू पिन नइ लागे।',
      en: 'Spot on! UPI PIN is solely for paying out. Receiving funds never requires a PIN.',
    },
  },

  {
    id: 'q3',
    question: {
      hi: 'यदि किसी धोखाधड़ी में आपके बैंक खाते से पैसे कट जाएं, तो सबसे पहला कदम क्या होना चाहिए?',
      cg: 'अगर कोनो ठगी म तुंहर खाता ले पैसा कट जाय, त सबले पहिला का करना चाही?',
      en: 'If money gets fraudulently deducted from your bank account, what is the very first step?',
    },
    options: [
      {
        text: { hi: 'तुरंत हेल्पलाइन 1930 पर कॉल करें (गोल्डन ऑवर में खाता फ़्रीज़ कराने)', cg: 'तुरते 1930 म फोन लगावा (खाता फ़्रीज़ करवाए बर)', en: 'Call helpline 1930 immediately to freeze the scammer’s account' },
        correct: true,
      },
      {
        text: { hi: 'कल सुबह बैंक खुलने का इंतज़ार करेंगे', cg: 'बिहनिया बैंक खुले के अगोरा करबो', en: 'Wait until tomorrow morning when bank opens' },
        correct: false,
      },
      {
        text: { hi: 'धोखेबाज़ को दोबारा फोन करके पैसे लौटाने की विनती करेंगे', cg: 'ठग ल फोन लगा के पैसा मांगे बर रोबो', en: 'Call back the scammer pleading for money back' },
        correct: false,
      },
    ],
    explanation: {
      hi: 'शाबाश! घटना के पहले 2 घंटे (गोल्डन ऑवर) में 1930 डायल करने से ठगों का खाता तत्काल सील हो सकता है।',
      cg: 'बने जवाब! पहिला 2 घंटा म 1930 म फोन करे ले ठग के खाता सील हो सकत हे।',
      en: 'Correct! Dialing 1930 in the Golden Hour enables the national portal to freeze accounts.',
    },
  },

  {
    id: 'q4',
    question: {
      hi: 'ATM मशीन में पैसे निकालते समय सबसे सुरक्षित तरीका क्या है?',
      cg: 'एटीएम मशीन म पैसा निकाले के सबले सुरक्षित तरीका का आय?',
      en: 'What is the safest way to withdraw money at an ATM?',
    },
    options: [
      {
        text: { hi: 'पिन डालते समय दूसरे हाथ से कीपैड को छुपा कर ढँकना', cg: 'पिन डारे के टेम दूसरा हाथ ले कीपैड ल तोपना', en: 'Concealing the keypad with your free hand while entering PIN' },
        correct: true,
      },
      {
        text: { hi: 'पास खड़े किसी अजनबी को पिन बताकर पैसे निकालने को कहना', cg: 'कोनो अनजान ल पिन बता के पैसा निकाले बर कहना', en: 'Asking a bystander stranger to type PIN' },
        correct: false,
      },
      {
        text: { hi: 'पिन को ज़ोर से बोलकर टाइप करना', cg: 'पिन ल जोर से बोल के टाइप करना', en: 'Reading out PIN aloud while typing' },
        correct: false,
      },
    ],
    explanation: {
      hi: 'सही! हाथ से कीपैड छुपाने से छिपे हुए कैमरे या पास खड़े व्यक्ति को आपका गुप्त पिन नहीं दिखता।',
      cg: 'सहीं! हाथ ले तोपे म कैमरा या कोनो मनखे तुंहर पिन ल देख नइ सके।',
      en: 'Correct! Covering the keypad prevents hidden skimmer cameras and shoulder-surfers.',
    },
  },
]

