import { useEffect } from 'react'
import QrCode from '../../shared/QrCode.jsx'
import { alertUrl } from '../../shared/alertSign.js'

const L = (lang, en, hi, cg) => (lang === 'hi' ? hi : lang === 'cg' ? cg : en)

// Full-screen QR so the next person can scan the alert from this phone (the relay).
export default function RelayQr({ token, status, label, district, lang = 'en', onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const size = Math.min(340, typeof window !== 'undefined' ? window.innerWidth - 64 : 320)
  return (
    <div
      className="fixed inset-0 z-[2000] bg-card flex flex-col items-center justify-center gap-5 p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={L(lang, 'Alert QR', 'सूचना QR', 'सूचना QR')}
    >
      <p className="font-display text-2xl font-bold text-ink text-center">
        {L(lang, 'Scan with SACHET', 'SACHET से स्कैन करें', 'SACHET ले स्कैन करव')}
      </p>
      <p className="text-base text-muted text-center -mt-3">
        {label} · {district}
      </p>
      <div className="rounded-3xl border border-line p-3 bg-white">
        <QrCode text={alertUrl(token)} size={size} />
      </div>
      {status === 'demo' && <p className="text-xs font-semibold uppercase tracking-[0.15em] text-warn">Demo signature</p>}
      <p className="text-sm text-muted text-center max-w-xs">
        {L(
          lang,
          'Works without internet. Their phone checks the signature itself.',
          'बिना इंटरनेट काम करता है। उनका फ़ोन खुद हस्ताक्षर जाँचता है।',
          'बिना इंटरनेट चलथे। ओकर फोन खुदे दस्तखत जाँचथे।',
        )}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-forest text-card font-semibold px-8 py-3 text-lg active:scale-95 transition"
      >
        {L(lang, 'Done', 'बंद करें', 'बंद करव')}
      </button>
    </div>
  )
}
