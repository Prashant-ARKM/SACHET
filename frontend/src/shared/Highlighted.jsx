import { normWord } from './alertSign.js'

// Real scam message with the ML-flagged words marked.
export default function Highlighted({ text, words = [], markClass = 'text-scam font-bold not-italic' }) {
  const keys = words.map(normWord).filter((k) => k.length >= 2)
  if (!keys.length) return text
  return text.split(/(\s+)/).map((part, i) => {
    const n = normWord(part)
    return n && keys.some((k) => n.includes(k)) ? (
      <span key={i} className={markClass}>
        {part}
      </span>
    ) : (
      part
    )
  })
}
