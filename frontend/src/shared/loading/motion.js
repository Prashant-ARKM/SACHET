// Timings for the loading sequence (ms). Change here to tune the feel.
export const INTRO_MS = 2000 // lock intro: closed lock opens, then the launch page (once per session)
export const SCAN_MS = 1900 // message-scan loader when entering /citizen or /official
export const LEAVE_MS = 500 // overlay fade-out
export const SKELETON_MS = 800 // shimmer skeleton on every page
export const CROSSFADE_MS = 450 // skeleton fades out while tiles rise

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
