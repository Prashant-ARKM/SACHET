import { Link } from 'react-router-dom'

const LABEL = { hi: 'मुख्य पृष्ठ पर जाएँ', cg: 'मुख्य पन्ना म जावव', en: 'Back to start' }

// Phone-only back button to the launch page (desktop uses the exit icon in the rail).
export default function BackToStart({ lang = 'en', className = '' }) {
  const label = LABEL[lang] || LABEL.en
  return (
    <Link
      to="/"
      aria-label={label}
      title={label}
      className={`md:hidden grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-card border border-line text-forest active:scale-95 transition ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </Link>
  )
}
