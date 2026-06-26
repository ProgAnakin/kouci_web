import { Suspense, lazy } from 'react'
import { ButtonLink } from '../ui/Button'
import { CanvasFallback } from '../../three/Loader'

// The 3D water bundle is code-split so the headline paints immediately.
const HeroCanvas = lazy(() => import('../../three/HeroCanvas'))

export function Hero() {
  return (
    <section id="hero" className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden">
      {/* Decorative 3D water backdrop. The accessible content is the headline
          and copy below — so the canvas itself is hidden from assistive tech. */}
      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<CanvasFallback />}>
          <HeroCanvas />
        </Suspense>
        {/* Legibility veil over the water. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/50 via-bg/10 to-bg" />
      </div>

      <div className="container-content relative">
        <p className="eyebrow animate-fade-up">Water polo intelligence</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.95] text-ink sm:text-6xl md:text-7xl">
          Master <span className="text-brand-light">Every Play</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver">
          Kouci turns raw match data into a tactical edge — player stats, penalty maps,
          animated tactics and live game tracking, built for coaches who demand precision.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ButtonLink href="#early-access">Get Early Access</ButtonLink>
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
