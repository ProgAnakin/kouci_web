import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

type RevealDir = 'up' | 'left' | 'right' | 'scale'

type RevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Seconds to wait before animating in. */
  delay?: number
  /** Direction the content eases in from. */
  from?: RevealDir
  /** Travel distance in px. */
  distance?: number
  /** Stagger direct children instead of animating the wrapper as one block. */
  stagger?: boolean
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

function fromVars(from: RevealDir, distance: number) {
  switch (from) {
    case 'left':
      return { x: -distance, autoAlpha: 0 }
    case 'right':
      return { x: distance, autoAlpha: 0 }
    case 'scale':
      return { y: distance * 0.5, scale: 0.94, autoAlpha: 0 }
    default:
      return { y: distance, autoAlpha: 0 }
  }
}

/**
 * Scroll-reveal wrapper. Content renders visible by default — the animation is
 * purely additive — so it degrades gracefully if JS fails or the user prefers
 * reduced motion (in which case the tween is skipped). Uses a quality
 * power4/expo-style ease for a smooth, weighty settle.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  from = 'up',
  distance = 28,
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
        ...fromVars(from, distance),
        duration: 0.95,
        ease: 'power4.out',
        delay,
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          once: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [reduced, delay, from, distance, stagger])

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  )
}
