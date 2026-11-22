import { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { SAMPLE_MESSAGES } from '../lib/scamDetector.js'
import { getRecentChecks } from '../lib/citizenStorage.js'

export default function CitizenHome() {
  const { district, lang, t, score } = useOutletContext()
  const [quickInput, setQuickInput] = useState('')
  const [recentChecks, setRecentChecks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setRecentChecks(getRecentChecks())
  }, [])

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText()
        if (text) setQuickInput(text)
      }
    } catch {}
  }

  const handleQuickCheck = (e) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    navigate('/citizen/check', { state: { prefillText: quickInput, autoCheck: true } })
  }

  const handleSampleClick = (sample) => {
    setQuickInput(sample.text)
  }

  // District-specific alerts mapping
  const DISTRICT_ALERTS = {
    Raipur: {
      hi: 'रायपुर में बिजली बिल कटने के नाम पर फर्जी APK लिंक भेजने वाले ठग सक्रिय हैं। किसी भी अनजान लिंक पर क्लिक न करें।',
      cg: 'रायपुर म बिजली बिल कटे के नाव म फर्जी APK लिंक भेजे वाले ठग मन घूमथें। कोनो अनजान लिंक म क्लिक झन करव।',
      en: 'High surge in electricity bill disconnection APK malware in Raipur. Do not click unknown links.',
    },
    Bilaspur: {
      hi: 'बिलासपुर में "डिजिटल अरेस्ट" और फर्जी पुलिस वीडियो कॉल के मामले बढ़ रहे हैं। पुलिस कभी वीडियो कॉल पर अरेस्ट नहीं करती।',
      cg: 'बिलासपुर म "डिजिटल अरेस्ट" अउ फर्जी पुलिस फोन के मामला बढ़ गे हे। पुलिस कभू वीडियो कॉल म अरेस्ट नइ करे।',
      en: 'Rising digital arrest scams in Bilaspur impersonating police officers via video call.',
    },
    Durg: {
      hi: 'दुर्ग-भिलाई में पार्ट-टाइम वर्क फ्रॉम होम और टेलीग्राम टास्क फ्रॉड के नए मामले सामने आए हैं।',
      cg: 'दुर्ग-भिलाई म घर बैठे काम अउ टेलीग्राम टास्क ठगी के नवा मामला आए हे।',
      en: 'Part-time work from home and task investment scams reported across Durg-Bhilai.',
    },
    'Sarangarh-Bilaigarh': {
      hi: 'सारंगढ़ में सरकारी महतारी वंदन योजना के नाम पर फर्जी OTP मांगने वाले संदेश आ रहे हैं।',
      cg: 'सारंगढ़ म महतारी वंदन योजना के नाव म फर्जी ओटीपी मांगे वाले मैसेज आवत हे।',
      en: 'Fake government scheme subsidy SMS asking for OTP reported in Sarangarh.',
    },
    Dantewada: {
      hi: 'दंतेवाड़ा क्षेत्र में बैंक खाते किराए पर लेने (म्यूल अकाउंट) का लालच दिया जा रहा है। अपना बैंक खाता किसी को न दें।',
      cg: 'दंतेवाड़ा म बैंक खाता भाड़ा म लेहे के लालच देवत हें। अपन बैंक खाता कोनो ल झन देवा।',
      en: 'Warning: Illegal mule account recruitment targeting rural accounts in Dantewada.',
    },
  }

  const currentAlert = DISTRICT_ALERTS[district]?.[lang] || {
    hi: `${district} में हाल ही में बैंक KYC और लॉटरी QR कोड वाले संदेश देखे गए हैं। किसी भी अजनबी को अपना OTP या पिन न बताएं।`,
    cg: `${district} म बैंक KYC अउ लॉटरी क्यूआर वाले मैसेज देखे गे हे। कोनो अनजान ल अपन ओटीपी या पिन मत देवा।`,
    en: `Active alerts in ${district} for Bank KYC and lottery QR lures. Never share your OTP or PIN.`,
  }[lang] || DISTRICT_ALERTS.Raipur.hi

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-card border border-line rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-leaf bg-mint px-2.5 py-1 rounded-full">
            सचेत छत्तीसगढ़ (SACHET)
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
            {lang === 'cg' ? 'जोहार! का हाल-चाल हे?' : lang === 'en' ? 'Welcome to Cyber Safety' : 'नमस्ते! आप सुरक्षित हैं?'}
          </h1>
          <p className="text-sm text-muted mt-1">
            {lang === 'cg'
              ? 'ए ऐप्लिकेशन तुंहर सुरक्षा बर बने हे — आसान भाषा, बड़े बटन अउ पूरा ऑफलाइन।'
              : lang === 'en'
              ? 'Simple fraud prevention for all ages. Hindi first, big tactile buttons, 100% offline.'
              : 'सभी नागरिकों के लिए आसान सुरक्षा — बड़ी लिखावट, बड़े बटन और बिना इंटरनेट के भी काम करे।'}
          </p>
        </div>
        <div className="shrink-0 bg-beige px-4 py-3 rounded-2xl border border-line text-center">
          <p className="text-[11px] font-bold text-muted uppercase">सुरक्षित ज़िला</p>
          <p className="text-lg font-bold text-forest">📍 {district}</p>
        </div>
      </div>

      {/* HOME BENTO (4 BIG TILES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* TILE 1: QUICK CHECK (BIGGEST TILE - SPANS FULL ROW ON LARGE) */}
        <div className="md:col-span-2 bg-card border-2 border-forest/30 rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-mint/40 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-2xl bg-forest text-card flex items-center justify-center font-bold text-lg shadow-xs">
              🔍
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                {t.bentoQuickCheckTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                {t.bentoQuickCheckSub}
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickCheck} className="mt-4 space-y-3">
            <div className="relative">
              <textarea
                rows="3"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={t.bentoQuickCheckPlaceholder}
                className="w-full p-4 rounded-2xl border-2 border-line bg-beige/60 text-ink text-base sm:text-lg focus:outline-hidden focus:border-forest transition-colors resize-none placeholder:text-muted/60"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 top-3 bg-card border border-line px-3 py-1.5 rounded-xl text-xs font-bold text-forest hover:bg-mint transition-colors shadow-xs"
              >
                📋 {t.btnPaste}
              </button>
            </div>

            {/* Quick Sample Chips */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-muted">{t.bentoSampleTitle}</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_MESSAGES.slice(0, 3).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleClick(sample)}
                    className="text-xs bg-beige hover:bg-mint text-ink font-semibold px-3 py-1.5 rounded-xl border border-line transition-all active:scale-95 text-left"
                  >
                    ⚡ {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Action Button */}
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="w-full bg-forest hover:bg-forest-2 disabled:opacity-40 text-card font-bold text-lg sm:text-xl py-4 rounded-2xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-3"
            >
              <span>{t.bentoQuickCheckBtn}</span>
              <span className="text-xl">➔</span>
            </button>
          </form>
        </div>

        {/* TILE 2: LOST MONEY? CALL 1930 (EMERGENCY TILE) */}
        <div className="bg-blush border-2 border-scam/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-scam">
              <span className="text-2xl animate-pulse">🚨</span>
              <span className="text-xs font-extrabold uppercase tracking-wider bg-scam text-card px-2.5 py-0.5 rounded-full">
                आपातकालीन (Urgent)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-scam leading-tight">
              {t.bentoLostMoneyTitle} <br />
              <span className="underline decoration-scam">{t.bentoLostMoneyHighlight}</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
              {t.bentoLostMoneyDesc}
            </p>
          </div>

          <a
            href="tel:1930"
            className="w-full bg-scam hover:bg-scam/90 text-card font-extrabold text-lg py-3.5 px-4 rounded-2xl text-center shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>📞</span>
            <span>1930 पर कॉल करें</span>
          </a>
        </div>

        {/* TILE 3: LEARN + MY SCORE */}
        <div className="bg-card border-2 border-leaf/30 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-leaf font-bold text-sm">
                <span>🛡️</span>
                <span>{t.bentoLearnTitle}</span>
              </div>
              <span className="text-xs font-extrabold bg-mint text-forest px-2.5 py-0.5 rounded-full">
                4 पाठ
              </span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-2xl bg-mint text-forest flex flex-col items-center justify-center font-display font-extrabold text-xl shadow-inner border border-forest/20 shrink-0">
                <span>{score}</span>
                <span className="text-[9px] font-sans font-bold -mt-1 text-muted">/100</span>
              </div>
              <div>
                <p className="font-bold text-base text-ink">
                  {score >= 80 ? '🌟 सुरक्षित नागरिक' : '🔰 सतर्क नागरिक'}
                </p>
                <p className="text-xs text-muted">
                  OTP, ATM, UPI PIN व QR कोड के 4 सरल पाठ पूरे करें।
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/citizen/learn"
            className="w-full bg-forest hover:bg-forest-2 text-card font-bold text-base py-3.5 px-4 rounded-2xl text-center shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>📖 {t.bentoLearnContinue}</span>
            <span>➔</span>
          </Link>
        </div>

        {/* TILE 4: REPORT A SCAM */}
        <div className="md:col-span-2 bg-gradient-to-r from-forest to-forest-2 text-card rounded-3xl p-5 sm:p-7 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-card px-3 py-1 rounded-full">
              नागरिक सुरक्षा रिपोर्ट (Anonymous)
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display">
              {t.bentoReportTitle}
            </h3>
            <p className="text-xs sm:text-sm text-card/85 leading-relaxed">
              {t.bentoReportSub}
            </p>
          </div>

          <Link
            to="/citizen/report"
            className="shrink-0 w-full sm:w-auto bg-sun hover:bg-sun/90 text-ink font-bold text-base sm:text-lg px-6 py-3.5 rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>🚨 {t.bentoReportBtn}</span>
            <span>➔</span>
          </Link>
        </div>
      </div>

      {/* LATER ITEMS: DISTRICT SCAM ALERT & RECENT CHECKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Scam Alert in your District */}
        <div className="bg-card border border-line rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ink flex items-center gap-2">
              <span className="text-scam">⚠️</span>
              <span>{t.bentoDistrictAlerts} ({district})</span>
            </h3>
            <span className="text-[10px] font-bold bg-sun-tint text-warn px-2 py-0.5 rounded-full">
              सक्रिय चेतावनी
            </span>
          </div>

          <div className="bg-beige/70 p-4 rounded-2xl border border-line">
            <p className="text-sm font-medium text-ink leading-relaxed">
              {currentAlert}
            </p>
          </div>
          <p className="text-[11px] text-muted flex items-center gap-1">
            <span>ℹ️</span> यह चेतावनी आपके ज़िले के नागरिक रिपोर्टों पर आधारित है।
          </p>
        </div>

        {/* Recent Checks */}
        <div className="bg-card border border-line rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ink flex items-center gap-2">
              <span>🕒</span>
              <span>{t.bentoRecentChecks}</span>
            </h3>
            <Link to="/citizen/check" className="text-xs font-bold text-forest hover:underline">
              नई जाँच +
            </Link>
          </div>

          {recentChecks.length === 0 ? (
            <div className="bg-beige/50 border border-dashed border-line rounded-2xl p-5 text-center text-xs text-muted">
              {t.noRecentChecks}। ऊपर दिए गए बॉक्स में कोई भी संदेश डालकर आज़माएं।
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentChecks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/citizen/check', { state: { result: item } })}
                  className="bg-beige hover:bg-mint/50 p-3 rounded-xl border border-line flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs"
                >
                  <p className="truncate font-medium text-ink max-w-[200px]">
                    {item.originalText}
                  </p>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      item.verdict === 'scam'
                        ? 'bg-scam text-card'
                        : 'bg-safe text-card'
                    }`}
                  >
                    {item.verdict === 'scam' ? 'धोखाधड़ी' : 'सुरक्षित'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

