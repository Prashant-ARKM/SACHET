import { useState, useEffect, Fragment } from 'react'
import { divIcon, geoJSON } from 'leaflet'
import { MapContainer, GeoJSON, CircleMarker, Marker, Tooltip, useMap, useMapEvent } from 'react-leaflet'
import boundary from '../../shared/chhattisgarh-boundary.json'
import districts from '../../shared/chhattisgarh-districts.json'
import { DISTRICTS } from '../../shared/districts.js'
import { countBy } from '../lib/stats.js'
import { scamLabel } from '../../shared/scamTypes.js'
import { C } from '../lib/theme.js'

const stateBounds = geoJSON(boundary).getBounds()
const districtColors = ['#F7DECC', '#E0ECCD', '#E7DDF3', '#FCEDBB']
const boundaryAttribution =
  'Boundaries: LGD 2024 via <a href="https://bharatlas.com/view/lgd_districts">bharatlas</a> ' +
  '(<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>), simplified'

// Distinct color for each scam type; default generalised red is #B3261E
export const SCAM_COLORS = {
  otp: '#E65100',          // Deep Orange / Amber
  kyc: '#1565C0',          // Royal Blue
  fake_qr: '#7B1FA2',      // Purple
  phishing_link: '#D97706',// Amber
  loan_app: '#00897B',     // Teal
  scam_call: '#D81B60',    // Rose
  digital_arrest: '#283593', // Indigo
  courier_customs: '#0288D1', // Sky
  fake_scheme: '#2E7D4F',  // Forest Green
  mule_recruitment: '#6D4C41', // Brown
  other: '#546E7A',        // Slate Grey
}

function labelIcon(lines) {
  const text = document.createElement('span')
  text.className = 'block w-max -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center text-[9px] leading-[11px] font-bold text-ink'
  text.textContent = lines.join('\n')
  return divIcon({ html: text, className: 'pointer-events-none', iconSize: [0, 0] })
}

function DistrictLabels({ selected }) {
  const [zoom, setZoom] = useState(null)
  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [overviewZoom] = useState(() => map.getZoom())
  const visibleZoom = zoom ?? overviewZoom

  // Keep full-state view free of clutter until zoomed in
  if (visibleZoom < overviewZoom + 1) return null

  return districts.features
    .map(({ properties }) => properties)
    .filter(({ labelMinZoom, name }) => visibleZoom >= labelMinZoom && (!selected || name === selected))
    .map(({ name, label, labelPosition }) => (
      <Marker
        key={name}
        position={labelPosition}
        icon={labelIcon(label)}
        interactive={false}
        keyboard={false}
      />
    ))
}

// Controller to smoothly pan & zoom to the selected district and enlarge it
function MapController({ selected }) {
  const map = useMap()

  useEffect(() => {
    if (selected) {
      const feat = districts.features.find((f) => f.properties.name === selected)
      if (feat) {
        const bounds = geoJSON(feat).getBounds()
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 10, duration: 0.8 })
        return
      }
      const d = DISTRICTS.find((item) => item.name === selected)
      if (d) {
        map.flyTo([d.lat, d.lng], 9.5, { duration: 0.8 })
      }
    } else {
      map.flyToBounds(stateBounds, { padding: [18, 18], duration: 0.8 })
    }
  }, [selected, map])

  return null
}

export default function DistrictMap({
  reports = [],
  selected = '',
  onSelect,
  selectedType = '',
  lang = 'en',
  t,
}) {
  const counts = countBy(reports, 'district')
  const max = Math.max(1, ...Object.values(counts))

  // Requirement 6: Every scam type has its own colour; default generalised red is #B3261E
  const markerColor = selectedType ? (SCAM_COLORS[selectedType] || '#B3261E') : '#B3261E'

  const districtStyle = (feature) => {
    const isSelected = selected && feature.properties.name === selected
    if (isSelected) {
      return {
        color: '#1F4D33',
        weight: 3.5,
        fillColor: '#FCEFD2',
        fillOpacity: 0.95,
      }
    }
    return {
      color: selected ? '#C8C2B5' : '#64695B',
      weight: 1,
      fillColor: districtColors[feature.properties.color % districtColors.length],
      fillOpacity: selected ? 0.45 : 1,
    }
  }

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        if (onSelect) {
          onSelect(selected === feature.properties.name ? '' : feature.properties.name)
        }
      },
    })
  }

  return (
    <MapContainer
      bounds={stateBounds}
      boundsOptions={{ padding: [18, 18] }}
      zoomSnap={0.25}
      maxBounds={stateBounds.pad(0.25)}
      maxBoundsViscosity={1}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: 12, background: C.card }}
    >
      <MapController selected={selected} />

      <GeoJSON
        key={`districts-layer-${selected || 'all'}`}
        data={districts}
        style={districtStyle}
        onEachFeature={onEachFeature}
      />

      <GeoJSON
        data={boundary}
        style={{ color: C.forest, weight: 3, fill: false }}
        interactive={false}
        attribution={boundaryAttribution}
      />

      <DistrictLabels selected={selected} />

      {DISTRICTS.map((d) => {
        const n = counts[d.name] ?? 0
        const active = selected === d.name
        // When active, enlarge the district marker significantly
        const radius = active ? Math.max(20, 14 + Math.sqrt(n) * 3.5) : 5 + Math.sqrt(n) * 3

        return (
          <Fragment key={d.id}>
            {active && (
              <CircleMarker
                center={[d.lat, d.lng]}
                radius={radius + 12}
                pathOptions={{
                  color: markerColor,
                  weight: 2,
                  dashArray: '4, 4',
                  fillColor: markerColor,
                  fillOpacity: 0.15,
                }}
                interactive={false}
              />
            )}
            <CircleMarker
              center={[d.lat, d.lng]}
              radius={radius}
              pathOptions={{
                color: active ? '#1F4D33' : markerColor,
                weight: active ? 3.5 : 1.5,
                fillColor: markerColor,
                fillOpacity: n ? (active ? 0.9 : 0.2 + 0.6 * (n / max)) : 0.08,
              }}
              eventHandlers={{
                click: () => onSelect && onSelect(active ? '' : d.name),
              }}
            >
              <Tooltip
                permanent={active}
                direction="top"
                offset={[0, -radius - 4]}
                className={active ? 'custom-active-map-tooltip' : ''}
              >
                <div className="text-center font-sans py-0.5 px-1">
                  <strong className="block text-sm text-ink">{d.name}</strong>
                  <span className="text-xs text-muted font-medium">
                    {n} {t?.alertReports || 'reports'}
                    {selectedType ? ` · ${scamLabel(selectedType, lang)}` : ''}
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          </Fragment>
        )
      })}
    </MapContainer>
  )
}
