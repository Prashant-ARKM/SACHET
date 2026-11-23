import { useState } from 'react'
import { Link } from 'react-router-dom'

// Launch page texts. hi = original text; en/cg added for the language switch.
const L = {
  hi: {
    eyebrow: 'CYBER SAFETY PLATFORM · साइबर सुरक्षा',
    title: 'सचेत छत्तीसगढ़',
    subtitle: 'कृपया अपनी भूमिका चुनें (Select your portal)',
    citizenTitle: 'मैं नागरिक हूँ',
    citizenDesc: 'संदेश व लिंक की जाँच, 1930 हेल्पलाइन, अनाम रिपोर्ट और सुरक्षा पाठ।',
    citizenBtn: 'नागरिक पोर्टल →',
    officialTitle: 'मैं अधिकारी हूँ',
    officialDesc: '33 ज़िलों के हॉटस्पॉट मैप, रुझान, लाइव फीड और फ्रॉड विश्लेषण।',
    officialBtn: 'डैशबोर्ड खोलें →',
    helplinePill: 'पैसे कटे? कॉल 1930',
    helplineBefore: 'आपातकाल: किसी भी वित्तीय धोखाधड़ी पर तत्काल',
    helplineAfter: 'डायल करें।',
    footer: 'SACHET Chhattisgarh · साइबर अपराध नियंत्रण एवं नागरिक सहायता',
  },
  cg: {
    eyebrow: 'CYBER SAFETY PLATFORM · साइबर सुरक्षा',
    title: 'सचेत छत्तीसगढ़',
    subtitle: 'अपन भूमिका चुनव (Select your portal)',
    citizenTitle: 'मैं नागरिक हंव',
    citizenDesc: 'मैसेज अउ लिंक के जाँच, 1930 हेल्पलाइन, बिना नाव के शिकायत अउ सुरक्षा पाठ।',
    citizenBtn: 'नागरिक पोर्टल →',
    officialTitle: 'मैं अधिकारी हंव',
    officialDesc: '33 ज़िला के हॉटस्पॉट नक्शा, रुझान, लाइव फीड अउ ठगी के जाँच।',
    officialBtn: 'डैशबोर्ड खोलव →',
    helplinePill: 'पैसा कट गे? 1930 लगावा',
    helplineBefore: 'आपातकाल: कोनो घलो पइसा के ठगी होय त तुरते',
    helplineAfter: 'लगावा।',
    footer: 'SACHET Chhattisgarh · साइबर अपराध रोकथाम अउ नागरिक मदद',
  },
  en: {
    eyebrow: 'CYBER SAFETY PLATFORM',
    title: 'SACHET Chhattisgarh',
    subtitle: 'Choose your portal',
    citizenTitle: "I'm a citizen",
    citizenDesc: 'Check messages and links, 1930 helpline, anonymous reports and safety lessons.',
    citizenBtn: 'Citizen portal →',
    officialTitle: "I'm an official",
    officialDesc: 'Hotspot map of 33 districts, trends, live feed and fraud analysis.',
    officialBtn: 'Open dashboard →',
    helplinePill: 'Lost money? Call 1930',
    helplineBefore: 'Emergency: for any financial fraud, dial',
    helplineAfter: 'immediately.',
    footer: 'SACHET Chhattisgarh · Cybercrime prevention and citizen help',
  },
}

const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी' },
  { id: 'cg', label: 'छ.ग.' },
]

// Same keys the citizen app and dashboard read, so the choice carries over.
const KEYS = ['sachet_citizen_lang', 'sachet_official_lang']

function getLang() {
  try {
    const saved = localStorage.getItem(KEYS[0])
    return L[saved] ? saved : 'hi'
  } catch {
    return 'hi'
  }
}

