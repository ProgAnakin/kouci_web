import type { SVGProps } from 'react'

/**
 * Kouci line-icon set — a single consistent family (24px grid, 1.75 stroke,
 * round caps) hand-inlined so the site ships no icon dependency. Icons are
 * decorative next to their card headings, so they default to aria-hidden.
 */
function base(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }
}

/** Clock rewinding — details that are gone by Monday. */
export function IconHistory(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

/** Notebook — the season locked on paper. */
export function IconNotebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
    </svg>
  )
}

/** Moon — Sunday nights spent on admin. */
export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

/** Coach clipboard. */
export function IconClipboard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M8 11h8" />
      <path d="M8 16h5" />
    </svg>
  )
}

/** Trend line — analysts. */
export function IconTrend(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  )
}

/** Crest shield — the club. */
export function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

/** Globe — federations, programs across borders. */
export function IconGlobe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

/** Shared chip that frames an icon beside a card heading. */
export function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-brand/10 text-brand-light">
      {children}
    </span>
  )
}
