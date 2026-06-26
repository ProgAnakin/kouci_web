import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from '../lib/scrollStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * Wires GSAP ScrollTrigger to the global scroll store. This is the bridge
 * that lets the persistent hero canvas move its camera in sync with the
 * page scroll without forcing React re-renders.
 */
export function usePageScroll(heroSelector = '#hero'): void {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollState.progress = self.progress
        },
      })

      const hero = document.querySelector(heroSelector)
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => {
            scrollState.hero = self.progress
          },
        })
      }
    })

    return () => ctx.revert()
  }, [heroSelector])
}
