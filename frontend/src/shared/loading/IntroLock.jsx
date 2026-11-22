import { useEffect, useState } from 'react'
import { INTRO_MS, LEAVE_MS, reducedMotion } from './motion.js'

const SEEN_KEY = 'sachet_intro_seen'

// Closed padlock appears, the key turns, the shackle springs open (~2 s), then the landing page.
// Plays once per browser session.
export default function IntroLock() {
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
    <div
      className={`sachet-overlay sachet-overlay--forest ${phase === 'leaving' ? 'is-leaving' : ''}`}
      role="status"
      aria-label="SACHET"
    >
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 220" className="lock-in w-40 sm:w-48 overflow-visible" aria-hidden="true">
          {/* ring that pulses out when it opens (behind) */}
          <circle className="lock-ring" cx="100" cy="148" r="62" fill="none" stroke="#F2B33D" strokeWidth="3" />
          {/* shackle: starts closed; right leg is longer so it stays in the body when open */}
          <path
            className="lock-shackle"
            d="M66 110 V74 a34 34 0 0 1 68 0 V136"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* body + keyhole */}
          <g className="lock-body">
            <rect x="38" y="104" width="124" height="98" rx="24" fill="#FFFDF8" />
            <circle className="lock-keyhole" cx="100" cy="144" r="11" />
            <rect className="lock-keyhole" x="95.5" y="148" width="9" height="24" rx="4.5" />
          </g>
        </svg>

        <div className="lock-label text-center mt-4">
          <div className="font-display text-3xl font-bold text-card">SACHET</div>
          <div className="text-sm text-sun mt-1">
            सचेत रहें <span className="tracking-[0.3em]">· STAY ALERT</span>
          </div>
        </div>
      </div>
    </div>
  )
}
