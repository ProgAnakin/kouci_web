import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Premium inertial smooth-scroll (Lenis) driven off GSAP's ticker so it stays
 * perfectly in sync with every ScrollTrigger on the page. Disabled entirely
 * under prefers-reduced-motion, falling back to native scrolling.
 */
export function useSmoothScroll(): void {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      // Gentle exponential ease-out — settles smoothly without feeling floaty.
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
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
