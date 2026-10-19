/**
 * LogoMark — ResumeRadar's symbol.
 *
 * Concept: a radar scope (concentric rings + rotating sweep wedge) with a
 * detected "blip" and two subtle text lines at the core — the resume being
 * scanned. Reads clearly even at 16px.
 */
export default function LogoMark({ className = 'h-8 w-8', animated = true }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="rm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="rm-blip">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* rotating radar sweep */}
      <g
        className={
          animated
            ? 'animate-spin [animation-duration:5s] [transform-box:view-box] [transform-origin:24px_24px]'
            : undefined
        }
      >
        <path d="M24 24 L45 24 A21 21 0 0 0 34.5 5.77 Z" fill="url(#rm-grad)" opacity="0.5" />
      </g>

      {/* scope rings */}
      <circle cx="24" cy="24" r="21" fill="none" stroke="url(#rm-grad)" strokeWidth="2.5" />
      <circle
        cx="24"
        cy="24"
        r="13"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />

      {/* resume "text lines" at the core */}
      <rect x="15.5" y="28.5" width="12" height="2.6" rx="1.3" fill="rgba(255,255,255,0.6)" />
      <rect x="15.5" y="33" width="7.5" height="2.6" rx="1.3" fill="rgba(255,255,255,0.32)" />

      {/* detected blip */}
      <circle cx="33" cy="15" r="7" fill="url(#rm-blip)" />
      <circle cx="33" cy="15" r="3" fill="#22d3ee" />

      {/* sweep origin */}
      <circle cx="24" cy="24" r="3.5" fill="#8b5cf6" />
    </svg>
  )
}
