import { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { getRecentChecks } from '../lib/citizenStorage.js'
import { DISTRICTS } from '../../shared/districts.js'
import { AlertIcon, BookIcon, PhoneIcon, ShieldCheckIcon } from '../components/CitizenIcons.jsx'

export default function CitizenHome() {
  const { district, setDistrict, lang, t, score } = useOutletContext()
  const [quickInput, setQuickInput] = useState('')
  const [recentChecks, setRecentChecks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setRecentChecks(getRecentChecks())
  }, [])

  const handleQuickCheck = (e) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    navigate('/citizen/check', { state: { prefillText: quickInput, autoCheck: true } })
  }

  const SAMPLE_ITEMS = [
    {
      label: { en: 'Power Bill Cutoff', hi: 'बिजली बिल फ्रॉड', cg: 'बिजली बिल ठगी' },
      text: 'प्रिय उपभोक्ता, आपके पिछले माह का बिजली बिल अपडेट नहीं हुआ है। आज रात 9:30 बजे आपका बिजली कनेक्शन काट दिया जाएगा। तुरंत हमारे बिजली अधिकारी श्री वर्मा से 9876543210 पर संपर्क करें या लिंक bit.ly/cseb-bill से अपडेट करें।',
    },
    {
      label: { en: 'Bank KYC Block', hi: 'बैंक KYC ब्लॉक', cg: 'बैंक KYC ब्लॉक' },
      text: 'प्रिय ग्राहक, आपका SBI Yono खाता आज रात ब्लॉक कर दिया जाएगा क्योंकि आपका पैन कार्ड और KYC अपडेट नहीं है। खाता चालू रखने के लिए तुरंत इस लिंक पर क्लिक करें: http://sbi-kyc-update-portal.online और अपना OTP सत्यापित करें।',
    },
    {
      label: { en: 'Lottery QR Prize', hi: 'लॉटरी QR कोड', cg: 'लॉटरी क्यूआर' },
      text: 'बधाई हो! आपको छत्तीसगढ़ राज्य लॉटरी योजना में ₹25,000 का नकद पुरस्कार मिला है। यह पैसा अपने बैंक खाते में तुरंत पाने के लिए नीचे दिए गए QR कोड को PhonePe / GPay से स्कैन करें और अपना 4 अंकों का UPI पिन दर्ज करें।',
    },
  ]

  // District alerts in all 3 languages
  const DISTRICT_ALERTS = {
    Raipur: {
      en: 'Surge in fake electricity bill disconnection SMS and APK malware links in Raipur.',
      hi: 'रायपुर में बिजली बिल कटने के नाम पर फर्जी APK फाइल भेजने वाले मामलों में वृद्धि।',
      cg: 'रायपुर म बिजली बिल कटे के नाव म फर्जी APK लिंक भेजे वाले ठग मन घूमथें।',
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
      ? `${district} में बैंक KYC व फर्जी लॉटरी QR कोड वाले संदेश सक्रिय हैं।`
      : lang === 'cg'
      ? `${district} म बैंक KYC अउ लॉटरी क्यूआर वाले मैसेज देखे गे हे।`
      : `Active bank KYC and lottery QR scam patterns detected in ${district}.`)

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* PHONE ONLY: pick your district once, here (header has no district on phones) */}
      <label className="md:hidden col-span-12 flex items-center gap-3 bg-card border border-line rounded-3xl px-4 py-3">
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-mint text-forest shrink-0" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-muted">{t.yourDistrict}</span>
          <select
            value={district}
            onChange={(e) => setDistrict?.(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold text-ink outline-none py-1"
          >
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </span>
      </label>

      {/* 1. TILE 1: QUICK CHECK (HERO TILE) */}
      <section className="col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl bg-forest text-card p-5 sm:p-6 flex flex-col justify-between md:min-h-[220px] shadow-[0_1px_0_rgba(30,42,34,0.04)]">
        <div className="pointer-events-none absolute -right-16 -top-20 w-64 h-64 rounded-full bg-forest-2" />
        <div className="pointer-events-none absolute right-10 -bottom-24 w-48 h-48 rounded-full bg-forest-2/60" />

        <div className="relative">
          <div className="hidden md:block text-[11px] font-semibold tracking-[0.18em] uppercase text-card/70">
            {lang === 'hi' ? 'त्वरित जाँच · QUICK VERIFY' : lang === 'cg' ? 'तुरंत जाँच · QUICK VERIFY' : 'QUICK VERIFY · INSTANT CHECK'}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight md:mt-1 text-card">
            {t.bentoQuickCheckTitle}
          </h2>
          <p className="hidden md:block text-xs text-card/80 mt-1">
            {t.bentoQuickCheckSub}
          </p>

          {/* Minimal Input Bar */}
          <form onSubmit={handleQuickCheck} className="mt-3 flex items-center gap-2 md:gap-0 bg-card text-ink rounded-full p-1.5 md:p-1 pl-4 border border-line shadow-xs">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={t.bentoQuickCheckPlaceholder}
              className="w-full min-w-0 h-12 md:h-auto bg-transparent text-lg md:text-sm outline-none placeholder:text-muted/60"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              aria-label={t.bentoQuickCheckBtn}
              className="grid md:inline-block place-items-center w-12 h-12 md:w-auto md:h-auto rounded-full bg-sun text-ink text-2xl md:text-xs font-semibold md:px-4 md:py-2 hover:brightness-105 active:scale-95 transition shrink-0 disabled:opacity-40"
            >
              <span className="md:hidden leading-none" aria-hidden="true">→</span>
              <span className="hidden md:inline">{t.bentoQuickCheckBtn} →</span>
            </button>
          </form>
        </div>

        {/* Quick Sample Chips */}
        <div className="relative flex flex-nowrap md:flex-wrap items-center gap-1.5 mt-3 pt-1 overflow-x-auto md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none]">
          <span className="shrink-0 text-sm md:text-[11px] text-card/60 mr-1">
            {lang === 'hi' ? 'नमूना:' : lang === 'cg' ? 'नमूना:' : 'Samples:'}
          </span>
          {SAMPLE_ITEMS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuickInput(s.text)
                navigate('/citizen/check', { state: { prefillText: s.text, autoCheck: true } })
              }}
              className="shrink-0 whitespace-nowrap text-sm md:text-[11px] bg-forest-2/80 hover:bg-forest-2 text-card/90 px-3 md:px-2.5 py-2.5 md:py-1 rounded-full transition"
            >
              {s.label[lang] || s.label.en}
            </button>
          ))}
        </div>
      </section>

      {/* 2. TILE 2: LOST MONEY? CALL 1930 */}
      <section className="col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl bg-blush border border-scam/15 p-5 flex flex-col justify-between min-h-[220px] shadow-[0_1px_0_rgba(30,42,34,0.04)]">
        <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-scam/10" />

        <div className="relative">
          <div className="flex items-center gap-2 text-scam">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-scam opacity-60 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-scam" />
            </span>
            <span className="text-sm md:text-[11px] font-semibold tracking-[0.18em] uppercase">
              {lang === 'hi' ? 'आपातकाल · 1930' : lang === 'cg' ? 'तुरते फोन · 1930' : 'LOST MONEY? · 1930'}
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-scam leading-tight mt-1.5">
            {t.bentoLostMoneyHighlight}
          </h2>
          <p className="text-base md:text-xs text-ink/80 mt-1 leading-relaxed">
            {t.bentoLostMoneyDesc}
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 mt-4 pt-1">
          <a
            href="tel:1930"
            className="flex md:inline-flex w-full md:w-auto justify-center items-center gap-2 h-14 md:h-auto rounded-full bg-scam text-card text-lg md:text-xs font-semibold px-4 md:py-2 hover:brightness-110 active:scale-95 transition shadow-xs"
          >
            <PhoneIcon size={18} />
            <span>{t.callNow}</span>
          </a>
          <span className="text-sm md:text-[11px] text-muted font-medium">
            {lang === 'hi' ? 'राष्ट्रीय साइबर हेल्पलाइन' : lang === 'cg' ? 'राष्ट्रीय साइबर हेल्पलाइन' : 'National Cyber Helpline'}
          </span>
        </div>
      </section>

      {/* 3. TILE 3: LEARN & SCORE */}
      <section className="col-span-12 md:col-span-4 bg-card border border-line rounded-3xl p-5 flex flex-col justify-between min-h-[160px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-mint text-forest">
                <BookIcon size={16} />
              </span>
              <h3 className="text-base md:text-sm font-semibold text-ink">{t.bentoLearnScoreLabel}</h3>
            </div>
            <Link to="/citizen/learn" className="text-sm md:text-xs font-semibold text-forest hover:underline">
              {t.navLearn} →
            </Link>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-ink leading-none">{score}</span>
            <span className="text-sm md:text-xs text-muted font-medium">/ 100</span>
            <span className="text-sm md:text-xs font-semibold text-safe ml-auto bg-mint/50 px-2 py-0.5 rounded-full">
              {score >= 80 ? (lang === 'hi' ? 'सचेत' : lang === 'cg' ? 'सचेत' : 'Safe') : (lang === 'hi' ? 'सीखें' : lang === 'cg' ? 'सिखव' : 'Learn')}
            </span>
          </div>
          <p className="text-base md:text-xs text-muted mt-1">
            {lang === 'hi' ? 'OTP, PIN व QR कोड के 4 सरल पाठ' : lang === 'cg' ? '4 सरल पाठ पूरा करव' : '4 interactive lessons on OTP, PIN & QR'}
          </p>
        </div>

        <Link
          to="/citizen/learn"
          className="text-sm md:text-xs font-semibold text-forest hover:underline mt-3 inline-block"
        >
          {t.bentoLearnContinue} →
        </Link>
      </section>

      {/* 4. TILE 4: REPORT A SCAM */}
      <section className="col-span-12 md:col-span-4 bg-card border border-line rounded-3xl p-5 flex flex-col justify-between min-h-[160px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-blush text-scam">
                <AlertIcon size={16} />
              </span>
              <h3 className="text-base md:text-sm font-semibold text-ink">{t.navReport}</h3>
            </div>
            <Link to="/citizen/report" className="text-sm md:text-xs font-semibold text-forest hover:underline">
              {t.bentoReportBtn} →
            </Link>
          </div>

          <h4 className="font-display text-xl font-bold text-ink mt-2">
            {t.bentoReportTitle}
          </h4>
          <p className="text-base md:text-xs text-muted mt-0.5">
            {t.bentoReportSub}
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-1.5 rounded-full bg-forest text-card text-sm md:text-xs font-semibold px-4 py-3 md:py-2 hover:bg-forest-2 active:scale-95 transition self-start mt-3"
        >
          <span>{t.bentoReportBtn}</span>
        </Link>
      </section>

      {/* 5. TILE 5: DISTRICT ALERT */}
      <section className="col-span-12 md:col-span-4 bg-card border border-line rounded-3xl p-5 flex flex-col justify-between min-h-[160px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-sun-tint text-warn">
                <ShieldCheckIcon size={16} />
              </span>
              <h3 className="text-base md:text-sm font-semibold text-ink">
                {lang === 'hi' ? `ज़िला अलर्ट · ${district}` : lang === 'cg' ? `ज़िला अलर्ट · ${district}` : `District Alert · ${district}`}
              </h3>
            </div>
            <span className="text-sm md:text-[10px] font-semibold bg-sun-tint text-warn px-2 py-0.5 rounded-full">
              {lang === 'hi' ? 'सक्रिय' : lang === 'cg' ? 'सक्रिय' : 'Active'}
            </span>
          </div>

          <p className="text-base md:text-xs font-medium text-ink leading-relaxed mt-2">
            {currentAlert}
          </p>
        </div>

        <span className="text-sm md:text-[11px] text-muted mt-3">
          {lang === 'hi' ? 'नागरिक रिपोर्टों पर आधारित' : lang === 'cg' ? 'नागरिक रपट म आधारित' : 'Based on citizen reports'}
        </span>
      </section>

      {/* 6. RECENT CHECKS */}
      <section className="col-span-12 bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-xs font-semibold text-muted uppercase tracking-wider">
              {t.bentoRecentChecks}
            </span>
          </div>
          <Link to="/citizen/check" className="text-sm md:text-xs font-semibold text-forest hover:underline">
            {lang === 'hi' ? 'नई जाँच +' : lang === 'cg' ? 'नवा जाँच +' : 'New check +'}
          </Link>
        </div>

        {recentChecks.length === 0 ? (
          <p className="text-base md:text-xs text-muted py-2">{t.noRecentChecks}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentChecks.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/citizen/check', { state: { result: item } })}
                className="bg-beige/60 hover:bg-mint/40 border border-line rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition text-sm md:text-xs"
              >
                <p className="truncate font-medium text-ink max-w-[200px]">
                  {item.originalText}
                </p>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-sm md:text-[11px] shrink-0 ${
                    item.verdict === 'scam'
                      ? 'bg-blush text-scam border border-scam/20'
                      : 'bg-mint text-forest border border-leaf/20'
                  }`}
                >
                  {item.verdict === 'scam'
                    ? (lang === 'hi' ? 'धोखाधड़ी' : lang === 'cg' ? 'ठगी' : 'Scam')
                    : (lang === 'hi' ? 'सुरक्षित' : lang === 'cg' ? 'सुरक्षित' : 'Genuine')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
