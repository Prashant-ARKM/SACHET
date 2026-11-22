import { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { SAMPLE_MESSAGES } from '../lib/scamDetector.js'
import { getRecentChecks } from '../lib/citizenStorage.js'
import { AlertIcon, BookIcon, PhoneIcon, ShieldCheckIcon } from '../components/CitizenIcons.jsx'

export default function CitizenHome() {
  const { district, lang, score } = useOutletContext()
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

  // Minimal district alerts
  const DISTRICT_ALERTS = {
    Raipur: 'बिजली बिल कटने के नाम पर फर्जी APK फाइल भेजने वाले मामलों में वृद्धि।',
    Bilaspur: 'फर्जी पुलिस व "डिजिटल अरेस्ट" कॉल के मामले सक्रिय हैं।',
    Durg: 'पार्ट-टाइम नौकरी और टेलीग्राम टास्क फ्रॉड के नए मामले।',
    'Sarangarh-Bilaigarh': 'सरकारी महतारी वंदन योजना के नाम पर फर्जी OTP मांगने वाले संदेश।',
    Dantewada: 'बैंक खाते किराए पर लेने (म्यूल खाता) का लालच देने वाले गिरोह से सावधान।',
  }
  const currentAlert =
    DISTRICT_ALERTS[district] ||
    `${district} में बैंक KYC व फर्जी लॉटरी QR कोड वाले संदेश सक्रिय हैं।`

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. TILE 1: QUICK CHECK (HERO TILE - SPANS 7 COLS) */}
      <section className="col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl bg-forest text-card p-5 sm:p-6 flex flex-col justify-between min-h-[220px] shadow-[0_1px_0_rgba(30,42,34,0.04)]">
        {/* Decorative Circles */}
        <div className="pointer-events-none absolute -right-16 -top-20 w-64 h-64 rounded-full bg-forest-2" />
        <div className="pointer-events-none absolute right-10 -bottom-24 w-48 h-48 rounded-full bg-forest-2/60" />

        <div className="relative">
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-card/70">
            QUICK VERIFY · त्वरित जाँच
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-1 text-card">
            {lang === 'cg' ? 'मैसेज या लिंक के जाँच करव' : lang === 'en' ? 'Check Any Message or Link' : 'संदेश या लिंक की त्वरित जाँच'}
          </h2>
          <p className="text-xs text-card/80 mt-1">
            {lang === 'cg'
              ? 'SMS, WhatsApp मैसेज या लिंक पेस्ट करव अउ असली-नकली जानव'
              : lang === 'en'
              ? 'Paste any SMS, WhatsApp chat, or link to verify fraud risk'
              : 'संदिग्ध SMS, WhatsApp चैट या लिंक पेस्ट करके तुरंत परिणाम जानें'}
          </p>

          {/* Minimal Input Bar */}
          <form onSubmit={handleQuickCheck} className="mt-3 flex items-center bg-card text-ink rounded-full p-1 pl-4 border border-line shadow-xs">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="संदेश या लिंक यहाँ पेस्ट करें..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-muted/60"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="rounded-full bg-sun text-ink text-xs font-semibold px-4 py-2 hover:brightness-105 active:scale-95 transition shrink-0 disabled:opacity-40"
            >
              जाँच करें →
            </button>
          </form>
        </div>

        {/* Quick Sample Chips */}
        <div className="relative flex flex-wrap items-center gap-1.5 mt-3 pt-1">
          <span className="text-[11px] text-card/60 mr-1">नमूना:</span>
          {SAMPLE_MESSAGES.slice(0, 3).map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuickInput(s.text)
                navigate('/citizen/check', { state: { prefillText: s.text, autoCheck: true } })
              }}
              className="text-[11px] bg-forest-2/80 hover:bg-forest-2 text-card/90 px-2.5 py-1 rounded-full transition"
            >
              {s.label.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </section>

      {/* 2. TILE 2: LOST MONEY? CALL 1930 (ALERT TILE - SPANS 5 COLS) */}
      <section className="col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl bg-blush border border-scam/15 p-5 flex flex-col justify-between min-h-[220px] shadow-[0_1px_0_rgba(30,42,34,0.04)]">
        <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-scam/10" />

        <div className="relative">
          <div className="flex items-center gap-2 text-scam">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-scam opacity-60 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-scam" />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
              LOST MONEY? · 1930
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-scam leading-tight mt-1.5">
            {lang === 'cg' ? 'पैसा कट गे? 1930' : lang === 'en' ? 'Lost money? Call 1930' : 'पैसे कट गए? तुरंत 1930'}
          </h2>
          <p className="text-xs text-ink/80 mt-1 leading-relaxed">
            गोल्डन ऑवर: घटना के 2 घंटे के भीतर हेल्पलाइन 1930 पर कॉल करने से ठगों का बैंक खाता तत्काल फ़्रीज़ हो सकता है।
          </p>
        </div>

        <div className="relative flex items-center justify-between gap-3 mt-4 pt-1">
          <a
            href="tel:1930"
            className="inline-flex items-center gap-2 rounded-full bg-scam text-card text-xs font-semibold px-4 py-2 hover:brightness-110 active:scale-95 transition shadow-xs"
          >
            <PhoneIcon size={14} />
            <span>1930 डायल करें</span>
          </a>
          <span className="text-[11px] text-muted font-medium">राष्ट्रीय साइबर हेल्पलाइन</span>
        </div>
      </section>

      {/* 3. TILE 3: LEARN & MY SCORE (SPANS 4 COLS) */}
      <section className="col-span-12 md:col-span-4 bg-card border border-line rounded-3xl p-5 flex flex-col justify-between min-h-[160px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-mint text-forest">
                <BookIcon size={16} />
              </span>
              <h3 className="text-sm font-semibold text-ink">सुरक्षा स्कोर · Literacy</h3>
            </div>
            <Link to="/citizen/learn" className="text-xs font-semibold text-forest hover:underline">
              पाठ →
            </Link>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-ink leading-none">{score}</span>
            <span className="text-xs text-muted font-medium">/ 100</span>
            <span className="text-xs font-semibold text-safe ml-auto bg-mint/50 px-2 py-0.5 rounded-full">
              {score >= 80 ? 'सचेत' : 'सीखें'}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">OTP, PIN व QR कोड के 4 सरल पाठ</p>
        </div>

        <Link
          to="/citizen/learn"
          className="text-xs font-semibold text-forest hover:underline mt-3 inline-block"
        >
          पाठ जारी रखें →
        </Link>
      </section>

      {/* 4. TILE 4: REPORT A SCAM (SPANS 4 COLS) */}
      <section className="col-span-12 md:col-span-4 bg-card border border-line rounded-3xl p-5 flex flex-col justify-between min-h-[160px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-blush text-scam">
                <AlertIcon size={16} />
              </span>
              <h3 className="text-sm font-semibold text-ink">शिकायत · Report</h3>
            </div>
            <Link to="/citizen/report" className="text-xs font-semibold text-forest hover:underline">
              दर्ज करें →
            </Link>
          </div>

          <h4 className="font-display text-xl font-bold text-ink mt-2">अनाम रिपोर्ट दर्ज करें</h4>
          <p className="text-xs text-muted mt-0.5">बिना किसी डर के 2 मिनट में अपने ज़िले को सचेत करें</p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-1.5 rounded-full bg-forest text-card text-xs font-semibold px-4 py-2 hover:bg-forest-2 active:scale-95 transition self-start mt-3"
        >
          <span>शिकायत शुरू करें</span>
        </Link>
      </section>

      {/* 5. TILE 5: DISTRICT ALERT (SPANS 4 COLS) */}
      <section className="col-span-12 md:col-span-4 bg-card border border-line rounded-3xl p-5 flex flex-col justify-between min-h-[160px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-sun-tint text-warn">
                <ShieldCheckIcon size={16} />
              </span>
              <h3 className="text-sm font-semibold text-ink">ज़िला अलर्ट · {district}</h3>
            </div>
            <span className="text-[10px] font-semibold bg-sun-tint text-warn px-2 py-0.5 rounded-full">
              सक्रिय
            </span>
          </div>

          <p className="text-xs font-medium text-ink leading-relaxed mt-2">
            {currentAlert}
          </p>
        </div>

        <span className="text-[11px] text-muted mt-3">नागरिक रिपोर्टों पर आधारित</span>
      </section>

      {/* 6. RECENT CHECKS (FULL WIDTH ROW) */}
      <section className="col-span-12 bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              हालिया जाँच (Recent Checks)
            </span>
          </div>
          <Link to="/citizen/check" className="text-xs font-semibold text-forest hover:underline">
            नई जाँच +
          </Link>
        </div>

        {recentChecks.length === 0 ? (
          <p className="text-xs text-muted py-2">अभी तक कोई हालिया जाँच नहीं है। ऊपर दिए गए बॉक्स में कोई भी संदेश डालकर परखें।</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentChecks.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/citizen/check', { state: { result: item } })}
                className="bg-beige/60 hover:bg-mint/40 border border-line rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition text-xs"
              >
                <p className="truncate font-medium text-ink max-w-[200px]">
                  {item.originalText}
                </p>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[11px] shrink-0 ${
                    item.verdict === 'scam'
                      ? 'bg-blush text-scam border border-scam/20'
                      : 'bg-mint text-forest border border-leaf/20'
                  }`}
                >
                  {item.verdict === 'scam' ? 'धोखाधड़ी' : 'सुरक्षित'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
