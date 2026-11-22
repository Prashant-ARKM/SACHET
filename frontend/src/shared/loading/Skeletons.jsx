// Shimmer placeholders shaped like the real pages, so the swap feels seamless.
// tone: optional background so coloured tiles (hero, alert) keep their colour while loading
const TONES = { forest: 'rgba(31, 77, 51, 0.22)', blush: '#FBE3DF' }
const Bone = ({ className = '', tone }) => (
  <div className={`skeleton ${className}`} style={tone ? { background: TONES[tone] } : undefined} />
)

// Dashboard Overview: same grid as pages/Overview.jsx
export function DashboardOverviewSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[208px_minmax(0,1fr)_minmax(0,1fr)]">
      <Bone className="col-span-12 lg:col-span-5 min-h-[208px]" tone="forest" />
      <Bone className="col-span-12 md:col-span-5 lg:col-span-3 min-h-[180px]" tone="blush" />
      <div className="col-span-12 md:col-span-7 lg:col-span-4 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
        <Bone className="min-h-[90px]" />
        <Bone className="min-h-[90px]" />
        <Bone className="min-h-[90px]" />
        <Bone className="min-h-[90px]" />
      </div>
      <Bone className="col-span-12 lg:col-span-6 lg:row-span-2 min-h-[380px] lg:min-h-0" />
      <Bone className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[200px] lg:min-h-0" />
      <Bone className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[200px] lg:min-h-0" />
      <Bone className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[200px] lg:min-h-0" />
      <Bone className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[200px] lg:min-h-0" />
    </div>
  )
}

// Other dashboard pages: big tile + side tile, full height
export function DashboardPageSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      <Bone className="col-span-12 lg:col-span-7 min-h-[420px] lg:min-h-0" />
      <Bone className="col-span-12 lg:col-span-5 min-h-[320px] lg:min-h-0" />
    </div>
  )
}

// Citizen Home: same grid as pages/CitizenHome.jsx
export function CitizenHomeSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <Bone className="col-span-12 lg:col-span-7 min-h-[300px]" tone="forest" />
      <Bone className="col-span-12 lg:col-span-5 min-h-[300px]" tone="blush" />
      <Bone className="col-span-12 md:col-span-4 min-h-[160px]" />
      <Bone className="col-span-12 md:col-span-4 min-h-[160px]" />
      <Bone className="col-span-12 md:col-span-4 min-h-[160px]" />
      <Bone className="col-span-12 min-h-[140px]" />
    </div>
  )
}

// Other citizen pages: centred column of cards
export function CitizenPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Bone className="h-28" />
      <Bone className="h-64" />
      <Bone className="h-40" />
    </div>
  )
}
