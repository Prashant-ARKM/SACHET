import { Link } from 'react-router-dom'
import { risingDistrict, countBy, sortedCounts, dailyValues } from '../lib/stats.js'
import { scamLabel } from '../../shared/scamTypes.js'
import Sparkline from './Sparkline.jsx'
import { C } from '../lib/theme.js'

// Dark forest headline tile: the single most important thing this week.
export default function HeroTile({ reports, onSelect, className = '' }) {
  const top = risingDistrict(reports)
  const mine = top ? reports.filter((r) => r.district === top.name) : []
  const topType = sortedCounts(countBy(mine.filter((r) => Date.now() - new Date(r.created_at) < 7 * 864e5), 'scam_type'))[0]
  const pct = top ? Math.round(top.change * 100) : 0

  return (
    <section className={`relative overflow-hidden rounded-3xl bg-forest text-card p-5 flex flex-col justify-between min-h-0 ${className}`}>
      {/* decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-20 w-64 h-64 rounded-full bg-forest-2" />
      <div className="pointer-events-none absolute right-10 -bottom-24 w-48 h-48 rounded-full bg-forest-2/60" />

      <div className="relative">
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-card/70">This week's biggest rise</div>
        {top ? (
          <>
            <h2 className={`font-display font-bold leading-tight mt-2 ${top.name.length > 11 ? 'text-3xl xl:text-4xl' : 'text-4xl xl:text-5xl'}`}>
              {top.name} <span className="text-sun">+{pct}%</span>
            </h2>
            <p className="text-sm text-card/80 mt-1">
              {top.last7} reports in 7 days (was {top.prev7})
              {topType && (
                <>
                  {' '}· mostly <span className="font-semibold text-card">{scamLabel(topType[0])}</span>
                </>
              )}
            </p>
          </>
        ) : (
          <h2 className="font-display text-3xl font-bold mt-2">No sharp rise this week</h2>
        )}
      </div>

      {top && (
        <div className="relative flex items-end justify-between gap-4 mt-3">
          <Link
            to="/official/map"
            onClick={() => onSelect(top.name)}
            className="inline-flex items-center gap-2 rounded-full bg-sun text-ink text-sm font-semibold px-4 py-2 hover:brightness-105"
          >
            See {top.name} on map →
          </Link>
          <Sparkline values={dailyValues(mine, 14)} color={C.sun} className="w-32 h-12" />
        </div>
      )}
    </section>
  )
}
