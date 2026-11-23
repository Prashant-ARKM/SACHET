import { useEffect, useState } from 'react'
import { verifyAlert, saveAlert, alertUrl, showId } from '../../shared/alertSign.js'
import { buildCampaign } from '../../dashboard/data/campaignTemplates.js'
import Highlighted from '../../shared/Highlighted.jsx'
import RelayQr from './RelayQr.jsx'

const L = (lang, en, hi, cg) => (lang === 'hi' ? hi : lang === 'cg' ? cg : en)

export const fmtDate = (iso, lang) => {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

const HEAD = {
  official: 'bg-mint text-forest',
  demo: 'bg-sun-tint text-warn',
  invalid: 'bg-blush text-scam',
  unsupported: 'bg-sun-tint text-warn',
}

// One card for a scanned / saved SACHET alert: signature check, what it says, and "pass it on".
// text: QR text or bare token. Checked on the phone (WebCrypto), works offline. Genuine alerts are saved.
export default function AlertVerdict({ text, lang = 'en', onSaved, latest = false }) {
  const [res, setRes] = useState(null)
  const [relay, setRelay] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    let live = true
    setRes(null)
    verifyAlert(text).then((r) => {
      if (!live) return
      setRes(r)
      saveAlert(r)
      onSaved?.()
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  if (!res) {
    return (
      <div className="rounded-3xl border border-line bg-card p-5 text-base md:text-sm text-muted">
        {L(lang, 'Checking signature…', 'हस्ताक्षर जाँच रहे हैं…', 'दस्तखत जाँचत हन…')}
      </div>
    )
  }

  const { status, alert, token } = res
  const genuine = status === 'official' || status === 'demo'
  const real = alert?.message ? { quote: alert.message, keywords: alert.keywords } : null
  const kit = alert ? buildCampaign({ district: alert.district, type: alert.type, lang, real }) : null

  const title =
    status === 'official'
      ? L(lang, 'Genuine SACHET alert', 'असली SACHET सूचना', 'असली SACHET सूचना')
      : status === 'demo'
      ? L(lang, 'Signature valid · demo', 'हस्ताक्षर सही · डेमो', 'दस्तखत सही · डेमो')
      : status === 'unsupported'
      ? L(lang, "Can't check on this phone", 'इस फ़ोन पर जाँच नहीं हो सकती', 'ए फोन म जाँच नइ हो सकय')
      : L(lang, 'NOT a genuine alert', 'यह असली सूचना नहीं है', 'ए असली सूचना नो हे')

  const share = async () => {
    const url = alertUrl(token)
    const head = `SACHET · ${kit?.label} · ${alert?.district}`
    try {
      if (navigator.share) return await navigator.share({ title: head, text: `${head}\n${kit?.content.truth}`, url })
      await navigator.clipboard.writeText(url)
      setNote(L(lang, 'Link copied', 'लिंक कॉपी हुआ', 'लिंक कॉपी होगे'))
      setTimeout(() => setNote(''), 1800)
    } catch {
      // share sheet closed
    }
  }

  return (
    <article className="rounded-3xl border border-line bg-card overflow-hidden shadow-[0_1px_0_rgba(30,42,34,0.04)] animate-fadeIn">
      {/* signature result */}
      <header className={`flex items-center justify-between gap-3 px-4 py-3 ${HEAD[status] || HEAD.invalid}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-card text-base font-bold shrink-0">
            {genuine ? '✓' : status === 'unsupported' ? '!' : '✗'}
          </span>
          <div className="min-w-0">
            <p className="text-base md:text-sm font-bold leading-tight">{title}</p>
            {latest && genuine && (
              <p className="text-xs font-medium opacity-80">{L(lang, 'Latest for your district', 'आपके ज़िले की नई सूचना', 'तुंहर जिला के नवा सूचना')}</p>
            )}
          </div>
        </div>
        {alert && (
          <span className="text-sm md:text-xs font-semibold opacity-80 shrink-0">
            {alert.district} · {fmtDate(alert.issued, lang)}
          </span>
        )}
      </header>

      {!genuine && (
        <p className="px-4 py-4 text-base md:text-sm text-ink">
          {status === 'unsupported'
            ? L(lang, 'Open it in Chrome to check the signature.', 'हस्ताक्षर जाँचने के लिए Chrome में खोलें।', 'दस्तखत जाँचे बर Chrome म खोलव।')
            : L(
                lang,
                'This QR was changed or faked. Do not follow anything it says, and do not pay or call any number from it.',
                'यह QR बदला गया है या नकली है। इसकी किसी बात पर भरोसा न करें, न पैसे दें, न इसके किसी नंबर पर कॉल करें।',
                'ए QR बदले गे हे या नकली हे। एकर कोनो बात म भरोसा झन करव, न पइसा देवव, न एकर कोनो नंबर म फोन करव।',
              )}
        </p>
      )}

      {genuine && kit && (
        <>
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm md:text-xs font-semibold bg-blush text-scam px-2.5 py-1 rounded-full">{kit.label}</span>
              {alert.expired && (
                <span className="text-sm md:text-xs font-semibold text-warn">
                  {L(lang, `Ended ${fmtDate(alert.expires, lang)}`, `${fmtDate(alert.expires, lang)} को समाप्त`, `${fmtDate(alert.expires, lang)} के खतम`)}
                </span>
              )}
            </div>

            <p className="font-display text-xl md:text-lg font-bold text-ink leading-snug">{kit.content.truth}</p>

            {real ? (
              <div className="rounded-2xl bg-beige/70 px-3.5 py-3">
                <p className="text-xs font-semibold text-muted mb-1">{kit.frame.realMessage}</p>
                <p className="text-base md:text-sm italic text-ink">
                  “<Highlighted text={real.quote} words={alert.keywords} />”
                </p>
              </div>
            ) : (
              <p className="text-base md:text-sm text-ink">
                <span className="text-scam font-bold">✗</span> <span className="italic">“{kit.content.lines[0]}”</span>
              </p>
            )}

            {alert.blocked?.length > 0 && (
              <div className="rounded-2xl bg-blush/60 border border-scam/15 px-3.5 py-3">
                <p className="text-xs font-semibold text-scam mb-1.5">{kit.frame.blocked}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {alert.blocked.map((x) => (
                    <li key={x.kind + x.value} className="inline-flex items-center gap-1.5 rounded-full bg-card border border-scam/20 px-2.5 py-1 text-sm md:text-xs">
                      <span aria-hidden="true">{x.kind === 'p' ? '📞' : x.kind === 'u' ? '₹' : '🔗'}</span>
                      <span className="font-mono font-semibold text-ink">{showId(x)}</span>
                      <span className="text-scam font-semibold">×{x.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="space-y-1">
              {kit.content.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-base md:text-sm text-ink">
                  <span className="text-forest font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            {(alert.keywords?.length > 0 || alert.blocked?.length > 0) && (
              <details className="group rounded-2xl border border-dashed border-forest/30 px-3.5 py-2.5">
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm md:text-xs font-semibold text-forest">
                  {L(
                    lang,
                    `SACHET on this phone now watches for ${alert.blocked?.length ? `${alert.blocked.length} scammer IDs` : ''}${alert.blocked?.length && alert.keywords?.length ? ' and ' : ''}${alert.keywords?.length ? `${alert.keywords.length} words` : ''}`,
                    `अब इस फ़ोन का SACHET ${alert.blocked?.length ? `${alert.blocked.length} ठग नंबर/ID` : ''}${alert.blocked?.length && alert.keywords?.length ? ' और ' : ''}${alert.keywords?.length ? `${alert.keywords.length} शब्दों` : ''} पर नज़र रखेगा`,
                    `अब ए फोन के SACHET ${alert.blocked?.length ? `${alert.blocked.length} ठग नंबर/ID` : ''}${alert.blocked?.length && alert.keywords?.length ? ' अउ ' : ''}${alert.keywords?.length ? `${alert.keywords.length} सब्द` : ''} म नजर रखही`,
                  )}
                  <span className="transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="text-sm md:text-xs text-muted mt-1.5">
                  {L(
                    lang,
                    'If a message or payment QR you check has one of these numbers or IDs, or these words (picked by our ML model from the real message), SACHET warns you, even offline.',
                    'जाँचे गए संदेश या भुगतान QR में इनमें से कोई नंबर/ID, या ये शब्द (असली संदेश से हमारे ML मॉडल ने चुने) हों, तो SACHET चेतावनी देगा, बिना इंटरनेट भी।',
                    'जाँचे संदेस या पेमेंट QR म एमा ले कोनो नंबर/ID, या ए सब्द (असली संदेस ले हमर ML मॉडल चुनिस) रहिहीं, त SACHET चेताही, बिना इंटरनेट घलो।',
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {alert.keywords.map((w) => (
                    <span key={w} className="text-sm md:text-xs font-semibold bg-blush text-scam rounded-full px-2.5 py-0.5">
                      {w}
                    </span>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* pass it on: stays in view while the card scrolls */}
          <footer className="sticky bottom-24 md:bottom-0 bg-card/95 backdrop-blur px-4 py-3 border-t border-line flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRelay(true)}
              className="flex-1 sm:flex-none rounded-full bg-forest text-card font-semibold px-5 py-3 md:py-2 text-base md:text-sm active:scale-95 transition"
            >
              {L(lang, 'Pass it on · show QR', 'आगे बढ़ाएँ · QR दिखाएँ', 'आगू बढ़ावव · QR देखावव')}
            </button>
            <button
              type="button"
              onClick={share}
              aria-label={L(lang, 'Share link', 'लिंक भेजें', 'लिंक भेजव')}
              className="rounded-full border border-line bg-card text-ink font-semibold px-4 py-3 md:py-2 text-base md:text-sm active:scale-95 transition"
            >
              {note || L(lang, 'Share', 'भेजें', 'भेजव')}
            </button>
            <a href="tel:1930" className="hidden sm:inline-flex ml-auto text-sm md:text-xs font-semibold text-scam hover:underline">
              {L(lang, 'Lost money? 1930', 'पैसे कटे? 1930', 'पइसा कटगे? 1930')}
            </a>
          </footer>
        </>
      )}

      {relay && <RelayQr token={token} status={status} label={kit?.label} district={alert?.district} lang={lang} onClose={() => setRelay(false)} />}
    </article>
  )
}
