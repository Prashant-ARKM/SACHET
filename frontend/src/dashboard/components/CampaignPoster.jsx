// A4 awareness posters (794 × 1123 px = A4 at 96 dpi). Rendered full size; the preview scales it down.
// Style 'A' = bold warning, style 'B' = calm myth-buster.
// qr: optional element for a signed-alert QR (added by the alerts feature); without it the site link shows.

import { useLayoutEffect, useRef } from 'react'
import QrCode from '../../shared/QrCode.jsx'
import Highlighted from '../../shared/Highlighted.jsx'
import { showId } from '../../shared/alertSign.js'

const SITE = 'sachet-pi.vercel.app'

// Middle of the poster. If long text would overflow the page, it zooms the block down to fit,
// so the 1930 footer is never cut off.
function FitBox({ className = '', children }) {
  const ref = useRef(null)
  // Runs after every render: measure at full size, then zoom the block down only if it overflows.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.zoom = '1'
      const need = el.scrollHeight
      const have = el.clientHeight
      el.style.zoom = need > have + 1 ? String(Math.max(0.65, have / need)) : ''
    }
    fit()
    document.fonts?.ready.then(fit)
  })
  return (
    <div ref={ref} className={`flex-1 min-h-0 overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  )
}

function Mark({ className = '' }) {
  return (
    <span className={`grid place-items-center rounded-2xl bg-card/15 font-display font-bold ${className}`}>स</span>
  )
}

// Small label. Letter-spacing only on Latin text: spacing breaks Devanagari letter joins.
function Kicker({ lang, text, en, className = '', track = 'tracking-[0.2em]' }) {
  return (
    <div className={`text-[22px] font-semibold ${className}`}>
      <span className={lang === 'en' ? `uppercase ${track}` : ''}>{text}</span>
      {lang !== 'en' && en && <span className={`uppercase ${track}`}> · {en}</span>}
    </div>
  )
}

const SCAN = { hi: 'स्कैन करके जाँचें', cg: 'स्कैन करके जाँचव', en: 'Scan to check it is genuine' }

// Signed alert QR for the poster footer. demo: the alert was signed with the demo key (no server key yet).
export function PosterQr({ url, lang = 'hi', dark = false, demo = false, size = 200 }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-2xl bg-white p-2">
        <QrCode text={url} size={size} />
      </div>
      <div className={`text-[17px] font-semibold text-center leading-tight ${dark ? 'text-card' : 'text-forest'}`}>
        {SCAN[lang] || SCAN.en}
        {lang !== 'en' && <div className="text-[13px] font-medium opacity-75">Scan to verify</div>}
      </div>
      {demo && (
        <div className={`text-[12px] font-semibold uppercase tracking-[0.15em] ${dark ? 'text-sun' : 'text-warn'}`}>Demo signature</div>
      )}
    </div>
  )
}

// Scammer IDs the official approved (reported by citizens). Phone shown as 98765 43210.
const ID_ICON = { p: '📞', u: '₹', l: '🔗' }

function BlockedIds({ kit, className = '' }) {
  if (!kit.blocked?.length) return null
  return (
    <div className={className}>
      <div className="text-[22px] text-muted">{kit.frame.blocked}</div>
      <div className="mt-3 flex flex-wrap gap-3">
        {kit.blocked.slice(0, 4).map((x) => (
          <span key={x.kind + x.value} className="inline-flex items-center gap-2 rounded-2xl bg-blush text-scam px-5 py-2.5 text-[24px] font-semibold">
            <span className="text-[20px]">{ID_ICON[x.kind]}</span>
            <span className="font-mono tracking-tight">{showId(x)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Footnote({ dark }) {
  return (
    <div className={`text-[15px] ${dark ? 'text-card/70' : 'text-muted'}`}>
      cybercrime.gov.in · Chakshu (sancharsaathi.gov.in)
    </div>
  )
}

function PosterA({ kit, qr }) {
  const { frame, content, label, district, evidenceLine, lang } = kit
  return (
    <div className="w-[794px] h-[1123px] bg-card text-ink flex flex-col overflow-hidden">
      {/* alarm header */}
      <div className="bg-scam text-card px-14 pt-11 pb-9 shrink-0">
        <Kicker lang={lang} text={frame.beware} en="BEWARE" className="opacity-90" track="tracking-[0.3em]" />
        <div className="font-display font-bold text-[84px] leading-[1.05] mt-3">{label}</div>
        <div className="text-[26px] mt-4 opacity-90">
          {frame.district}: <span className="font-semibold">{district}</span>
        </div>
      </div>

      <FitBox className="px-14 py-9 gap-7">
        {evidenceLine && (
          <div className="self-start bg-blush text-scam rounded-2xl px-6 py-3 text-[24px] font-semibold">{evidenceLine}</div>
        )}

        <div>
          <Kicker lang={lang} text={frame.doThis} className="text-muted" />
          <ol className="mt-4 space-y-4">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex gap-5 items-start text-[28px] leading-snug">
                <span className="shrink-0 grid place-items-center w-[52px] h-[52px] rounded-full bg-forest text-card text-[26px] font-bold">
                  {i + 1}
                </span>
                <span className="pt-1">{tip}</span>
              </li>
            ))}
          </ol>
        </div>

        <BlockedIds kit={kit} />

        <div className="mt-auto">
          <div className="text-[22px] text-muted">{kit.real ? frame.realMessage : frame.watchFor}</div>
          <div className="mt-3 space-y-3">
            {content.lines.map((line, i) => (
              <div key={i} className="bg-beige rounded-2xl px-6 py-3 text-[26px] italic">
                “<Highlighted text={line} words={kit.real?.keywords} />”
              </div>
            ))}
          </div>
        </div>
      </FitBox>

      {/* helpline footer */}
      <div className="bg-forest text-card px-14 py-8 flex items-center justify-between gap-8 shrink-0">
        <div>
          <div className="text-[24px] opacity-85">{frame.lostMoney}</div>
          <div className="font-display font-bold text-[110px] leading-none text-sun mt-1">1930</div>
          <div className="mt-3">
            <Footnote dark />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 shrink-0">
          {qr || (
            <>
              <Mark className="w-[96px] h-[96px] text-[56px]" />
              <div className="font-display font-bold text-[30px]">SACHET</div>
              <div className="text-[16px] opacity-75">{SITE}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PosterB({ kit, qr }) {
  const { frame, content, district, evidenceLine, lang } = kit
  return (
    <div className="w-[794px] h-[1123px] bg-beige text-ink flex flex-col overflow-hidden">
      {/* brand header */}
      <div className="bg-forest text-card px-14 py-7 flex items-center gap-5 shrink-0">
        <Mark className="w-[72px] h-[72px] text-[42px]" />
        <div>
          <div className="font-display font-bold text-[34px] leading-none">SACHET · सचेत</div>
          <div className="text-[20px] opacity-80 mt-2">
            {district} {frame.district} · {frame.awareness}
          </div>
        </div>
      </div>

      <FitBox className="px-14 pt-10 pb-7 gap-7">
        <div>
          <Kicker lang={lang} text={frame.knowTruth} en="KNOW THE TRUTH" className="text-warn" track="tracking-[0.25em]" />
          <div className="font-display font-bold text-[50px] leading-[1.15] mt-3">{content.truth}</div>
        </div>

        <div>
          <div className="text-[22px] text-muted">{kit.real ? frame.realMessage : frame.watchFor}</div>
          <div className="mt-3 space-y-3">
            {content.lines.map((line, i) => (
              <div key={i} className="bg-card rounded-2xl px-6 py-3 text-[24px] leading-snug flex gap-4 items-start">
                <span className="text-scam font-bold">✗</span>
                <span className="italic">
                  “<Highlighted text={line} words={kit.real?.keywords} />”
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Kicker lang={lang} text={frame.doThis} className="text-muted" />
          <div className="mt-3 space-y-3">
            {content.tips.map((tip, i) => (
              <div key={i} className="bg-mint rounded-2xl px-6 py-3 text-[24px] leading-snug flex gap-4 items-start">
                <span className="text-forest font-bold">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <BlockedIds kit={kit} />

        {evidenceLine && <div className="text-[20px] text-muted mt-auto">{evidenceLine}</div>}
      </FitBox>

      {/* footer: 1930 + verify/site */}
      <div className="px-14 pb-11 flex items-end justify-between gap-8 shrink-0">
        <div>
          <div className="inline-flex items-center gap-4 bg-scam text-card rounded-full px-9 py-5">
            <span className="text-[26px]">{frame.callShort.replace('1930', '').trim()}</span>
            <span className="font-display font-bold text-[52px] leading-none">1930</span>
          </div>
          <div className="mt-4">
            <Footnote />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          {qr || (
            <>
              <div className="font-display font-bold text-[26px] text-forest">SACHET</div>
              <div className="text-[16px] text-muted">{SITE}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CampaignPoster({ kit, style = 'B', qr }) {
  return style === 'A' ? <PosterA kit={kit} qr={qr} /> : <PosterB kit={kit} qr={qr} />
}
