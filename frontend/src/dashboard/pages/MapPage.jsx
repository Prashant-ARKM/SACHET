import { useState, useMemo } from 'react'
import { useDashboard } from '../hooks/useDashboard.js'
import DistrictMap, { SCAM_COLORS } from '../components/DistrictMap.jsx'
import { DISTRICTS } from '../../shared/districts.js'
import { SCAM_TYPES, scamLabel } from '../../shared/scamTypes.js'
import { countBy, inr, sortedCounts } from '../lib/stats.js'
import { MapIcon } from '../components/icons.jsx'

const DAY = 86400000

const STRINGS = {
  en: {
    district: 'District',
    timeline: 'Timeline',
    scamType: 'Scam Type',
    sortBy: 'Sort By',
    allDistricts: 'All districts',
    allScamTypes: 'All scam types',
    h24: '24 Hours',
    d7: '7 Days',
    d30: '30 Days',
    allTime: 'All Time',
    repDesc: 'Reports (High to Low)',
    repAsc: 'Reports (Low to High)',
    lostDesc: 'Money Lost (High to Low)',
    lostAsc: 'Money Lost (Low to High)',
    changeDesc: '% Change (High to Low)',
    changeAsc: '% Change (Low to High)',
    thDistrict: 'District',
    thType: 'Scam Type',
    thReports: 'Reports',
    thChange: '% Change',
    thTopType: 'Top Type',
    thLost: 'Money Lost',
    noData: 'No reports found for the selected criteria.',
    clickToFocus: 'Click a row to focus on map',
    reset: 'Reset Map',
    cgMapTitle: 'Chhattisgarh State Map',
    allScamsGeneral: 'All Scams (Red)',
  },
  hi: {
    district: 'ज़िला',
    timeline: 'समय सीमा',
    scamType: 'ठगी प्रकार',
    sortBy: 'क्रमबद्ध करें',
    allDistricts: 'सभी ज़िले',
    allScamTypes: 'सभी प्रकार',
    h24: '24 घंटे',
    d7: '7 दिन',
    d30: '30 दिन',
    allTime: 'सम्पूर्ण समय',
    repDesc: 'रिपोर्ट्स (अधिक से कम)',
    repAsc: 'रिपोर्ट्स (कम से अधिक)',
    lostDesc: 'नुकसान (अधिक से कम)',
    lostAsc: 'नुकसान (कम से अधिक)',
    changeDesc: '% बदलाव (अधिक से कम)',
    changeAsc: '% बदलाव (कम से अधिक)',
    thDistrict: 'ज़िला',
    thType: 'ठगी का प्रकार',
    thReports: 'रिपोर्ट्स',
    thChange: '% बदलाव',
    thTopType: 'मुख्य प्रकार',
    thLost: 'रकम नुकसान',
    noData: 'चयनित मापदंडों के अनुसार कोई रिपोर्ट नहीं मिली।',
    clickToFocus: 'मानचित्र पर देखने के लिए क्लिक करें',
    reset: 'नक्शा रीसेट',
    cgMapTitle: 'छत्तीसगढ़ राज्य मानचित्र',
    allScamsGeneral: 'सभी ठगी (सामान्य लाल)',
  },
  cg: {
    district: 'जिल्ला',
    timeline: 'समय',
    scamType: 'ठगी प्रकार',
    sortBy: 'क्रम',
    allDistricts: 'सबो जिल्ला',
    allScamTypes: 'सबो ठगी प्रकार',
    h24: '24 घंटा',
    d7: '7 दिन',
    d30: '30 दिन',
    allTime: 'सबो समय',
    repDesc: 'रिपोर्ट (ज्यादा ले कम)',
    repAsc: 'रिपोर्ट (कम ले ज्यादा)',
    lostDesc: 'नुकसान (ज्यादा ले कम)',
    lostAsc: 'नुकसान (कम ले ज्यादा)',
    changeDesc: '% बदलाव (ज्यादा ले कम)',
    changeAsc: '% बदलाव (कम ले ज्यादा)',
    thDistrict: 'जिल्ला',
    thType: 'ठगी के प्रकार',
    thReports: 'रिपोर्ट्स',
    thChange: '% बदलाव',
    thTopType: 'प्रमुख ठगी',
    thLost: 'पैसा गँवाए',
    noData: 'चुने हुए हिसाब से कोई रिपोर्ट नइ मिले हे।',
    clickToFocus: 'नक्शा म देखे बर दबाओ',
    reset: 'नक्शा रीसेट',
    cgMapTitle: 'छत्तीसगढ़ राज्य नक्शा',
    allScamsGeneral: 'सबो ठगी (सामान्य लाल)',
  },
}

