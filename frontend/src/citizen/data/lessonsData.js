// 4 Visual Lessons for first-time phone users: OTP, ATM PIN, UPI PIN, QR Code
export const LESSONS = [
  {
    id: 'otp',
    num: 1,
    title: {
      en: 'Never Share Your OTP',
      hi: 'OTP किसी को भी न बताएं',
      cg: 'ओटीपी कोनो ल झन बतावव',
    },
    tagline: {
      en: 'Banks will NEVER call asking for OTP',
      hi: 'बैंक कभी फोन करके OTP नहीं मांगता',
      cg: 'बैंक कभू फोन करके ओटीपी नइ मांगे',
    },
    accent: '#B3261E',
    bgColor: '#FBE3DF',
    badge: {
      en: 'Rule 1',
      hi: 'पहला नियम',
      cg: 'पहिला नियम',
    },
    audioScript: {
      en: 'Listen carefully: An OTP is your personal digital key. No bank officer, police, or electricity board will ever call asking for your OTP. Sharing your OTP will instantly empty your bank account.',
      hi: 'नमस्ते संगवारी! ध्यान से सुनो — OTP यानी वन टाइम पासवर्ड आपके बैंक की चाबी है। अगर कोई खुद को बैंक मैनेजर, बिजली अधिकारी या पुलिस बताकर आपसे OTP मांगे, तो कभी मत बताओ। OTP बताते ही आपका पूरा खाता खाली हो सकता है।',
      cg: 'जोहार संगवारी! कान लगा के सुनव — ओटीपी मतलब तुंहर बैंक खाता के सांचो ताला चाभी आय। कोनो घलो फोन करके कहे कि मैं बैंक मैनेजर या बिजली वाला बोलत हंव, ओटीपी बताओ — कभू झन बताहू! ओटीपी बताए ले खाता पूरा साफ़ हो जही।',
    },
    dos: [
      {
        en: 'Only type OTP yourself on trusted shopping checkout screens',
        hi: 'OTP केवल खुद खरीदारी करते समय अपने फोन में टाइप करें',
        cg: 'ओटीपी ल खाली अपन हाथ ले फोन म लिखव',
      },
      {
        en: 'Always check the amount and merchant name in the SMS',
        hi: 'संदेश में लिखी राशि और दुकान का नाम ज़रूर पढ़ें',
        cg: 'मैसेज म लिखे पैसा अउ दुकान के नाव ल जरूर पढ़व',
      },
    ],
    donts: [
      {
        en: 'Never speak or share OTP over any phone call',
        hi: 'फोन पर किसी को भी OTP बोलकर न बताएं',
        cg: 'फोन म कोनो ल ओटीपी बोल के झन बतावव',
      },
      {
        en: 'Never share OTP for lottery, power bill or KYC updates',
        hi: 'लॉटरी, बिजली बिल या KYC के नाम पर आने वाले OTP किसी को न दें',
        cg: 'लॉटरी या बिजली बिल वाले ल ओटीपी झन देवा',
      },
    ],
    goldenRule: {
      en: 'Golden Rule: Anyone asking for your OTP is 100% a fraudster.',
      hi: 'गोल्डन नियम: अगर कोई OTP मांग रहा है, तो वह 100% ठग है!',
      cg: 'पक्का नियम: जे ओटीपी मांगत हे, वो पूरा ठग आय!',
    },
  },

  {
    id: 'atm_pin',
    num: 2,
    title: {
      en: 'Always Conceal Your ATM PIN',
      hi: 'ATM पिन हमेशा छुपा कर रखें',
      cg: 'एटीएम पिन ल लुका के रखव',
    },
    tagline: {
      en: 'PIN belongs only in your mind, never on paper',
      hi: 'पिन सिर्फ आपके दिमाग में होना चाहिए, कागज़ पर नहीं',
      cg: 'पिन खाली तुंहर दिमाग म रहे, कोनो कागज़ म नइ',
    },
    accent: '#9A5B00',
    bgColor: '#FCEFD2',
    badge: {
      en: 'Rule 2',
      hi: 'दूसरा नियम',
      cg: 'दूसरा नियम',
    },
    audioScript: {
      en: 'When withdrawing cash, always cover the keypad with your free hand. Never write your PIN behind the card, and never hand your card to a stranger for help.',
      hi: 'ATM मशीन में पैसे निकालते समय हमेशा दूसरे हाथ से कीपैड को छुपाएं। कभी भी अपने ATM कार्ड के पीछे पिन न लिखें और न ही किसी अजनबी को पैसे निकालने के लिए कार्ड दें। वे पलक झपकते ही आपका कार्ड बदल सकते हैं।',
      cg: 'एटीएम ले पैसा निकाले के टेम दूसरा हाथ ले कीपैड ल झांक के रखव। कार्ड के पाछू कभू पिन झन लिखहू। कोनो अनजान मनखे ल कार्ड देके पैसा मत निकलावा, वो मन कार्ड बदल देथें।',
    },
    dos: [
      {
        en: 'Shield the keypad with your free hand while typing PIN',
        hi: 'पिन डालते समय कीपैड को हाथ या पर्स से ढँकें',
        cg: 'पिन डाबर टेम कीपैड ल हाथ ले तोपव',
      },
      {
        en: 'Inspect the card slot for any loose skimmer attachments',
        hi: 'मशीन में कार्ड का स्लॉट हिलाकर देखें कि कोई चिप तो नहीं लगी',
        cg: 'एटीएम मशीन म कार्ड डारे के जगा ल हिला के देखव',
      },
    ],
    donts: [
      {
        en: 'Never write your PIN on your card or in a diary',
        hi: 'ATM कार्ड पर या डायरी में पिन कभी न लिखें',
        cg: 'कार्ड के ऊपर पिन कभू मत लिखव',
      },
      {
        en: 'Never hand your ATM card to strangers offering help',
        hi: 'मदद के बहाने किसी अजनबी को अपना कार्ड न सौंपें',
        cg: 'मदद के नाव म अनजान ल कार्ड झन थमावव',
      },
    ],
    goldenRule: {
      en: 'Golden Rule: Never give your card to strangers under the pretext of help.',
      hi: 'गोल्डन नियम: एटीएम में अकेले जाएं, मदद के लिए किसी अजनबी को कार्ड न दें।',
      cg: 'पक्का नियम: एटीएम म एक्के झन जावव, अनजान ले मदद झन मांगव।',
    },
  },

  {
    id: 'upi_pin',
    num: 3,
    title: {
      en: 'Entering UPI PIN = SENDING Money',
      hi: 'पैसे पाने के लिए पिन नहीं लगता!',
      cg: 'पैसा पाए बर पिन नइ लागे!',
    },
    tagline: {
      en: 'Entering PIN means money leaves YOUR account',
      hi: 'पिन डालने का मतलब है आपके खाते से पैसे कटना',
      cg: 'पिन दबाए के मतलब हे तुंहर खाता ले पैसा कट जही',
    },
    accent: '#B3261E',
    bgColor: '#FBE3DF',
    badge: {
      en: 'Trap Alert',
      hi: 'बड़ा जाल',
      cg: 'बड़े ठगी',
    },
    audioScript: {
      en: 'This is India’s biggest scam: fraudsters claim "I am sending money, enter your UPI PIN to accept". Remember: You NEVER need a PIN to receive money. PIN is ONLY used to transfer money away!',
      hi: 'यह भारत का सबसे बड़ा फ्रॉड है — ठग कहते हैं कि हम आपको 5000 रुपये भेज रहे हैं, अपना UPI पिन डालिए। याद रखिए, पैसे पाने के लिए कभी भी पिन नहीं डालना होता! पिन सिर्फ तभी डाला जाता है जब आप किसी को पैसे भेज रहे हों।',
      cg: 'ए सबले बड़े ठगी आय संगवारी — ठग मन कहिथें कि हम तुंहर खाता म 5000 रुपया भेजत हन, अपन यूपीआई पिन डारव। सुरता रखव, पैसा पाए बर कभू पिन नइ लगे! पिन खाली तब लगे जब तुमन कोनो ल पैसा भेजत हव।',
    },
    dos: [
      {
        en: 'To confirm received funds, simply check your bank balance',
        hi: 'पैसे प्राप्त करते समय केवल अपना बैंक SMS या बैलेंस चेक करें',
        cg: 'पैसा आए हे त खाली बैंक बैलेंस चेक करव',
      },
      {
        en: 'When PIN screen appears, pause: entering PIN sends money away',
        hi: 'जब भी पिन का स्क्रीन आए, तुरंत रुकें और सोचें — क्या मैं पैसे भेज रहा हूँ?',
        cg: 'पिन मांगे त सोचव — का मैं पैसा भेजत हंव?',
      },
    ],
    donts: [
      {
        en: 'Never enter UPI PIN to receive cashbacks, refunds or lottery',
        hi: 'इनाम, लॉटरी या रिफंड पाने के लिए कभी भी UPI पिन न डालें',
        cg: 'इनाम पाए बर कभू यूपीआई पिन झन डारव',
      },
      {
        en: 'Never approve unexpected collect requests on payment apps',
        hi: 'फोनपे/गूगलपे पर आए किसी अनचाहे "Pay" या "Request" पर क्लिक न करें',
        cg: 'कोनो अनजान "Pay" या "Request" ल झन दबावा',
      },
    ],
    goldenRule: {
      en: 'Golden Rule: Enter PIN = Money OUT. Receiving money NEVER asks for a PIN.',
      hi: 'गोल्डन नियम: पिन दबाया तो पैसे गए! पैसे लेने के लिए सिर्फ मोबाइल नंबर या QR काफी है।',
      cg: 'पक्का नियम: पिन दबाइस त पैसा गे! पैसा लेहे बर पिन के जरूरत नइये।',
    },
  },

  {
    id: 'qr',
    num: 4,
    title: {
      en: 'Scanning QR = Paying Money',
      hi: 'QR स्कैन का मतलब: पैसे भेजना',
      cg: 'क्यूआर स्कैन मतलब पैसा भेजना',
    },
    tagline: {
      en: 'Never scan a QR code to claim rewards or prizes',
      hi: 'इनाम या लॉटरी पाने के लिए QR स्कैन न करें',
      cg: 'इनाम पाए बर कभू क्यूआर स्कैन झन करव',
    },
    accent: '#1F4D33',
    bgColor: '#DDEEE2',
    badge: {
      en: 'Rule 4',
      hi: 'चौथा नियम',
      cg: 'चौथा नियम',
    },
    audioScript: {
      en: 'Scammers send a QR code on WhatsApp saying "Scan this to claim ₹2,000". The moment you scan and type PIN, ₹2,000 is deducted from your balance. QR is exclusively for sending payments!',
      hi: 'ठग अक्सर WhatsApp पर एक QR कोड भेजते हैं और कहते हैं कि इसे स्कैन करो और 2000 रुपये पाओ। जैसे ही आप कैमरे से QR स्कैन करके पिन दबाते हैं, आपके खाते से 2000 कट जाते हैं। QR कोड सिर्फ दुकान पर पैसे देने के लिए होता है, लेने के लिए नहीं।',
      cg: 'ठग मन WhatsApp म क्यूआर कोड भेजथें अउ कहिथें कि एला स्कैन करव त 2000 रुपया मिलही। जइसे ही तुमन स्कैन करके पिन दबाहू, तुंहर खाता ले 2000 कट जही। क्यूआर कोड खाली दुकान म पैसा देहे बर होथे, पाए बर नइ।',
    },
    dos: [
      {
        en: 'Only scan QR codes at merchants to send payments for purchases',
        hi: 'दुकानदार का QR कोड सिर्फ सामान खरीदते समय पैसे देने के लिए स्कैन करें',
        cg: 'दुकानदार के क्यूआर खाली सामान खरीदे के टेम स्कैन करव',
      },
      {
        en: 'Always verify the merchant name displayed after scanning',
        hi: 'स्कैन करने के बाद स्क्रीन पर दिखने वाला नाम ज़रूर जांचें',
        cg: 'स्कैन करे के बाद स्क्रीन म दुकानदार के नाव जरूर पढ़व',
      },
    ],
    donts: [
      {
        en: 'Never scan QR codes sent by strangers promising cash deposits',
        hi: 'किसी अजनबी के भेजे गए QR कोड को पैसे पाने के लिए स्कैन न करें',
        cg: 'कोनो अनजान के भेजे क्यूआर कोड ल पैसा पाए बर स्कैन मत करव',
      },
      {
        en: 'Never scan buyer QR codes when selling items online',
        hi: 'पुराना सामान (OLX/Facebook) बेचते समय खरीदार का भेजा QR स्कैन न करें',
        cg: 'सामान बेचे के टेम खरीददार के भेजे क्यूआर ल कभू स्कैन मत करव',
      },
    ],
    goldenRule: {
      en: 'Golden Rule: Scanning a QR code sends money. It never deposits money.',
      hi: 'गोल्डन नियम: QR कोड से पैसे आते नहीं, हमेशा पैसे जाते हैं।',
      cg: 'पक्का नियम: क्यूआर कोड ले पैसा आवत नइये, हमेशा पैसा जाथे।',
    },
  },
]

