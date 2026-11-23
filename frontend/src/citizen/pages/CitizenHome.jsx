import { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { getRecentChecks } from '../lib/citizenStorage.js'
import DistrictModal from '../components/DistrictModal.jsx'
import {
  AlertIcon,
  BookIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SearchIcon,
  LinkIcon,
  MegaphoneIcon,
  GraduationCapIcon,
  DocumentCheckIcon,
} from '../components/CitizenIcons.jsx'
import {
  ParliamentIllustration,
  PhoneAlertIllustration,
  LaptopShieldIllustration,
} from '../components/GovGraphics.jsx'

export default function CitizenHome() {
  const { district, setDistrict, lang, t, score } = useOutletContext()
  const [quickInput, setQuickInput] = useState('')
  const [recentChecks, setRecentChecks] = useState([])
  const [districtModalOpen, setDistrictModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setRecentChecks(getRecentChecks())
  }, [])

  const handleQuickCheck = (e) => {
    e?.preventDefault()
    if (!quickInput.trim()) return
    navigate('/citizen/check', { state: { prefillText: quickInput, autoCheck: true } })
  }

  const SAMPLE_ITEMS = [
    {
      label: { en: 'Fake Electricity Bill', hi: 'बिजली बिल फ्रॉड', cg: 'बिजली बिल ठगी' },
      text: 'प्रिय उपभोक्ता, आपके पिछले माह का बिजली बिल अपडेट नहीं हुआ है। आज रात 9:30 बजे आपका बिजली कनेक्शन काट दिया जाएगा। तुरंत हमारे बिजली अधिकारी श्री वर्मा से 9876543210 पर संपर्क करें या लिंक bit.ly/cseb-bill से अपडेट करें।',
    },
    {
      label: { en: 'Bank KYC Update', hi: 'बैंक KYC ब्लॉक', cg: 'बैंक KYC ब्लॉक' },
      text: 'प्रिय ग्राहक, आपका SBI Yono खाता आज रात ब्लॉक कर दिया जाएगा क्योंकि आपका पैन कार्ड और KYC अपडेट नहीं है। खाता चालू रखने के लिए तुरंत इस लिंक पर क्लिक करें: http://sbi-kyc-update-portal.online और अपना OTP सत्यापित करें।',
    },
    {
      label: { en: 'Lottery Prize', hi: 'लॉटरी QR कोड', cg: 'लॉटरी क्यूआर' },
      text: 'बधाई हो! आपको छत्तीसगढ़ राज्य लॉटरी योजना में ₹25,000 का नकद पुरस्कार मिला है। यह पैसा अपने बैंक खाते में तुरंत पाने के लिए नीचे दिए गए QR कोड को PhonePe / GPay से स्कैन करें और अपना 4 अंकों का UPI पिन दर्ज करें।',
    },
    {
      label: { en: 'Unknown APK', hi: 'संदिग्ध APK लिंक', cg: 'अज्ञात APK फाइल' },
      text: 'Dear user, your courier package could not be delivered due to wrong address. Download our delivery tracking app from http://speedpost-delivery-update.apk to reschedule.',
    },
  ]

  // Localized District alerts
  const DISTRICT_ALERTS = {
    Raipur: {
      en: 'Surge in fake electricity bill disconnection SMS and APK malware links in Raipur. Do not click on unknown links.',
      hi: 'रायपुर में बिजली बिल कटने के नाम पर फर्जी APK फाइल भेजने वाले मामलों में वृद्धि। अनजान लिंक पर क्लिक न करें।',
      cg: 'रायपुर म बिजली बिल कटे के नाव म फर्जी APK लिंक भेजे वाले ठग मन घूमथें। कोनो अनजान लिंक म क्लिक झन करव।',
    },
    Bilaspur: {
      en: 'Active digital arrest extortion calls impersonating police / CBI in Bilaspur.',
      hi: 'बिलासपुर में फर्जी पुलिस व "डिजिटल अरेस्ट" कॉल के मामले सक्रिय हैं।',
      cg: 'बिलासपुर म "डिजिटल अरेस्ट" अउ फर्जी पुलिस फोन के मामला बढ़ गे हे।',
    },
    Durg: {
      en: 'Work-from-home and Telegram investment task fraud reported in Durg-Bhilai.',
      hi: 'दुर्ग-भिलाई में पार्ट-टाइम नौकरी और टेलीग्राम टास्क फ्रॉड के नए मामले।',
      cg: 'दुर्ग-भिलाई म घर बैठे काम अउ टेलीग्राम टास्क ठगी के नवा मामला आए हे।',
    },
    'Sarangarh-Bilaigarh': {
      en: 'Fake government scheme subsidy SMS asking for OTP reported in Sarangarh.',
      hi: 'सारंगढ़ में सरकारी महतारी वंदन योजना के नाम पर फर्जी OTP मांगने वाले संदेश।',
      cg: 'सारंगढ़ म महतारी वंदन योजना के नाव म फर्जी ओटीपी मांगे वाले मैसेज आवत हे।',
    },
    Dantewada: {
      en: 'Warning: Illegal mule account recruitment targeting bank accounts in Dantewada.',
      hi: 'दंतेवाड़ा में बैंक खाते किराए पर लेने (म्यूल खाता) का लालच देने वाले गिरोह से सावधान।',
      cg: 'दंतेवाड़ा म बैंक खाता भाड़ा म लेहे के लालच देवत हें। अपन खाता कोनो ल झन देवा।',
    },
  }

  const currentAlert =
    DISTRICT_ALERTS[district]?.[lang] ||
    DISTRICT_ALERTS[district]?.en ||
    (lang === 'hi'
      ? `${district} में बैंक KYC व फर्जी लॉटरी QR कोड वाले संदेश सक्रिय हैं। सतर्क रहें।`
      : lang === 'cg'
      ? `${district} म बैंक KYC अउ लॉटरी क्यूआर वाले मैसेज देखे गे हे। सचेत रहव।`
      : `Active bank KYC and lottery QR scam patterns detected in ${district}. Do not share OTP.`)

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. HERO BANNER: "Stay Alert. Stay Safe Online."           */}
      {/* ========================================================= */}
      <section className="relative rounded-3xl bg-[#FAF7EE] border border-[#E9E2D2] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xs">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14261C] tracking-tight leading-tight">
            Stay Alert. Stay <span className="italic font-normal font-serif">Safe</span> Online.
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D50] mt-2.5 leading-relaxed font-sans">
            Verify suspicious messages, report cyber fraud and access trusted cyber safety resources from the Government of India.
          </p>
        </div>

        {/* Indian Parliament Building (Samvidhan Sadan) Graphic */}
        <ParliamentIllustration className="hidden md:block absolute right-0 lg:right-4 bottom-0 w-[420px] lg:w-[500px] xl:w-[560px] h-auto max-h-[95%] object-contain pointer-events-none select-none opacity-90" />
      </section>

      {/* ========================================================= */}
      {/* 2. ROW 1: QUICK VERIFY (GREEN) & CALL 1930 (PEACH)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TILE 1: QUICK VERIFY (HERO TILE) */}
        <section className="lg:col-span-7 rounded-3xl bg-[#183B2B] text-card p-6 sm:p-7 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/70">
              QUICK VERIFY · INSTANT CHECK
            </div>

            <div className="flex items-start gap-3 mt-3">
              <div className="w-11 h-11 rounded-2xl bg-[#26533D] flex items-center justify-center shrink-0 text-white shadow-2xs">
                <SearchIcon size={22} />
              </div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Check Message or Link
                </h2>
                <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
                  Paste an SMS, WhatsApp message or website link to verify if it is genuine or a scam.
                </p>
              </div>
            </div>

            {/* Input Bar with Link Icon & Gold Submit Button */}
            <form onSubmit={handleQuickCheck} className="mt-5 flex items-center bg-white rounded-full p-1.5 pl-4 sm:pl-5 shadow-xs text-ink">
              <LinkIcon size={18} className="text-[#55695C] shrink-0 mr-2.5" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Paste suspicious message or link here..."
                className="w-full bg-transparent text-sm sm:text-base outline-none text-[#14261C] placeholder:text-[#7A8C80]"
              />
              <button
                type="submit"
                disabled={!quickInput.trim()}
                className="bg-[#F4E3C1] hover:bg-[#EED8B0] text-[#14261C] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shrink-0 active:scale-95 transition disabled:opacity-40 cursor-pointer"
              >
                Verify Now →
              </button>
            </form>
          </div>

          {/* Sample Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-1">
            <span className="text-xs text-white/70 font-medium mr-1">
              Try samples:
            </span>
            {SAMPLE_ITEMS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuickInput(s.text)
                  navigate('/citizen/check', { state: { prefillText: s.text, autoCheck: true } })
                }}
                className="text-xs bg-[#24523D] hover:bg-[#2E664B] text-white/95 px-3 py-1.5 rounded-full transition cursor-pointer font-medium active:scale-95"
              >
                {s.label[lang] || s.label.en}
              </button>
            ))}
          </div>
        </section>

        {/* TILE 2: CALL 1930 EMERGENCY CARD (PEACH/BLUSH) */}
        <section className="lg:col-span-5 rounded-3xl bg-[#FDF1EC] border border-[#F7D2C4] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-[#A5281D]">
              <span className="text-base" aria-hidden="true">🔔</span>
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase">
                LOST MONEY TO ONLINE FRAUD?
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#A5281D] leading-tight mt-2">
              Call 1930 Immediately
            </h2>
            <p className="text-xs sm:text-sm text-[#5C3B35] mt-1.5 leading-relaxed max-w-[270px]">
              Dial the National Cyber Crime Helpline (1930) to report and freeze fraudulent transactions.
            </p>
          </div>

          <div className="mt-5 relative z-10">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 bg-[#A5281D] hover:bg-[#8F2218] text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-xs active:scale-95 transition"
            >
              <PhoneIcon size={16} />
              <span>Call 1930</span>
            </a>
          </div>

          {/* Hand Holding Phone Alert Graphic */}
          <PhoneAlertIllustration className="absolute -right-1 sm:right-2 bottom-0 w-36 sm:w-44 h-auto pointer-events-none" />
        </section>
      </div>

      {/* ========================================================= */}
      {/* 3. ROW 2: 4 HORIZONTAL ACTION TILES                       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Report a Cybercrime */}
        <Link
          to="/citizen/report"
          className="bg-card border border-[#E8E2D4] hover:border-forest/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EAF5EE] text-[#1F5435] flex items-center justify-center shrink-0">
              <DocumentCheckIcon size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#14261C] text-sm sm:text-base leading-snug group-hover:text-forest transition">
                Report a Cybercrime
              </h3>
              <p className="text-xs text-muted mt-1 leading-normal">
                File an official complaint with cybercrime authorities.
              </p>
            </div>
          </div>
          <span className="w-6 h-6 rounded-full bg-[#FAF7EE] border border-[#E8E2D4] flex items-center justify-center text-xs text-ink group-hover:bg-[#183B2B] group-hover:text-white transition shrink-0 mt-0.5">
            →
          </span>
        </Link>

        {/* Card 2: District Alerts */}
        <div
          onClick={() => setDistrictModalOpen(true)}
          className="bg-card border border-[#E8E2D4] hover:border-warn/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EAF5EE] text-[#1F5435] flex items-center justify-center shrink-0">
              <ShieldCheckIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-[#14261C] text-sm sm:text-base leading-snug">
                  District Alerts · {district}
                </h3>
                <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full border border-amber-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted mt-1 leading-normal">
                Latest scams, threats and safety advisories in your district.
              </p>
            </div>
          </div>
          <span className="w-6 h-6 rounded-full bg-[#FAF7EE] border border-[#E8E2D4] flex items-center justify-center text-xs text-ink group-hover:bg-[#183B2B] group-hover:text-white transition shrink-0 mt-0.5">
            →
          </span>
        </div>

        {/* Card 3: Cyber Awareness */}
        <Link
          to="/citizen/learn"
          className="bg-card border border-[#E8E2D4] hover:border-forest/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EAF5EE] text-[#1F5435] flex items-center justify-center shrink-0">
              <BookIcon size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#14261C] text-sm sm:text-base leading-snug group-hover:text-forest transition">
                Cyber Awareness
              </h3>
              <p className="text-xs text-muted mt-1 leading-normal">
                Learn with simple guides, videos and real-life examples.
              </p>
            </div>
          </div>
          <span className="w-6 h-6 rounded-full bg-[#FAF7EE] border border-[#E8E2D4] flex items-center justify-center text-xs text-ink group-hover:bg-[#183B2B] group-hover:text-white transition shrink-0 mt-0.5">
            →
          </span>
        </Link>

        {/* Card 4: Literacy Score */}
        <Link
          to="/citizen/learn"
          className="bg-card border border-[#E8E2D4] hover:border-forest/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EAF5EE] text-[#1F5435] flex items-center justify-center shrink-0">
              <GraduationCapIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[#14261C] text-sm sm:text-base leading-snug group-hover:text-forest transition">
                  Literacy Score
                </h3>
                <span className="text-[10px] font-bold text-forest bg-mint px-2 py-0.5 rounded-full">
                  {score}/100
                </span>
              </div>
              <p className="text-xs text-muted mt-1 leading-normal">
                Check and improve your cyber safety knowledge.
              </p>
            </div>
          </div>
          <span className="w-6 h-6 rounded-full bg-[#FAF7EE] border border-[#E8E2D4] flex items-center justify-center text-xs text-ink group-hover:bg-[#183B2B] group-hover:text-white transition shrink-0 mt-0.5">
            →
          </span>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 4. ROW 3: DISTRICT ALERT TICKER BANNER                    */}
      {/* ========================================================= */}
      <section className="bg-[#FFF4EC] border border-[#FAD7C3] rounded-2xl p-3 sm:px-5 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="grid place-items-center w-7 h-7 rounded-full bg-[#FCE8DC] text-[#E05244] shrink-0">
            <MegaphoneIcon size={16} />
          </span>
          <span className="font-bold text-[#14261C] shrink-0">
            District Alert · {district}
          </span>
          <span className="text-[#E05244] font-bold hidden sm:inline">|</span>
          <span className="text-ink/80 truncate">
            {currentAlert}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDistrictModalOpen(true)}
          className="text-[#A5281D] font-bold hover:underline shrink-0 text-xs sm:text-sm cursor-pointer ml-2"
        >
          View More →
        </button>
      </section>

      {/* ========================================================= */}
      {/* 5. ROW 4: RECENT CHECKS & NEW TO CYBER SAFETY GUIDE       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Your Recent Checks */}
        <section className="lg:col-span-6 bg-card border border-[#E8E2D4] rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D4]">
              <div className="flex items-center gap-2">
                <span className="text-muted">🕒</span>
                <h3 className="font-bold text-[#14261C] text-sm sm:text-base">
                  Your Recent Checks
                </h3>
              </div>
              <Link
                to="/citizen/check"
                className="text-xs font-semibold text-forest hover:underline"
              >
                View All Checks →
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {recentChecks.length === 0 ? (
                <div className="bg-[#FAF7EE] rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted">
                    No recent checks yet. Verify a message or link to see it here.
                  </p>
                </div>
              ) : (
                recentChecks.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/citizen/check', { state: { result: item } })}
                    className="bg-[#FAF7EE] hover:bg-mint/40 border border-[#E8E2D4] rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted text-sm shrink-0">💬</span>
                      <p className="truncate font-medium text-ink">
                        {item.originalText}
                      </p>
                    </div>
                    <span
                      className={`font-semibold px-2.5 py-0.5 rounded-full text-[10.5px] shrink-0 ${
                        item.verdict === 'scam'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
                          : 'bg-mint text-forest border border-leaf/20'
                      }`}
                    >
                      {item.verdict === 'scam' ? 'Scam' : 'Genuine'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right: New to Cyber Safety? Guide */}
        <section className="lg:col-span-6 bg-[#EAF5EE] border border-[#D5EADB] rounded-3xl p-5 sm:p-6 shadow-2xs relative overflow-hidden flex items-center justify-between gap-4">
          <div className="relative z-10 max-w-[280px] sm:max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-[#2D6248] text-white flex items-center justify-center shrink-0 mb-3 shadow-2xs">
              <BookIcon size={18} />
            </div>

            <h3 className="font-bold text-[#143826] text-base sm:text-lg leading-snug">
              New to Cyber Safety?
            </h3>
            <p className="text-xs sm:text-sm text-[#3E654E] mt-1 leading-relaxed">
              Start with a 5-minute guide on common online scams.
            </p>

            <Link
              to="/citizen/learn"
              className="mt-4 bg-[#183B2B] hover:bg-[#122E21] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <span>Learn Now</span>
              <span>→</span>
            </Link>
          </div>

          {/* Laptop with Shield Illustration */}
          <LaptopShieldIllustration className="w-36 sm:w-44 h-auto shrink-0 pointer-events-none" />
        </section>
      </div>

      {/* District Selection Modal */}
      <DistrictModal
        isOpen={districtModalOpen}
        onClose={() => setDistrictModalOpen(false)}
        currentDistrict={district}
        onSelect={(d) => setDistrict?.(d)}
        lang={lang}
      />
    </div>
  )
}
