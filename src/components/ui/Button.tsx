import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'ghost'

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 will-change-transform disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary:
    'btn-sheen bg-gradient-to-b from-brand-light to-brand text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_10px_-2px_rgba(0,0,0,0.5)] hover:to-brand-light hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_36px_-10px_rgba(126,139,99,0.75)]',
  ghost:
    'border border-white/15 bg-white/[0.03] text-ink hover:border-brand-light/60 hover:bg-brand/10 hover:text-brand-light',
}

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type CommonProps = {
  variant?: Variant
  children: ReactNode
  className?: string
  withArrow?: boolean
}

/** Anchor flavour — used for in-page links and CTAs. */
export function ButtonLink({
  variant = 'primary',
  children,
  className = '',
  withArrow = false,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </a>
  )
}

/** Router-Link flavour — used for cross-page CTAs (keeps the page transition). */
export function ButtonTo({
  variant = 'primary',
  children,
  className = '',
  withArrow = false,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </Link>
  )
}

/** Button flavour — used for form submits and JS-driven actions. */
export function Button({
  variant = 'primary',
  children,
  className = '',
  withArrow = false,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </button>
  )
}
