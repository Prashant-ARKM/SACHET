// Official Government Portal Graphics & Illustrations
import parliamentImg from '../../assets/parliament.png'
import emblemDark from '../../assets/emblem.webp'
import emblemWhite from '../../assets/emblem-white.webp'
import digitalIndiaImg from '../../assets/digital-india.png'
import digitalIndiaWhiteImg from '../../assets/digital-india-white.png'

export function EmblemOfIndia({ className = "h-11 w-auto", color = "currentColor" }) {
  const isWhite = color === "#FFFFFF" || color === "white" || color?.toLowerCase() === "#fff"
  return (
    <img
      src={isWhite ? emblemWhite : emblemDark}
      alt="National Emblem of India"
      className={`object-contain pointer-events-none select-none ${className}`}
      loading="lazy"
    />
  )
}

export function ParliamentIllustration({ className = "w-[460px] h-auto" }) {
  return (
    <img
      src={parliamentImg}
      alt="Parliament House of India (Samvidhan Sadan)"
      className={`object-contain pointer-events-none select-none ${className}`}
      loading="lazy"
    />
  )
}

export function PhoneAlertIllustration({ className = "w-36 h-auto" }) {
  return (
    <svg viewBox="0 0 200 240" className={className} fill="none" aria-hidden="true">
      {/* Alert Radiating Rays */}
      <line x1="140" y1="35" x2="140" y2="20" stroke="#E05244" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="165" y1="42" x2="178" y2="30" stroke="#E05244" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="182" y1="65" x2="196" y2="60" stroke="#E05244" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="115" y1="42" x2="102" y2="30" stroke="#E05244" strokeWidth="2.5" strokeLinecap="round" />

      {/* Phone Body */}
      <g transform="rotate(7 140 120)">
        {/* Phone Shadow */}
        <rect x="84" y="44" width="94" height="174" rx="20" fill="#000" opacity="0.12" />
        {/* Smartphone Frame */}
        <rect x="80" y="40" width="94" height="174" rx="20" fill="#2A3830" stroke="#1E2A22" strokeWidth="3" />
        {/* Inner Screen */}
        <rect x="85" y="48" width="84" height="158" rx="14" fill="#FFFDF8" />
        {/* Speaker / Camera Bar */}
        <rect x="115" y="54" width="24" height="3.5" rx="2" fill="#C5D0C8" />

        {/* Red Shield on Screen */}
        <path
          d="M127 75 L155 87 C155 125 127 145 127 145 C127 145 99 125 99 87 Z"
          fill="#B3261E"
        />
        {/* Inner subtle glow */}
        <path
          d="M127 78 L152 89 C152 122 127 140 127 140 C127 140 102 122 102 89 Z"
          fill="#C62828"
          opacity="0.8"
        />
        {/* Exclamation Mark */}
        <rect x="124" y="93" width="6" height="23" rx="3" fill="#FFF" />
        <circle cx="127" cy="126" r="3.5" fill="#FFF" />

        {/* Small subtle card indicator lines */}
        <rect x="105" y="160" width="44" height="4" rx="2" fill="#E6DECD" />
        <rect x="113" y="170" width="28" height="4" rx="2" fill="#E6DECD" />
      </g>

      {/* Hand Silhouette Holding Phone */}
      <path
        d="M20 230 C45 220 80 205 92 195 C100 188 108 170 105 155 C102 142 90 148 85 158 C78 172 70 180 50 190 L10 240 Z"
        fill="#E8C5AC"
        opacity="0.95"
      />
      {/* Supporting Thumb */}
      <path
        d="M75 145 C78 135 88 132 94 140 C98 145 96 156 90 162 C85 166 78 160 75 145 Z"
        fill="#DCB295"
      />
    </svg>
  )
}

export function LaptopShieldIllustration({ className = "w-40 h-auto" }) {
  return (
    <svg viewBox="0 0 240 180" className={className} fill="none" aria-hidden="true">
      {/* Laptop Screen Bezel */}
      <rect x="40" y="25" width="160" height="105" rx="10" fill="#2E3D34" stroke="#1F2B24" strokeWidth="2.5" />
      {/* Laptop Glass Display */}
      <rect x="46" y="31" width="148" height="93" rx="6" fill="#F0F7F2" />
      {/* Web Camera */}
      <circle cx="120" cy="28" r="1.5" fill="#A0AFA6" />

      {/* Cyber Security Shield on Screen */}
      <path
        d="M120 46 L148 56 C148 88 120 105 120 105 C120 105 92 88 92 56 Z"
        fill="#3E8E5E"
      />
      <path
        d="M120 50 L144 58 C144 85 120 100 120 100 C120 100 96 85 96 58 Z"
        fill="#2E7D4F"
      />
      {/* Checkmark inside Shield */}
      <polyline points="108,76 116,84 133,67" stroke="#FFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Laptop Keyboard Base & Hinge */}
      <path d="M15 130 L225 130 L235 145 C235 148 232 150 228 150 L12 150 C8 150 5 148 5 145 Z" fill="#D3DCD5" stroke="#B8C4BB" strokeWidth="1.5" />
      {/* Trackpad */}
      <rect x="100" y="134" width="40" height="12" rx="2" fill="#E4ECE6" stroke="#C5D0C8" strokeWidth="0.8" />
      {/* Bottom Rubber Feet Shadow */}
      <ellipse cx="120" cy="155" rx="105" ry="5" fill="#000" opacity="0.08" />
    </svg>
  )
}

export function DigitalIndiaLogo({ className = "h-9 w-auto", dark = false }) {
  return (
    <img
      src={dark ? digitalIndiaImg : digitalIndiaWhiteImg}
      alt="Digital India - Power To Empower"
      className={`object-contain pointer-events-none select-none ${className}`}
      loading="lazy"
    />
  )
}

export function NicLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 32" className="w-9 h-7 shrink-0" fill="none">
        {/* NIC stylized typography */}
        <text x="0" y="24" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#FFF" letterSpacing="-1">
          NIC
        </text>
        {/* Small Indian tricolor dot/accent on the I */}
        <circle cx="16.5" cy="5" r="2.5" fill="#FF9933" />
      </svg>
      <div className="flex flex-col leading-none border-l border-white/30 pl-2">
        <span className="font-bold text-[10px] text-white tracking-tight">
          National
        </span>
        <span className="font-bold text-[10px] text-white tracking-tight">
          Informatics
        </span>
        <span className="font-bold text-[10px] text-white tracking-tight">
          Centre
        </span>
      </div>
    </div>
  )
}

