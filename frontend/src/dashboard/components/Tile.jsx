import { Link, useOutletContext } from 'react-router-dom'

// One bento tile. All tile styling lives here.
// icon: an icon component shown in a tinted chip; tint: Tailwind classes for that chip.
// The body fills the tile; pass bodyClass="overflow-auto" for lists that may be long.
export default function Tile({ title, to, icon: Icon, tint = 'bg-mint text-forest', className = '', bodyClass = '', viewAllLabel, children }) {
  let t = null
  try {
    const ctx = useOutletContext()
    t = ctx?.t
  } catch {
    // Rendered outside Outlet context
  }

  const viewText = viewAllLabel || t?.viewAll || 'View all →'

  return (
    <section
      className={`bg-card border border-line rounded-3xl p-4 flex flex-col min-w-0 min-h-0 shadow-[0_1px_0_rgba(30,42,34,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)] ${className}`}
    >
      {(title || to) && (
        <header className="flex items-center justify-between gap-2 mb-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <span className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 ${tint}`}>
                <Icon size={16} />
              </span>
            )}
            <h2 className="text-sm font-semibold text-ink truncate">{title}</h2>
          </div>
          {to && (
            <Link to={to} className="text-xs font-semibold text-forest hover:underline whitespace-nowrap">
              {viewText}
            </Link>
          )}
        </header>
      )}
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </section>
  )
}
