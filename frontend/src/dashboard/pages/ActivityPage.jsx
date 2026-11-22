import { useDashboard } from '../hooks/useDashboard.js'
import Tile from '../components/Tile.jsx'
import { PulseIcon, BarsIcon } from '../components/icons.jsx'
import ActivityFeed, { CHANNEL_LABEL } from '../components/ActivityFeed.jsx'
import { countBy, sortedCounts } from '../lib/stats.js'

export default function ActivityPage() {
  const { filtered } = useDashboard()
  const channels = sortedCounts(countBy(filtered, 'channel'))
  const total = Math.max(1, filtered.length)

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      <Tile title="Latest reports · click a row for details" icon={PulseIcon} tint="bg-blush text-scam" className="col-span-12 lg:col-span-8" bodyClass="overflow-auto pr-1 max-h-[480px] lg:max-h-none">
        <ActivityFeed reports={filtered} limit={50} />
      </Tile>
      <Tile title="How scams reach people" icon={BarsIcon} tint="bg-sun-tint text-warn" className="col-span-12 lg:col-span-4 lg:self-start">
        <ul className="space-y-3">
          {channels.map(([ch, n]) => (
            <li key={ch} className="text-sm">
              <div className="flex justify-between">
                <span>{CHANNEL_LABEL[ch] ?? ch}</span>
                <span className="font-semibold">{Math.round((n / total) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-beige rounded-full mt-1.5">
                <div className="h-1.5 rounded-full bg-forest" style={{ width: `${(n / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Tile>
    </div>
  )
}
