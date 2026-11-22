export default function Header({ source, updatedAt }) {
  const badge =
    source === 'live'
      ? { text: 'LIVE', cls: 'bg-green-100 text-green-800' }
      : source === 'sample'
        ? { text: 'SAMPLE DATA · server offline', cls: 'bg-amber-100 text-amber-800' }
        : { text: 'Loading…', cls: 'bg-gray-100 text-gray-600' }

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-lg font-bold">SACHET · Scam Trends</h1>
        <p className="text-xs text-gray-500">Anonymised reports · Chhattisgarh · simulated locations</p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={`px-2 py-1 rounded font-semibold ${badge.cls}`}>{badge.text}</span>
        {updatedAt && <span className="text-gray-500">Updated {updatedAt.toLocaleTimeString()}</span>}
      </div>
    </header>
  )
}
