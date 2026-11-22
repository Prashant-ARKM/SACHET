import { useState } from 'react'
import { DISTRICTS } from '../../shared/districts.js'

export default function DistrictModal({ isOpen, onClose, currentDistrict, onSelect, lang = 'hi' }) {
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const filtered = DISTRICTS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const titles = {
    hi: { title: 'अपना ज़िला चुनें', sub: 'आपके ज़िले की साइबर सुरक्षा रिपोर्ट और अलर्ट देखने के लिए ज़िला चुनें', placeholder: 'ज़िला खोजें...', confirm: 'सहेजें' },
    cg: { title: 'अपन ज़िला चुनव', sub: 'तुंहर ज़िला के साइबर रिपोर्ट अउ अलर्ट देखे बर ज़िला चुनव', placeholder: 'ज़िला खोजव...', confirm: 'सहेजव' },
    en: { title: 'Select Your District', sub: 'Needed to show local district scam alerts and anonymous reporting', placeholder: 'Search district...', confirm: 'Save' },
  }
  const t = titles[lang] || titles.hi

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-line p-6 flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold font-display text-ink flex items-center gap-2">
              <span>📍</span> {t.title}
            </h3>
            <p className="text-xs text-muted mt-1">{t.sub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-beige hover:bg-line text-ink flex items-center justify-center font-bold text-lg cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="my-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-beige text-ink text-sm focus:outline-hidden focus:border-forest"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[200px]">
          {filtered.map((d) => {
            const isSelected = d.name === currentDistrict
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  onSelect(d.name)
                  onClose()
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-forest text-card shadow-xs'
                    : 'bg-beige/60 hover:bg-mint text-ink'
                }`}
              >
                <span>{d.name}</span>
                {isSelected && <span className="text-xs bg-leaf px-2 py-0.5 rounded-full text-card">चयनित</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

