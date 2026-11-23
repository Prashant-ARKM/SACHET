import { totals, inrShort, dailyValues, previousWindow, pctChange } from '../lib/stats.js'
import { useCountUp } from '../hooks/useCountUp.js'
import { DISTRICTS } from '../../shared/districts.js'
import Sparkline from './Sparkline.jsx'
import { FileIcon, ClockIcon, RupeeIcon, MapIcon } from './icons.jsx'
import { C } from '../lib/theme.js'

// A single number tile: icon chip, animated number, change vs previous period, sparkline.
function Kpi({ label, value, format, change, upIsBad = true, spark, color, tint, Icon, vsBefore = 'vs before', className }) {
  const shown = useCountUp(value)
  const pct = change == null ? null : Math.round(change * 100)
  const bad = pct != null && (upIsBad ? pct > 0 : pct < 0)

  return (
    <div className={`bg-card border border-line rounded-3xl p-3.5 flex flex-col justify-between min-w-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)] ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted truncate">{label}</span>
        <span className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 ${tint}`}>
          <Icon size={15} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="min-w-0">
          <div className="font-display text-[26px] leading-none font-bold text-ink truncate">{format(shown)}</div>
          {pct != null && (
            <div className={`text-[11px] font-semibold mt-1 ${bad ? 'text-scam' : 'text-safe'}`}>
              {pct > 0 ? '▲' : pct < 0 ? '▼' : '•'} {Math.abs(pct)}% <span className="font-normal text-muted">{vsBefore}</span>
            </div>
          )}
        </div>
        <Sparkline values={spark} color={color} className="hidden min-[420px]:block w-16 h-8 shrink-0" />
      </div>
    </div>
  )
}

// filtered = current filters applied; scoped = same filters but every date (for "previous" + sparklines)
export default function KpiTiles({ filtered, scoped, days, t }) {
  const tot = totals(filtered)
  const prev = previousWindow(scoped, days)
  const p = prev && totals(prev)
  const districtsHit = new Set(filtered.map((r) => r.district)).size
  const lostOf = (r) => r.amount_lost || 0
  const n = (v) => Math.round(v).toLocaleString('en-IN')
  const vsBefore = t?.kpiVsBefore || 'vs before'

  return (
    <>
      <Kpi
        label={t?.kpiReports || 'Reports'}
        value={tot.count}
        format={n}
        change={p?.count ? pctChange(tot.count, p.count) : null}
        spark={dailyValues(scoped, 14)}
        color={C.forest}
        tint="bg-mint text-forest"
        Icon={FileIcon}
        vsBefore={vsBefore}
      />
      <Kpi
        label={t?.kpiLast24h || 'Last 24 hours'}
        value={tot.last24h}
        format={n}
        spark={dailyValues(scoped, 7)}
        color={C.warn}
        tint="bg-sun-tint text-warn"
        Icon={ClockIcon}
        vsBefore={vsBefore}
      />
      <Kpi
        label={t?.kpiLossReported || 'Loss reported'}
        value={tot.amountLost}
        format={(v) => inrShort(Math.round(v))}
        change={p?.amountLost ? pctChange(tot.amountLost, p.amountLost) : null}
        spark={dailyValues(scoped, 14, lostOf)}
        color={C.scam}
        tint="bg-blush text-scam"
        Icon={RupeeIcon}
        vsBefore={vsBefore}
      />
      <Kpi
        label={t?.kpiDistrictsHit || 'Districts hit'}
        value={districtsHit}
        format={(v) => `${Math.round(v)}/${DISTRICTS.length}`}
        spark={dailyValues(scoped, 14).map((v) => Math.min(v, DISTRICTS.length))}
        color={C.leaf}
        tint="bg-mint text-leaf"
        Icon={MapIcon}
        vsBefore={vsBefore}
      />
    </>
  )
}
