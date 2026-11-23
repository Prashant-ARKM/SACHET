import { useState } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router-dom'
import AlertVerdict, { fmtDate } from '../components/AlertVerdict.jsx'
import { findAlertToken, getSavedAlerts } from '../../shared/alertSign.js'
import { scamLabel } from '../../shared/scamTypes.js'

const L = (lang, en, hi, cg) => (lang === 'hi' ? hi : lang === 'cg' ? cg : en)
const today = () => new Date().toISOString().slice(0, 10)

// Alerts: the alert just opened from a QR (#token), or the latest one for your district;
// how to scan a poster; and every genuine alert saved on this phone.
export default function CitizenAlert() {
  const { lang, district } = useOutletContext()
  const { hash } = useLocation()
  const opened = findAlertToken(decodeURIComponent(hash || ''))
  const [saved, setSaved] = useState(getSavedAlerts)

  // Your district first, then newest
  const sorted = [...saved].sort(
    (a, b) => (b.district === district) - (a.district === district) || (b.savedAt || '').localeCompare(a.savedAt || ''),
  )
  const latest = !opened ? sorted.find((a) => a.district === district && !(a.expires < today())) || sorted[0] : null
  const shown = opened || latest?.token

  const steps = [
    { n: '1', en: 'See a SACHET poster', hi: 'SACHET पोस्टर देखें', cg: 'SACHET पोस्टर देखव' },
    { n: '2', en: 'Scan its QR', hi: 'उसका QR स्कैन करें', cg: 'ओकर QR स्कैन करव' },
    { n: '3', en: 'Pass it on', hi: 'आगे बढ़ाएँ', cg: 'आगू बढ़ावव' },
  ]

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. The alert */}
      <div className="col-span-12 lg:col-span-7">
        {shown ? (
          <AlertVerdict key={shown} text={shown} lang={lang} latest={!opened} onSaved={() => setSaved(getSavedAlerts())} />
        ) : (
          <section className="rounded-3xl bg-forest text-card p-5 sm:p-6 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-14 -top-16 w-52 h-52 rounded-full bg-forest-2" />
            <div className="relative">
              <p className={`text-xs font-semibold text-card/70 ${lang === 'en' ? 'uppercase tracking-[0.15em]' : ''}`}>
                {L(lang, 'Alerts from your district', 'आपके ज़िले की सूचनाएँ', 'तुंहर जिला के सूचना')}
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold mt-2 leading-tight">
                {L(lang, 'No alert scanned yet', 'अभी कोई सूचना स्कैन नहीं की', 'अभी कोनो सूचना स्कैन नइ करे हव')}
              </p>
              <p className="text-base md:text-sm text-card/80 mt-2 max-w-md">
                {L(
                  lang,
                  'Police and the district cyber cell put up SACHET posters about scams going around. Scan one to check it is genuine and keep it on your phone.',
                  'पुलिस और ज़िला साइबर सेल चल रही ठगी पर SACHET पोस्टर लगाते हैं। एक स्कैन करें, जाँचें कि वह असली है, और फ़ोन में रखें।',
                  'पुलिस अउ जिला साइबर सेल चलत ठगी बर SACHET पोस्टर लगाथें। एक ठन स्कैन करव, जाँचव कि ओ असली हे, अउ फोन म रखव।',
                )}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* 2. Scan a poster */}
      <section className="col-span-12 lg:col-span-5 rounded-3xl border border-line bg-card p-5 flex flex-col gap-4 self-start">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-mint text-forest text-xl shrink-0" aria-hidden="true">
            📷
          </span>
          <div>
            <p className="text-lg md:text-base font-semibold text-ink leading-tight">
              {L(lang, 'Scan a poster QR', 'पोस्टर का QR स्कैन करें', 'पोस्टर के QR स्कैन करव')}
            </p>
            <p className="text-sm md:text-xs text-muted">{L(lang, 'Works without internet', 'बिना इंटरनेट काम करता है', 'बिना इंटरनेट चलथे')}</p>
          </div>
        </div>
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl bg-beige/70 px-2 py-3 text-center">
              <span className="mx-auto grid place-items-center w-7 h-7 rounded-full bg-forest text-card text-sm font-bold">{s.n}</span>
              <span className="block text-sm md:text-xs font-medium text-ink mt-1.5 leading-tight">{s[lang] || s.en}</span>
            </li>
          ))}
        </ol>
        <Link
          to="/citizen/check"
          state={{ tab: 'qr' }}
          className="rounded-full bg-forest text-card font-semibold px-5 py-3.5 md:py-2.5 text-lg md:text-sm text-center active:scale-95 transition hover:bg-forest-2"
        >
          {L(lang, 'Scan poster QR', 'पोस्टर QR स्कैन करें', 'पोस्टर QR स्कैन करव')}
        </Link>
      </section>

      {/* 3. Saved on this phone */}
      {sorted.length > 0 && (
        <section className="col-span-12">
          <h2 className="text-base md:text-sm font-semibold text-ink mb-2 px-1">
            {L(lang, 'Saved on this phone', 'इस फ़ोन पर सहेजी', 'ए फोन म रखे')} · {sorted.length}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {sorted.map((a) => {
              const active = a.token === shown
              return (
                <li key={a.token}>
                  <Link
                    to={{ pathname: '/citizen/alert', hash: `#${a.token}` }}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition ${
                      active ? 'border-forest bg-mint/40' : 'border-line bg-card hover:bg-beige'
                    }`}
                  >
                    <span
                      className={`grid place-items-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 ${
                        a.status === 'official' ? 'bg-mint text-forest' : 'bg-sun-tint text-warn'
                      }`}
                      title={a.status === 'official' ? 'Verified' : 'Demo signature'}
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base md:text-sm font-semibold text-ink truncate">{scamLabel(a.type, lang)}</span>
                      <span className="block text-sm md:text-xs text-muted truncate">
                        {a.district} · {fmtDate(a.issued, lang)}
                        {a.expires < today() ? ` · ${L(lang, 'ended', 'समाप्त', 'खतम')}` : ''}
                      </span>
                    </span>
                    {a.district === district && (
                      <span className="text-xs font-semibold bg-blush text-scam rounded-full px-2 py-0.5 shrink-0">
                        {L(lang, 'Your district', 'आपका ज़िला', 'तुंहर जिला')}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
