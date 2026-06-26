interface LogoProps {
  className?: string
  showWordmark?: boolean
  /** Mark size in px. */
  size?: number
}

/**
 * Kouci logo: a geometric "K" whose diagonal reads as a tactics arrow, over a
 * subtle water line, on an olive gradient chip. Pure inline SVG so it inherits
 * crispness at any size. TODO: swap for the final brand lockup if/when it lands.
 */
export function Logo({ className, showWordmark = true, size = 32 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="kouci-mark" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9FAC82" />
            <stop offset="1" stopColor="#7E8B63" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#kouci-mark)" />
        <path d="M11 7.5V21.5" stroke="#131512" strokeWidth="2.6" strokeLinecap="round" />
        <path
          d="M20.5 7.5 12.6 15 20.5 21.5"
          stroke="#131512"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 26.5c1.3-1.1 2.6-1.1 3.9 0 1.3 1.1 2.6 1.1 3.9 0 1.3-1.1 2.6-1.1 3.9 0"
          stroke="#131512"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink">Kouci</span>
      )}
    </span>
  )
}
