interface LogoProps {
  className?: string
  showWordmark?: boolean
  /** Extra classes for the wordmark, e.g. to hide it on small screens. */
  wordmarkClassName?: string
  /** Mark height in px. */
  size?: number
}

// Intrinsic aspect ratio of the brand mark (public/brand/kouci-mark-136.png).
const MARK_ASPECT = 1.152

/**
 * Kouci brand lockup: the KC monogram (water polo ball + wave) next to the
 * wordmark. The mark ships as a transparent PNG cut from the master logo —
 * width/height are set explicitly so the navbar never shifts while it loads.
 */
export function Logo({ className, showWordmark = true, wordmarkClassName, size = 36 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <img
        src="/brand/kouci-mark-136.png"
        alt=""
        aria-hidden="true"
        width={Math.round(size * MARK_ASPECT)}
        height={size}
        decoding="async"
        draggable={false}
        className="shrink-0 select-none"
      />
      {showWordmark && (
        <span
          className={`font-display text-lg font-semibold tracking-tight text-ink ${wordmarkClassName ?? ''}`}
        >
          Kouci
        </span>
      )}
    </span>
  )
}
