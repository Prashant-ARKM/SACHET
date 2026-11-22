import { useEffect, useRef, useState } from 'react'
import { SCAN_MS, LEAVE_MS } from './motion.js'

// What the loader says, per destination and language.
const TEXT = {
  citizen: {
    hi: 'आपकी सुरक्षा जाँच तैयार हो रही है…',
    cg: 'तुंहर सुरक्षा जाँच तइयार होवत हे…',
    en: 'Getting your safety check ready…',
  },
  official: {
    hi: 'ज़िलों की रिपोर्ट स्कैन हो रही हैं…',
    cg: 'ज़िला मन के रिपोर्ट स्कैन होवत हे…',
    en: 'Scanning district reports…',
  },
}
const VERDICT = { hi: 'धोखा पकड़ा गया', cg: 'ठगी पकड़ा गे', en: 'Scam caught' }

// The scanned SMS; risky words light up as the scan line crosses them.
const WORDS = [
  { text: 'आपका खाता ' },
  { text: 'आज ब्लॉक', risky: true },
  { text: ' होगा। तुरंत ' },
  { text: 'OTP भेजें', risky: true },
  { text: ' : ' },
  { text: 'bit.ly/kyc-upd', risky: true },
]

const ENTER_MS = 380 // bubble slides up before scanning starts
const PASS_MS = SCAN_MS * 0.55 // one smooth top-to-bottom pass

const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)

// Full-screen "message scan" shown when entering the citizen app or the dashboard.
export default function ScanLoader({ target = 'citizen', lang = 'hi', onDone }) {
  const bubbleRef = useRef(null)
  const lineRef = useRef(null)
  const wordRefs = useRef([])
  const [flagged, setFlagged] = useState([])
  const [verdict, setVerdict] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const bubble = bubbleRef.current
    const line = lineRef.current
    if (!bubble || !line) return
    const height = bubble.offsetHeight
    // vertical centre of each risky word inside the bubble, top to bottom
    const marks = wordRefs.current
      .map((el, i) => (el ? { i, y: el.offsetTop + el.offsetHeight / 2 } : null))
      .filter(Boolean)
      .sort((a, b) => a.y - b.y)

    let raf
    let start
    let next = 0
    const tick = (now) => {
      start ??= now
      const t = now - start - ENTER_MS
      if (t >= 0) {
        const p = Math.min(1, t / PASS_MS)
        const y = 6 + easeInOut(p) * (height - 12)
        line.style.transform = `translateY(${y}px)`
        line.classList.add('on')
        while (next < marks.length && y >= marks[next].y) {
          const idx = marks[next].i
          setFlagged((f) => [...f, idx])
          next += 1
        }
        if (p >= 1) {
          line.classList.remove('on')
          setVerdict(true)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const leave = setTimeout(() => setLeaving(true), SCAN_MS)
    const done = setTimeout(() => onDone?.(), SCAN_MS + LEAVE_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(leave)
      clearTimeout(done)
    }
  }, [onDone])

  const l = TEXT[target][lang] ? lang : 'hi'

  return (
    <div className={`sachet-overlay sachet-overlay--beige ${leaving ? 'is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="flex flex-col items-center px-6" style={{ width: 'min(88vw, 380px)' }}>
        {/* faded message above */}
        <div aria-hidden="true" className="sachet-ghost self-start bg-card text-ink/80 rounded-2xl rounded-bl-md px-4 py-2 text-sm mb-3">
          माँ: खाना खा लिया?
        </div>

        {/* main message: bright white */}
        <div className="relative w-full sachet-sms-in" style={{ animationDelay: '60ms' }}>
          <div
            ref={bubbleRef}
            className="relative bg-white text-ink rounded-3xl rounded-bl-md px-5 pt-3 pb-5 text-lg leading-9 overflow-hidden border border-line/60"
            style={{ boxShadow: '0 24px 60px -24px rgba(31, 77, 51, 0.35), 0 2px 6px rgba(31, 77, 51, 0.06)' }}
          >
            <div className="text-xs font-semibold text-muted leading-6 mb-1">VM-SBIUPD · SMS</div>
            {WORDS.map((w, i) =>
              w.risky ? (
                <span
                  key={i}
                  ref={(el) => {
                    wordRefs.current[i] = el
                  }}
                  className={`sachet-flag whitespace-nowrap ${flagged.includes(i) ? 'on' : ''}`}
                >
                  {w.text}
                </span>
              ) : (
                <span key={i}>{w.text}</span>
              ),
            )}
            <div ref={lineRef} className="sachet-scanline" />
          </div>

          {/* verdict pill */}
          <div className={`sachet-verdict ${verdict ? 'on' : ''} absolute -bottom-4 right-4 bg-scam text-card text-sm font-semibold px-4 py-1.5 rounded-full shadow-[0_8px_20px_-8px_rgba(179,38,30,0.6)]`}>
            {VERDICT[l]}
          </div>
        </div>

        {/* faded message below */}
        <div aria-hidden="true" className="sachet-ghost self-end bg-card text-ink/80 rounded-2xl rounded-br-md px-4 py-2 text-sm mt-6" style={{ animationDelay: '120ms' }}>
          बिजली बिल ₹540 जमा हो गया।
        </div>

        <div className="text-center mt-8 sachet-sms-in" style={{ animationDelay: '160ms' }}>
          <div className="font-display text-2xl font-bold text-ink">SACHET</div>
          <div className="text-sm text-muted mt-1">{TEXT[target][l]}</div>
        </div>
      </div>
    </div>
  )
}
