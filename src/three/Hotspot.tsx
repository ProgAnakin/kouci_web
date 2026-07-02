import { useState } from 'react'
import { Html } from '@react-three/drei'

interface HotspotProps {
  position: [number, number, number]
  label: string
  detail: string
}

/**
 * Accessible 3D hotspot: a focusable button anchored in world space that
 * reveals a short detail on hover, focus or click. Keyboard-operable and
 * announced to assistive tech via aria-expanded + role="tooltip".
 */
export function Hotspot({ position, label, detail }: HotspotProps) {
  const [open, setOpen] = useState(false)

  return (
    <Html
      position={position}
      center
      distanceFactor={9}
      zIndexRange={[30, 0]}
      className="select-none"
    >
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
          className="grid h-5 w-5 place-items-center rounded-full border border-bg/40 bg-brand-light text-[13px] font-semibold leading-none text-bg shadow-lg shadow-black/40 transition-transform hover:scale-110"
        >
          +
        </button>
        {open && (
          <div
            role="tooltip"
            className="absolute left-1/2 top-7 w-44 -translate-x-1/2 rounded-lg border border-white/10 bg-surface/95 p-3 text-center text-xs leading-snug text-ink shadow-xl shadow-black/50 backdrop-blur"
          >
            <span className="block font-semibold text-brand-light">{label}</span>
            <span className="mt-1 block text-silver">{detail}</span>
          </div>
        )}
      </div>
    </Html>
  )
}
