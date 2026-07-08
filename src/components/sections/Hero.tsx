import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { track } from '@vercel/analytics'
import { ButtonLink } from '../ui/Button'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useCanvasActivation } from '../../hooks/useCanvasActivation'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

// The 3D water bundle is code-split so the headline paints immediately.
const HeroCanvas = lazy(() => import('../../three/HeroCanvas'))

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  // Defer the heavy 3D to browser-idle, and pause it when scrolled off-screen.
  const [backdropRef, mount, active] = useCanvasActivation<HTMLDivElement>({ rootMargin: '300px' })
  const [loaded, setLoaded] = useState(false)

  // Orchestrated entrance + a scroll parallax that drifts the content up and
  // fades it as the hero scrolls away. Both skipped under reduced motion.
  useLayoutEffect(() => {
    if (reduced || !sectionRef.current || !contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current!.children, {
        y: 30,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.15,
      })

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

  // Pointer micro-parallax: each text element drifts a few px toward the cursor
  // at a different depth, giving the headline a sense of layers. Driven through
  // the CSS `translate` property (independent of the `transform` GSAP animates,
  // so the two never fight), rAF-smoothed, fine-pointer only, reduced-motion off.
  useEffect(() => {
    if (reduced) return
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return

    const items = Array.from(content.children) as HTMLElement[]
    // Per-element depth (px at full deflection): headline moves most.
    const depth = [7, 15, 10, 5, 6]
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0
    let running = false

    const frame = () => {
      cx += (tx - cx) * 0.09
      cy += (ty - cy) * 0.09
      items.forEach((el, i) => {
        const d = depth[i] ?? 5
        el.style.translate = `${(cx * d).toFixed(2)}px ${(cy * d * 0.55).toFixed(2)}px`
      })
      const settled = Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002 && tx === 0 && ty === 0
      if (settled) {
        running = false
      } else {
        raf = requestAnimationFrame(frame)
      }
    }
    const kick = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
      kick()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
      items.forEach((el) => {
        el.style.translate = ''
      })
    }
  }, [reduced])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden"
    >
      {/* Decorative 3D water backdrop. The accessible content is the headline
          and copy below — so the canvas itself is hidden from assistive tech. */}
      <div ref={backdropRef} className="absolute inset-0" aria-hidden="true">
        {/* Lightweight poster: shows instantly, the canvas fades in over it. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_32%,rgba(126,139,99,0.16),transparent_55%),linear-gradient(to_bottom,#0c0d0a_0%,#131512_72%)]" />

        {mount && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Suspense fallback={null}>
              <HeroCanvas active={active} onReady={() => setLoaded(true)} />
            </Suspense>
          </div>
        )}

        {/* Left scrim — keeps the headline fully legible over open water while
            the ball and goal sit clear, on the right. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#131512_0%,rgba(19,21,18,0.7)_40%,transparent_70%)]" />
        {/* On phones the text sits over the scene, so add a soft global dim. */}
        <div className="pointer-events-none absolute inset-0 bg-bg/40 md:hidden" />
        {/* Top + bottom fades for grounding. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />
        {/* Cinematic vignette (replaces the post-processing one — free). */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_130%_at_55%_45%,transparent_55%,rgba(8,9,7,0.7))]" />
      </div>

      <div ref={contentRef} className="container-content relative">
        <p className="eyebrow">Water polo intelligence</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.95] text-ink sm:text-6xl md:text-7xl">
          Master <span className="text-brand-light">Every Play</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver">
          The water polo app that turns raw match data into a tactical edge — player stats, penalty
          maps, animated tactics and live game tracking. Built for coaches, coming to iOS &amp;
          Android.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-silver/70">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-light" aria-hidden="true" />
          In development · early access opening soon
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ButtonLink
            href="#early-access"
            withArrow
            onClick={() => track('cta_click', { placement: 'hero', label: 'early_access' })}
          >
            Get Early Access
          </ButtonLink>
          <ButtonLink
            href="#features"
            variant="ghost"
            onClick={() => track('cta_click', { placement: 'hero', label: 'features' })}
          >
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
