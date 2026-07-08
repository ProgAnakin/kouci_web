import { useState } from 'react'
import { Html } from '@react-three/drei'

interface HotspotProps {
  position: [number, number, number]
  label: string
  detail: string
  /** Horizontal anchoring of the tooltip relative to the marker — pick the side
   *  that keeps it inside the canvas ('start' grows rightward, 'end' leftward). */
  align?: 'start' | 'center' | 'end'
  /** Whether the tooltip opens below or above the marker. */
  direction?: 'down' | 'up'
}

/**
 * Accessible 3D hotspot: a focusable button anchored in world space that
 * reveals a short detail on hover, focus or click. Rendered at a fixed CSS size
 * (no distanceFactor), so the tooltip is always legible and never scales with
 * the camera; align/direction pick the side that stays inside the card.
 */
export function Hotspot({
  position,
  label,
  detail,
  align = 'center',
  direction = 'down',
}: HotspotProps) {
  const [open, setOpen] = useState(false)

  const alignCls =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'
  const dirCls = direction === 'down' ? 'top-8' : 'bottom-8'

  return (
    <Html position={position} center zIndexRange={[30, 0]} className="select-none">
      <div className="pointer-events-auto relative">
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          onPointerEnter={() => setOpen(true)}
          onPointerLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen((o) => !o)}
          className="grid h-6 w-6 place-items-center rounded-full border border-bg/40 bg-brand-light text-sm font-semibold leading-none text-bg shadow-lg shadow-black/40 transition-transform hover:scale-110"
        >
          +
        </button>
        {open && (
          <div
            role="tooltip"
            className={`absolute ${dirCls} ${alignCls} w-56 rounded-xl border border-white/10 bg-surface/95 p-3 text-left text-xs leading-snug text-ink shadow-xl shadow-black/50 backdrop-blur`}
          >
            <span className="block font-semibold text-brand-light">{label}</span>
            <span className="mt-1 block text-silver">{detail}</span>
          </div>
        )}
      </div>
    </Html>
  )
}