export default function LaunchPage() {
  const [lang, setLang] = useState(getLang)
  const t = L[lang]

  const changeLang = (l) => {
    setLang(l)
    try {
      KEYS.forEach((k) => localStorage.setItem(k, l))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-beige text-ink px-4 py-4 sm:px-10 sm:py-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-card flex items-center justify-center font-display font-bold text-xl">
            स
          </div>
          <div>
            <span className="font-display font-bold text-xl text-ink hidden min-[400px]:inline sm:inline">SACHET</span>
            <span className="ml-2 text-[11px] font-semibold tracking-wider uppercase text-muted hidden sm:inline">
              CHHATTISGARH
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language switch (same style as inside the apps) */}
          <div className="flex border border-line rounded-full overflow-hidden text-sm bg-card p-0.5" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => changeLang(l.id)}
                aria-pressed={lang === l.id}
                className={`px-3.5 py-2 sm:px-3 sm:py-1 rounded-full font-medium transition ${
                  lang === l.id ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* 1930 helpline */}
          <a
            href="tel:1930"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-blush text-scam border border-scam/20 hover:brightness-95 transition-all"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-scam opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-scam" />
            </span>
            <span>{t.helplinePill}</span>
          </a>
        </div>
      </header>

      {/* Main Persona Selector */}
      <main className="max-w-4xl w-full mx-auto my-auto text-center py-5 sm:py-8">
        <div className="hidden sm:block text-sm font-semibold tracking-[0.2em] uppercase text-muted">{t.eyebrow}</div>
        <h1 className="text-[34px] sm:text-6xl font-bold font-display text-ink sm:mt-3 leading-tight">{t.title}</h1>
        <p className="text-base sm:text-lg text-muted mt-2 sm:mt-3">{t.subtitle}</p>

        {/* 2 Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 text-left mt-6 sm:mt-10">
          {/* Citizen Portal */}
          <Link
            to="/citizen"
            className="group bg-card border border-line rounded-3xl p-4 sm:p-8 sm:min-h-[270px] shadow-[0_1px_0_rgba(30,42,34,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(31,77,51,0.3)] transition duration-200 flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-4 sm:gap-6"
          >
            <div className="flex items-center sm:block gap-4 min-w-0 flex-1">
              <span className="grid place-items-center w-14 h-14 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-mint text-forest sm:mb-5 text-2xl">🛡️</span>
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-tight">{t.citizenTitle}</h2>
                <p className="text-base text-muted mt-1 sm:mt-2 leading-snug sm:leading-relaxed line-clamp-2 [@media(min-height:700px)]:line-clamp-none sm:line-clamp-none">{t.citizenDesc}</p>
              </div>
            </div>

            {/* phones: the whole card is the button; arrow shows it */}
            <span className="sm:hidden grid place-items-center w-12 h-12 shrink-0 rounded-full bg-forest text-card text-xl" aria-hidden="true">→</span>
            <div className="hidden sm:block rounded-full bg-forest text-card text-lg sm:text-base font-semibold py-3.5 sm:py-3 px-5 text-center group-hover:bg-forest-2 transition-colors">
              {t.citizenBtn}
            </div>
          </Link>

          {/* Official Dashboard */}
          <Link
            to="/official"
            className="group bg-card border border-line rounded-3xl p-4 sm:p-8 sm:min-h-[270px] shadow-[0_1px_0_rgba(30,42,34,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(31,77,51,0.3)] transition duration-200 flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-4 sm:gap-6"
          >
            <div className="flex items-center sm:block gap-4 min-w-0 flex-1">
              <span className="grid place-items-center w-14 h-14 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-sun-tint text-warn sm:mb-5 text-2xl">🏛️</span>
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-tight">{t.officialTitle}</h2>
                <p className="text-base text-muted mt-1 sm:mt-2 leading-snug sm:leading-relaxed line-clamp-2 [@media(min-height:700px)]:line-clamp-none sm:line-clamp-none">{t.officialDesc}</p>
              </div>
            </div>

            {/* phones: the whole card is the button; arrow shows it */}
            <span className="sm:hidden grid place-items-center w-12 h-12 shrink-0 rounded-full bg-beige border border-line text-ink text-xl" aria-hidden="true">→</span>
            <div className="hidden sm:block rounded-full bg-beige border border-line text-ink text-lg sm:text-base font-semibold py-3.5 sm:py-3 px-5 text-center group-hover:bg-line transition-colors">
              {t.officialBtn}
            </div>
          </Link>
        </div>

        {/* Helpline notice */}
        <a
          href="tel:1930"
          className="sm:hidden mt-4 flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-scam text-card text-lg font-semibold active:scale-[0.98] transition"
        >
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-card opacity-60 animate-ping" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-card" />
          </span>
          {t.helplinePill}
        </a>
        <p className="hidden sm:block text-base text-muted mt-8">
          {t.helplineBefore}{' '}
          <a href="tel:1930" className="text-scam font-bold underline">
            1930
          </a>{' '}
          {t.helplineAfter}
        </p>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] sm:text-xs text-muted">{t.footer}</footer>
    </div>
  )
}
