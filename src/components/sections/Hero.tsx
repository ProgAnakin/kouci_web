import { Suspense, lazy, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ButtonLink } from '../ui/Button'
import { CanvasFallback } from '../../three/Loader'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

// The 3D water bundle is code-split so the headline paints immediately.
const HeroCanvas = lazy(() => import('../../three/HeroCanvas'))

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  // Orchestrated entrance + a scroll parallax that drifts the content up and
  // fades it as the hero scrolls away. Both skipped under reduced motion.
  useLayoutEffect(() => {
    if (reduced || !sectionRef.current || !contentRef.current) return
    const ctx = gsap.context(() => {
      // Staggered reveal of the headline block.
      gsap.from(contentRef.current!.children, {
        y: 30,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.15,
      })

      // Depth on scroll — without hijacking it.
      gsap.to(contentRef.current, {
        yPercent: -16,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden"
    >
      {/* Decorative 3D water backdrop. The accessible content is the headline
          and copy below — so the canvas itself is hidden from assistive tech. */}
      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<CanvasFallback />}>
          <HeroCanvas />
        </Suspense>
        {/* Legibility veil over the water. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/10 to-bg" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_30%,transparent_40%,rgba(19,21,18,0.55))]" />
        {/* Cinematic vignette (replaces the post-processing one — free). */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_42%,transparent_52%,rgba(8,9,7,0.7))]" />
      </div>

      <div ref={contentRef} className="container-content relative">
        <p className="eyebrow">Water polo intelligence</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.95] text-ink sm:text-6xl md:text-7xl">
          Master <span className="text-brand-light">Every Play</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver">
          Kouci turns raw match data into a tactical edge — player stats, penalty maps,
          animated tactics and live game tracking, built for coaches who demand precision.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ButtonLink href="#early-access" withArrow>
            Get Early Access
          </ButtonLink>
          <ButtonLink href="#features" variant="ghost">
            See the features
          </ButtonLink>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-silver/70"
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-9 w-px animate-pulse bg-gradient-to-b from-silver/60 to-transparent" />
      </div>
    </section>
  )
}
