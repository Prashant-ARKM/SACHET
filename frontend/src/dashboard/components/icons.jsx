// Small outline icons (no icon library needed). Inherit colour from text colour.
const Svg = ({ children, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Svg>
)
export const MapIcon = (p) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
)
export const TrendIcon = (p) => (
  <Svg {...p}>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </Svg>
)
export const BarsIcon = (p) => (
  <Svg {...p}>
    <path d="M5 20v-9M12 20V5M19 20v-6M3 20h18" />
  </Svg>
)
export const PulseIcon = (p) => (
  <Svg {...p}>
    <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
  </Svg>
)
export const ExitIcon = (p) => (
  <Svg {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h11" />
  </Svg>
)
export const AlertIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 2.5 20h19z" />
    <path d="M12 10v4M12 17.2v.1" />
  </Svg>
)
export const RupeeIcon = (p) => (
  <Svg {...p}>
    <path d="M6 4h12M6 9h12M6 4h3a5 5 0 0 1 0 10H6l8 7" />
  </Svg>
)
export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)
export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
)
export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)
export const MegaphoneIcon = (p) => (
  <Svg {...p}>
    <path d="M3 10v4h3l7 4V6L6 10z" />
    <path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" />
  </Svg>
)
export const PrinterIcon = (p) => (
  <Svg {...p}>
    <path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="7" y="14" width="10" height="7" rx="1" />
  </Svg>
)
export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Svg>
)
export const PlayIcon = (p) => (
  <Svg {...p}>
    <path d="M7 5v14l12-7z" />
  </Svg>
)
export const StopIcon = (p) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </Svg>
)
export const QrIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
  </Svg>
)
