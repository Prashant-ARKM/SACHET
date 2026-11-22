import { useEffect, useState } from 'react'
import { INTRO_MS, LEAVE_MS, reducedMotion } from './motion.js'

const SEEN_KEY = 'sachet_intro_seen'

// Handwritten "सचेत" that draws itself, shown once per browser session before the launch page.
export default function IntroWrite() {
  // Decided once on mount: skip if already seen this session or animations are off.
  const [skip] = useState(() => {
    try {
      return reducedMotion() || Boolean(sessionStorage.getItem(SEEN_KEY))
    } catch {
      return false
    }
  })
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    if (skip) return
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
    const leave = setTimeout(() => setPhase('leaving'), INTRO_MS)
    const done = setTimeout(() => setPhase('done'), INTRO_MS + LEAVE_MS)
    return () => {
      clearTimeout(leave)
      clearTimeout(done)
    }
  }, [skip])

  if (skip || phase === 'done') return null

  return (
    <div className={`sachet-overlay sachet-overlay--forest ${phase === 'leaving' ? 'is-leaving' : ''}`} role="status" aria-label="SACHET">
      <svg viewBox="0 0 320 150" style={{ width: 'min(78vw, 520px)' }} className="sachet-write-wrap" aria-hidden="true">
        <text
          x="160"
          y="92"
          textAnchor="middle"
          fontSize="92"
          fontWeight="700"
          fontFamily="'Tiro Devanagari Hindi', 'Noto Serif Devanagari', 'Nirmala UI', serif"
          className="sachet-write"
        >
          सचेत
        </text>
        <text
          x="160"
          y="134"
          textAnchor="middle"
          fontSize="13"
          fill="#F2B33D"
          className="sachet-fade-up"
        >
          <tspan>सचेत रहें</tspan>
          <tspan letterSpacing="4"> · STAY ALERT</tspan>
        </text>
      </svg>
    </div>
  )
}
