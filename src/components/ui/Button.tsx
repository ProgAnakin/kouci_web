import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-bg hover:bg-brand-light',
  ghost: 'border border-silver/30 text-ink hover:border-brand-light hover:text-brand-light',
}

type CommonProps = {
  variant?: Variant
  children: ReactNode
  className?: string
}

/** Anchor flavour — used for in-page links and CTAs. */
export function ButtonLink({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  )
}

/** Button flavour — used for form submits and JS-driven actions. */
export function Button({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