// 4 Interactive Quiz Questions to calculate Digital Financial Literacy Score
export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: {
      en: 'A caller claims: "I am calling from SBI, your account is expiring, share your OTP immediately." What should you do?',
      hi: 'एक व्यक्ति फोन करके कहता है: "मैं SBI बैंक से बोल रहा हूँ, आपका खाता बंद हो रहा है, तुरंत OTP बताएं।" आपको क्या करना चाहिए?',
      cg: 'कोनो फोन करके कहिथे: "मैं बैंक ले बोलत हंव, खाता बंद होवत हे, ओटीपी बतावा।" का करना चाही?',
    },
    options: [
      {
        text: {
          en: 'Cut the call immediately and never share OTP',
          hi: 'तुरंत फोन काट दें और किसी को OTP न बताएं',
          cg: 'तुरते फोन काट देवव अउ कोनो ल ओटीपी झन देवा',
        },
        correct: true,
      },
      {
        text: {
          en: 'Share OTP to keep account active',
          hi: 'खाता बचाने के लिए OTP बता दें',
          cg: 'खाता बचाए बर ओटीपी बता देवव',
        },
        correct: false,
      },
      {
        text: {
          en: 'Ask neighbor and then share',
          hi: 'पड़ोसी से पूछकर बताएं',
          cg: 'पड़ोसी ले पूछ के बताहू',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Banks never ask for OTP over a phone call.',
      hi: 'बैंक कभी भी फोन पर OTP नहीं मांगता। फोन काटने पर ही आपका पैसा सुरक्षित रहेगा।',
      cg: 'बैंक कभू फोन म ओटीपी नइ मांगे। फोन काटे म ही पैसा बांचही।',
    },
  },

  {
    id: 'q2',
    question: {
      en: 'You receive a WhatsApp message: "You won ₹5,000 lottery! Scan this QR code and enter UPI PIN to receive money."',
      hi: 'किसी ने WhatsApp पर संदेश भेजा: "आपको ₹5,000 की लॉटरी मिली है। पैसे पाने के लिए इस QR कोड को स्कैन करके UPI पिन डालें।"',
      cg: 'कोनो WhatsApp म कहिस: "तुमन 5,000 के लॉटरी जीते हव। पैसा पाए बर क्यूआर कोड स्कैन करके पिन डारव।" का करहू?',
    },
    options: [
      {
        text: {
          en: 'It is a scam! You never need a PIN to receive money',
          hi: 'यह फ्रॉड है! पैसे पाने के लिए कभी पिन नहीं डालना होता',
          cg: 'ए पूरा ठगी आय! पैसा पाए बर कभू पिन नइ लागे',
        },
        correct: true,
      },
      {
        text: {
          en: 'Scan QR and enter PIN to get ₹5,000',
          hi: 'QR कोड स्कैन करके जल्दी पिन डाल देंगे ताकि पैसे मिल जाएं',
          cg: 'तुरते स्कैन करके पिन डारबो ताकि पैसा मिल जाय',
        },
        correct: false,
      },
      {
        text: {
          en: 'Forward it to friend to withdraw',
          hi: 'अपने दोस्त को भेज देंगे कि वह निकाल ले',
          cg: 'संगवारी ल भेज देबो कि वो निकाल ले',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'UPI PIN is solely for paying out. Receiving funds never requires a PIN.',
      hi: 'UPI पिन केवल पैसे भेजने के लिए होता है। पैसे आने के लिए कोई पिन नहीं लगता।',
      cg: 'यूपीआई पिन खाली पैसा भेजे बर होथे, पैसा पाए बर कभू पिन नइ लागे।',
    },
  },

  {
    id: 'q3',
    question: {
      en: 'If money gets fraudulently deducted from your bank account, what is the very first step?',
      hi: 'यदि किसी धोखाधड़ी में आपके बैंक खाते से पैसे कट जाएं, तो सबसे पहला कदम क्या होना चाहिए?',
      cg: 'अगर कोनो ठगी म तुंहर खाता ले पैसा कट जाय, त सबले पहिला का करना चाही?',
    },
    options: [
      {
        text: {
          en: 'Call helpline 1930 immediately to freeze the scammer’s account',
          hi: 'तुरंत हेल्पलाइन 1930 पर कॉल करें (गोल्डन ऑवर में खाता फ़्रीज़ कराने)',
          cg: 'तुरते 1930 म फोन लगावा (खाता फ़्रीज़ करवाए बर)',
        },
        correct: true,
      },
      {
        text: {
          en: 'Wait until tomorrow morning when bank opens',
          hi: 'कल सुबह बैंक खुलने का इंतज़ार करेंगे',
          cg: 'बिहनिया बैंक खुले के अगोरा करबो',
        },
        correct: false,
      },
      {
        text: {
          en: 'Call back the scammer pleading for money back',
          hi: 'धोखेबाज़ को दोबारा फोन करके पैसे लौटाने की विनती करेंगे',
          cg: 'ठग ल फोन लगा के पैसा मांगे बर रोबो',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Dialing 1930 in the Golden Hour enables the national portal to freeze accounts.',
      hi: 'घटना के पहले 2 घंटे (गोल्डन ऑवर) में 1930 डायल करने से ठगों का खाता तत्काल सील हो सकता है।',
      cg: 'पहिला 2 घंटा म 1930 म फोन करे ले ठग के खाता सील हो सकत हे।',
    },
  },

  {
    id: 'q4',
    question: {
      en: 'What is the safest way to withdraw money at an ATM?',
      hi: 'ATM मशीन में पैसे निकालते समय सबसे सुरक्षित तरीका क्या है?',
      cg: 'एटीएम मशीन म पैसा निकाले के सबले सुरक्षित तरीका का आय?',
    },
    options: [
      {
        text: {
          en: 'Concealing the keypad with your free hand while entering PIN',
          hi: 'पिन डालते समय दूसरे हाथ से कीपैड को छुपा कर ढँकना',
          cg: 'पिन डारे के टेम दूसरा हाथ ले कीपैड ल तोपना',
        },
        correct: true,
      },
      {
        text: {
          en: 'Asking a bystander stranger to type PIN',
          hi: 'पास खड़े किसी अजनबी को पिन बताकर पैसे निकालने को कहना',
          cg: 'कोनो अनजान ल पिन बता के पैसा निकाले बर कहना',
        },
        correct: false,
      },
      {
        text: {
          en: 'Reading out PIN aloud while typing',
          hi: 'पिन को ज़ोर से बोलकर टाइप करना',
          cg: 'पिन ल जोर से बोल के टाइप करना',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Covering the keypad prevents hidden skimmer cameras and shoulder-surfers.',
      hi: 'हाथ से कीपैड छुपाने से छिपे हुए कैमरे या पास खड़े व्यक्ति को आपका गुप्त पिन नहीं दिखता।',
      cg: 'हाथ ले तोपे म कैमरा या कोनो मनखे तुंहर पिन ल देख नइ सके।',
    },
  },

  {
    id: 'q5',
    question: {
      en: 'A video caller in police uniform says: "A parcel with drugs is in your name. You are under digital arrest. Stay on video and send money to clear your name." What should you do?',
      hi: 'वीडियो कॉल पर पुलिस वर्दी में एक व्यक्ति कहता है: "आपके नाम के पार्सल में ड्रग्स मिले हैं। आप डिजिटल अरेस्ट में हैं। वीडियो पर बने रहें और नाम साफ़ करने के लिए पैसे भेजें।" आपको क्या करना चाहिए?',
      cg: 'वीडियो कॉल म पुलिस के कपड़ा पहिरे मनखे कहिथे: "तुंहर नाव के पार्सल म ड्रग्स मिले हे। तुमन डिजिटल अरेस्ट म हव। वीडियो म बने रहव अउ पैसा भेजव।" का करना चाही?',
    },
    options: [
      {
        text: {
          en: 'Cut the call. "Digital arrest" does not exist. Report it on 1930 or Chakshu',
          hi: 'फोन काटें। "डिजिटल अरेस्ट" जैसा कुछ नहीं होता। 1930 या चक्षु पर शिकायत करें',
          cg: 'फोन काट देवव। "डिजिटल अरेस्ट" कुछु नइ होवय। 1930 या चक्षु म सिकायत करव',
        },
        correct: true,
      },
      {
        text: {
          en: 'Stay on the call and pay to avoid arrest',
          hi: 'गिरफ़्तारी से बचने के लिए कॉल पर रहें और पैसे भेज दें',
          cg: 'गिरफ़्तारी ले बांचे बर कॉल म रहव अउ पैसा भेज देवव',
        },
        correct: false,
      },
      {
        text: {
          en: 'Share your Aadhaar and bank details to prove you are innocent',
          hi: 'खुद को निर्दोष साबित करने के लिए आधार और बैंक की जानकारी दे दें',
          cg: 'अपन ल निर्दोष बताए बर आधार अउ बैंक के जानकारी दे देवव',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Police never arrest anyone over a video call, and never ask for money to "clear your name". This is a scam.',
      hi: 'पुलिस कभी वीडियो कॉल पर गिरफ़्तार नहीं करती और "नाम साफ़ करने" के लिए पैसे नहीं मांगती। यह ठगी है।',
      cg: 'पुलिस कभू वीडियो कॉल म गिरफ़्तार नइ करय अउ नाव साफ करे बर पैसा नइ मांगय। ए ठगी आय।',
    },
  },

  {
    id: 'q6',
    question: {
      en: 'An SMS says: "Your electricity will be cut tonight. Download this app to pay your bill: bit.ly/cseb-pay.apk". What should you do?',
      hi: 'SMS आता है: "आज रात आपकी बिजली कट जाएगी। बिल भरने के लिए यह ऐप डाउनलोड करें: bit.ly/cseb-pay.apk"। आपको क्या करना चाहिए?',
      cg: 'SMS आथे: "आज रात तुंहर बिजली कट जाही। बिल पटाए बर ए ऐप डाउनलोड करव: bit.ly/cseb-pay.apk"। का करना चाही?',
    },
    options: [
      {
        text: {
          en: 'Do not open the link. Pay only through the official app or office',
          hi: 'लिंक न खोलें। बिल केवल आधिकारिक ऐप या दफ़्तर से भरें',
          cg: 'लिंक झन खोलव। बिल खाली सरकारी ऐप या दफ़्तर ले पटावव',
        },
        correct: true,
      },
      {
        text: {
          en: 'Install the app quickly so the power is not cut',
          hi: 'बिजली न कटे, इसलिए ऐप जल्दी से इंस्टॉल कर लें',
          cg: 'बिजली झन कटय, तेकर सेती ऐप ल जल्दी डाल लेवव',
        },
        correct: false,
      },
      {
        text: {
          en: 'Call the number in the SMS and share your OTP',
          hi: 'SMS में दिए नंबर पर फोन करके OTP बता दें',
          cg: 'SMS के नंबर म फोन करके ओटीपी बता देवव',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Apps from SMS links (.apk files) can read your OTPs and empty your account. Use only official apps.',
      hi: 'SMS लिंक से डाउनलोड किए गए ऐप (.apk) आपके OTP पढ़कर खाता खाली कर सकते हैं। केवल आधिकारिक ऐप इस्तेमाल करें।',
      cg: 'SMS लिंक ले डाले ऐप (.apk) तुंहर ओटीपी पढ़ के खाता खाली कर सकथे। खाली सरकारी ऐप चलावव।',
    },
  },

  {
    id: 'q7',
    question: {
      en: '"Customer care" asks you to install AnyDesk or a screen-sharing app to fix a failed payment. What should you do?',
      hi: '"कस्टमर केयर" कहता है कि अटका हुआ पेमेंट ठीक करने के लिए AnyDesk या कोई स्क्रीन-शेयर ऐप डालें। आपको क्या करना चाहिए?',
      cg: '"कस्टमर केयर" कहिथे कि अटके पेमेंट ल ठीक करे बर AnyDesk या स्क्रीन-शेयर ऐप डालव। का करना चाही?',
    },
    options: [
      {
        text: {
          en: 'Refuse. Never let a stranger see or control your phone screen',
          hi: 'मना कर दें। किसी अनजान को अपने फोन की स्क्रीन न दिखाएं',
          cg: 'मना कर देवव। कोनो अनचिन्हार ल अपन फोन के स्क्रीन झन देखावव',
        },
        correct: true,
      },
      {
        text: {
          en: 'Install it, because they are from customer care',
          hi: 'इंस्टॉल कर लें, क्योंकि वे कस्टमर केयर से हैं',
          cg: 'डाल लेवव, काबर कि ओमन कस्टमर केयर ले हें',
        },
        correct: false,
      },
      {
        text: {
          en: 'Install it, but keep the call short',
          hi: 'इंस्टॉल करें, पर कॉल जल्दी खत्म करें',
          cg: 'डाल लेवव, फेर कॉल जल्दी खतम करव',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Screen-sharing apps let scammers watch you type your PIN and OTP. Real customer care never asks for this.',
      hi: 'स्क्रीन-शेयर ऐप से ठग आपका पिन और OTP देख लेते हैं। असली कस्टमर केयर ऐसा कभी नहीं कहता।',
      cg: 'स्क्रीन-शेयर ऐप ले ठग तुंहर पिन अउ ओटीपी देख लेथें। सच के कस्टमर केयर अइसन कभू नइ कहय।',
    },
  },

  {
    id: 'q8',
    question: {
      en: 'You got a suspicious call but did NOT lose any money. Where should you report it?',
      hi: 'आपको एक संदिग्ध कॉल आया, पर कोई पैसा नहीं कटा। इसकी शिकायत कहाँ करें?',
      cg: 'तुंहला एक संदिग्ध कॉल आइस, फेर पैसा नइ कटिस। एकर सिकायत कहाँ करव?',
    },
    options: [
      {
        text: {
          en: 'On Chakshu (Sanchar Saathi)',
          hi: 'संचार साथी पोर्टल पर चक्षु में',
          cg: 'संचार साथी म चक्षु म',
        },
        correct: true,
      },
      {
        text: {
          en: 'Nowhere. Nothing happened, so ignore it',
          hi: 'कहीं नहीं, कुछ हुआ ही नहीं तो छोड़ दें',
          cg: 'कहूँ नहीं, कुछु नइ होइस त छोड़ देवव',
        },
        correct: false,
      },
      {
        text: {
          en: 'Call the scammer back and argue',
          hi: 'ठग को वापस फोन करके बहस करें',
          cg: 'ठग ल फेर फोन करके बहस करव',
        },
        correct: false,
      },
    ],
    explanation: {
      en: 'Reporting on Chakshu helps block scam numbers before they cheat someone else. If money is lost, call 1930.',
      hi: 'चक्षु पर शिकायत से ठगों के नंबर बंद होते हैं, ताकि दूसरों के साथ ठगी न हो। पैसा कटे तो 1930 पर फोन करें।',
      cg: 'चक्षु म सिकायत करे ले ठग के नंबर बंद होथे, ताकि दूसर संग ठगी झन होय। पैसा कटे त 1930 म फोन करव।',
    },
  },
]