export default function MapPage() {
  const { reports: allReports = [], lang = 'en', t } = useDashboard()
  const loc = STRINGS[lang] || STRINGS.en

  // 4 Dropdown States
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [timeLine, setTimeLine] = useState(30) // 1, 7, 30, 0
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('reports_desc')

  // Filter raw reports by timeline
  const now = useMemo(() => Date.now(), [allReports])

  const filteredByTime = useMemo(() => {
    if (!timeLine) return allReports
    const since = now - timeLine * DAY
    return allReports.filter((r) => new Date(r.created_at).getTime() >= since)
  }, [allReports, timeLine, now])

  // Reports in the matching previous window for accurate % change
  const prevWindowReports = useMemo(() => {
    const days = timeLine || 30
    return allReports.filter((r) => {
      const age = now - new Date(r.created_at).getTime()
      return age >= days * DAY && age < 2 * days * DAY
    })
  }, [allReports, timeLine, now])

  // Reports filtered for the Map (timeline + scam type)
  const mapReports = useMemo(() => {
    if (!selectedType) return filteredByTime
    return filteredByTime.filter((r) => r.scam_type === selectedType)
  }, [filteredByTime, selectedType])

  // ==========================================
  // Tabular Data: Mode A (Single District)
  // ==========================================
  const singleDistrictData = useMemo(() => {
    if (!selectedDistrict) return null

    const districtReports = filteredByTime.filter((r) => r.district === selectedDistrict)
    const prevDistrictReports = prevWindowReports.filter((r) => r.district === selectedDistrict)

    const counts = countBy(districtReports, 'scam_type')
    const prevCounts = countBy(prevDistrictReports, 'scam_type')

    const lostByType = {}
    districtReports.forEach((r) => {
      lostByType[r.scam_type] = (lostByType[r.scam_type] || 0) + (r.amount_lost || 0)
    })

    // If a scam type is specifically selected, restrict to it, else show all with reports
    let typesToDisplay = SCAM_TYPES
    if (selectedType) {
      typesToDisplay = SCAM_TYPES.filter((st) => st.id === selectedType)
    } else {
      typesToDisplay = SCAM_TYPES.filter((st) => (counts[st.id] ?? 0) > 0 || (prevCounts[st.id] ?? 0) > 0)
      if (typesToDisplay.length === 0) {
        typesToDisplay = SCAM_TYPES.slice(0, 5)
      }
    }

    const rows = typesToDisplay.map((st) => {
      const count = counts[st.id] ?? 0
      const prev = prevCounts[st.id] ?? 0
      const change = prev > 0 ? (count - prev) / prev : count > 0 ? 1 : 0
      const lost = lostByType[st.id] ?? 0
      return {
        typeId: st.id,
        name: st[lang] || st.en,
        count,
        prev,
        change,
        lost,
      }
    })

    // Apply Sort
    rows.sort((a, b) => {
      switch (sortBy) {
        case 'reports_desc': return b.count - a.count || b.lost - a.lost
        case 'reports_asc': return a.count - b.count || a.lost - b.lost
        case 'lost_desc': return b.lost - a.lost || b.count - a.count
        case 'lost_asc': return a.lost - b.lost || a.count - b.count
        case 'change_desc': return b.change - a.change || b.count - a.count
        case 'change_asc': return a.change - b.change || a.count - b.count
        default: return b.count - a.count
      }
    })

    const totalCount = districtReports.length
    const totalLost = districtReports.reduce((s, r) => s + (r.amount_lost || 0), 0)

    return { rows, totalCount, totalLost }
  }, [selectedDistrict, filteredByTime, prevWindowReports, selectedType, sortBy, lang])

  // ==========================================
  // Tabular Data: Mode B (All Districts)
  // ==========================================
  const allDistrictsData = useMemo(() => {
    if (selectedDistrict) return []

    const currentMap = selectedType
      ? filteredByTime.filter((r) => r.scam_type === selectedType)
      : filteredByTime

    const prevMap = selectedType
      ? prevWindowReports.filter((r) => r.scam_type === selectedType)
      : prevWindowReports

    const counts = countBy(currentMap, 'district')
    const prevCounts = countBy(prevMap, 'district')

    const rows = DISTRICTS.map((d) => {
      const mine = currentMap.filter((r) => r.district === d.name)
      const count = counts[d.name] ?? 0
      const prev = prevCounts[d.name] ?? 0
      const change = prev > 0 ? (count - prev) / prev : count > 0 ? 1 : 0
      const lost = mine.reduce((s, r) => s + (r.amount_lost || 0), 0)
      const topType = sortedCounts(countBy(mine, 'scam_type'))[0]?.[0] || ''

      return {
        name: d.name,
        count,
        prev,
        change,
        lost,
        topType,
      }
    })

    // Apply Sort
    rows.sort((a, b) => {
      switch (sortBy) {
        case 'reports_desc': return b.count - a.count || b.lost - a.lost
        case 'reports_asc': return a.count - b.count || a.lost - b.lost
        case 'lost_desc': return b.lost - a.lost || b.count - a.count
        case 'lost_asc': return a.lost - b.lost || a.count - b.count
        case 'change_desc': return b.change - a.change || b.count - a.count
        case 'change_asc': return a.change - b.change || a.count - b.count
        default: return b.count - a.count
      }
    })

    return rows
  }, [selectedDistrict, filteredByTime, prevWindowReports, selectedType, sortBy])

  const activeColor = selectedType ? (SCAM_COLORS[selectedType] || '#B3261E') : '#B3261E'

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      {/* ======================================================== */}
      {/* 2. Map Box: Full CG Map by default, pops up on selection */}
      {/* ======================================================== */}
      <div className="col-span-12 lg:col-span-7 bg-card rounded-2xl border border-line shadow-xs p-3.5 flex flex-col h-[520px] lg:h-full min-h-[460px]">
        {/* Map Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-line">
          <div className="flex items-center gap-2">
            <MapIcon size={18} className="text-forest" />
            <h2 className="font-semibold text-sm text-ink">
              {selectedDistrict
                ? `${selectedDistrict} ${lang === 'hi' ? 'ज़िला' : lang === 'cg' ? 'जिल्ला' : 'District'}`
                : loc.cgMapTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
              style={{ backgroundColor: activeColor }}
            />
            <span className="text-muted font-medium">
              {selectedType ? scamLabel(selectedType, lang) : loc.allScamsGeneral}
            </span>
            {selectedDistrict && (
              <button
                type="button"
                onClick={() => setSelectedDistrict('')}
                className="ml-2 text-xs text-forest hover:text-forest2 hover:underline font-semibold"
              >
                {loc.reset}
              </button>
            )}
          </div>
        </div>

        {/* Map Viewport */}
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden relative">
          <DistrictMap
            reports={mapReports}
            selected={selectedDistrict}
            onSelect={setSelectedDistrict}
            selectedType={selectedType}
            lang={lang}
            t={t}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* Right Column: 2x2 Dropdowns + Dynamic Systematic Table   */}
      {/* ======================================================== */}
      <div className="col-span-12 lg:col-span-5 flex flex-col h-[600px] lg:h-full min-h-0 gap-3">
        {/* ======================================================== */}
        {/* 3. 4 Dropdowns in 2x2 Layout                             */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-card rounded-2xl border border-line shadow-xs shrink-0">
          {/* a. Select District */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              {loc.district}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-beige/50 hover:bg-beige border border-line rounded-xl px-2.5 py-1.5 text-xs md:text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition"
            >
              <option value="">{loc.allDistricts}</option>
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* b. Select Time Line */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              {loc.timeline}
            </label>
            <select
              value={timeLine}
              onChange={(e) => setTimeLine(Number(e.target.value))}
              className="w-full bg-beige/50 hover:bg-beige border border-line rounded-xl px-2.5 py-1.5 text-xs md:text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition"
            >
              <option value={1}>{loc.h24}</option>
              <option value={7}>{loc.d7}</option>
              <option value={30}>{loc.d30}</option>
              <option value={0}>{loc.allTime}</option>
            </select>
          </div>

          {/* c. Select Scam Type */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                {loc.scamType}
              </label>
              {selectedType && (
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: SCAM_COLORS[selectedType] || '#B3261E' }}
                />
              )}
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-beige/50 hover:bg-beige border border-line rounded-xl px-2.5 py-1.5 text-xs md:text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition"
            >
              <option value="">{loc.allScamTypes}</option>
              {SCAM_TYPES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st[lang] || st.en}
                </option>
              ))}
            </select>
          </div>

          {/* d. Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              {loc.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-beige/50 hover:bg-beige border border-line rounded-xl px-2.5 py-1.5 text-xs md:text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition"
            >
              <option value="reports_desc">{loc.repDesc}</option>
              <option value="reports_asc">{loc.repAsc}</option>
              <option value="lost_desc">{loc.lostDesc}</option>
              <option value="lost_asc">{loc.lostAsc}</option>
              <option value="change_desc">{loc.changeDesc}</option>
              <option value="change_asc">{loc.changeAsc}</option>
            </select>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. Systematic Tabular Details Section                    */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 bg-card rounded-2xl border border-line shadow-xs flex flex-col overflow-hidden">
          {/* Mode A: Single District Selected */}
          {selectedDistrict && singleDistrictData ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Bold Center-Aligned District Name Header (Requirement 4a) */}
              <div className="py-3 px-4 text-center border-b border-line bg-card relative shrink-0">
                <h3 className="font-bold text-center text-xl text-ink tracking-tight">
                  {selectedDistrict}
                </h3>
                <p className="text-xs text-muted mt-1 font-medium">
                  {singleDistrictData.totalCount}{' '}
                  {singleDistrictData.totalCount === 1 ? 'report' : 'reports'} ·{' '}
                  <span className="text-scam font-semibold">
                    {inr(singleDistrictData.totalLost)}
                  </span>{' '}
                  {t?.lostLabel || 'lost'}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedDistrict('')}
                  className="absolute right-3.5 top-3.5 text-xs text-forest hover:underline font-semibold flex items-center gap-1"
                >
                  ✕ {loc.allDistricts}
                </button>
              </div>

              {/* Systematic Table for the selected district */}
              <div className="flex-1 min-h-0 overflow-auto">
                {singleDistrictData.rows.length === 0 ? (
                  <div className="p-6 text-center text-muted text-sm">{loc.noData}</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted sticky top-0 bg-card border-b border-line shadow-2xs">
                      <tr>
                        <th className="py-2.5 pl-4 pr-3 font-medium">{loc.thType}</th>
                        <th className="py-2.5 px-3 font-medium text-right">{loc.thReports}</th>
                        <th className="py-2.5 px-3 font-medium text-right">{loc.thChange}</th>
                        <th className="py-2.5 pr-4 pl-3 font-medium text-right">{loc.thLost}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {singleDistrictData.rows.map((r) => {
                        const pct = Math.round(r.change * 100)
                        const color = SCAM_COLORS[r.typeId] || '#B3261E'
                        return (
                          <tr
                            key={r.typeId}
                            className={`hover:bg-beige/60 transition-colors ${
                              selectedType === r.typeId ? 'bg-beige/70 font-semibold' : ''
                            }`}
                          >
                            <td className="py-2.5 pl-4 pr-3 flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-medium text-ink">{r.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-ink">
                              {r.count}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right text-xs font-semibold whitespace-nowrap ${
                                pct > 0 ? 'text-scam' : pct < 0 ? 'text-safe' : 'text-muted'
                              }`}
                            >
                              {pct > 0 ? `▲ +${pct}%` : pct < 0 ? `▼ ${pct}%` : '0%'}
                            </td>
                            <td className="py-2.5 pr-4 pl-3 text-right font-medium text-ink">
                              {r.lost ? inr(r.lost) : '₹0'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* Mode B: All Districts Selected */
            <div className="flex flex-col h-full min-h-0">
              <div className="py-2.5 px-4 border-b border-line bg-card flex items-center justify-between shrink-0">
                <span className="font-semibold text-xs text-muted uppercase tracking-wider">
                  {loc.clickToFocus}
                </span>
                <span className="text-xs font-medium text-forest">
                  {allDistrictsData.length} {loc.thDistrict}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted sticky top-0 bg-card border-b border-line shadow-2xs">
                    <tr>
                      <th className="py-2.5 pl-4 pr-2 font-medium">{loc.thDistrict}</th>
                      <th className="py-2.5 px-2 font-medium text-right">{loc.thReports}</th>
                      <th className="py-2.5 px-2 font-medium text-right">{loc.thChange}</th>
                      <th className="py-2.5 px-2 font-medium">{loc.thTopType}</th>
                      <th className="py-2.5 pr-4 pl-2 font-medium text-right">{loc.thLost}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {allDistrictsData.map((d) => {
                      const pct = Math.round(d.change * 100)
                      return (
                        <tr
                          key={d.name}
                          onClick={() => setSelectedDistrict(d.name)}
                          className="hover:bg-beige/70 cursor-pointer transition-colors group"
                        >
                          <td className="py-2.5 pl-4 pr-2 font-medium text-ink group-hover:text-forest">
                            {d.name}
                          </td>
                          <td className="py-2.5 px-2 text-right font-medium text-ink">
                            {d.count}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-right text-xs font-semibold whitespace-nowrap ${
                              pct > 0 ? 'text-scam' : pct < 0 ? 'text-safe' : 'text-muted'
                            }`}
                          >
                            {pct > 0 ? `▲ +${pct}%` : pct < 0 ? `▼ ${pct}%` : '0%'}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-muted truncate max-w-[110px]">
                            {d.topType ? scamLabel(d.topType, lang) : '–'}
                          </td>
                          <td className="py-2.5 pr-4 pl-2 text-right text-xs font-medium text-ink">
                            {d.lost ? inr(d.lost) : '–'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
