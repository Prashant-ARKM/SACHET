import { NavLink, Link } from 'react-router-dom'
import { HomeIcon, MapIcon, TrendIcon, BarsIcon, PulseIcon, ExitIcon } from './icons.jsx'

export const getNav = (t) => [
  { to: '/official', label: t?.navOverview || 'Overview', Icon: HomeIcon, end: true },
  { to: '/official/map', label: t?.navMap || 'Map', Icon: MapIcon },
  { to: '/official/trends', label: t?.navTrends || 'Trends', Icon: TrendIcon },
  { to: '/official/types', label: t?.navTypes || 'Scam types', Icon: BarsIcon },
  { to: '/official/activity', label: t?.navActivity || 'Activity', Icon: PulseIcon },
]

export const NAV = getNav()

// Label that appears to the right of an icon on hover / keyboard focus.
const Hint = ({ children }) => (
  <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-md bg-ink text-card text-xs font-medium whitespace-nowrap opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 z-[1000]">
    {children}
  </span>
)

const rail = ({ isActive }) =>
  `group relative grid place-items-center w-11 h-11 rounded-xl transition-colors ${
    isActive ? 'bg-card/20 text-card' : 'text-card/70 hover:bg-card/10 hover:text-card'
  }`

// Icon-only rail: icons centred vertically, exit at the bottom.
export default function SideNav({ t }) {
  const navItems = getNav(t)
  return (
    <aside className="hidden md:flex w-[64px] shrink-0 flex-col items-center bg-forest sticky top-0 self-start h-screen py-5 z-[1000]">
      <nav className="flex-1 flex flex-col justify-center gap-2" aria-label="Dashboard">
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={rail} aria-label={label}>
            <Icon size={20} />
            <Hint>{label}</Hint>
          </NavLink>
        ))}
      </nav>

      <Link to="/" className={rail({ isActive: false })} aria-label="Back to start">
        <ExitIcon size={20} />
        <Hint>{t?.navExit || 'Back to start'}</Hint>
      </Link>
    </aside>
  )
}

// Small screens: same items as a scrollable row with labels.
export function MobileNav({ t }) {
  const navItems = getNav(t)
  return (
    <nav className="md:hidden flex gap-1 overflow-x-auto bg-forest p-2">
      {navItems.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap ${
              isActive ? 'bg-card/20 text-card' : 'text-card/70'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
