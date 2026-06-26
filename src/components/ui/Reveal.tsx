import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

type RevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Seconds to wait before animating in. */
  delay?: number
  /** Initial vertical offset in px. */
  y?: number
  /** Stagger direct children instead of animating the wrapper as one block. */
  stagger?: boolean
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

/**
 * Scroll-reveal wrapper. Content is rendered visible by default — the
 * animation is purely additive — so it degrades gracefully if JS fails or
 * the user prefers reduced motion (in which case we skip the tween).
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  y = 20,
  stagger = false,
  ...rest
}: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(el.children) : el
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.8,
        ease: 'power3.out',
        delay,
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [reduced, delay, y, stagger])

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  )
}
