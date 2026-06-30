import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

/**
 * Premium inertial smooth-scroll (Lenis) driven off GSAP's ticker so it stays
 * perfectly in sync with every ScrollTrigger on the page. Disabled entirely
 * under prefers-reduced-motion, falling back to native scrolling.
 */
export function useSmoothScroll(): void {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    // Frame-based lerp (not duration easing) → light, responsive, never sticky.
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.1,
      smoothWheel: true,
      // Leave touch devices on their native (already-smooth) scrolling.
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [reduced])
}
