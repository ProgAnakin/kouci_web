import { track } from '@vercel/analytics'
import { ButtonLink, ButtonTo } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

/**
 * Mid-page conversion band. Visitors convinced by the showcase shouldn't have
 * to scroll to the end of the page to act.
 */
export function CtaBand() {
  return (
    <section aria-label="Get the club license" className="border-t border-white/5 py-16 md:py-20">
      <div className="container-content">
        <Reveal className="card relative overflow-hidden p-8 text-center md:p-12">
          {/* Soft brand glow. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[560px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl"
          />
          <h2 className="relative font-display text-2xl font-semibold text-ink md:text-3xl">
            Your club could own this before the <span className="text-brand-light">next match</span>
            .
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base leading-relaxed text-silver">
            Your players, your penalties, your set plays — read clearly, season after season. One
            license for the whole club.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonTo
              to="/checkout"
              withArrow
              onClick={() => track('cta_click', { placement: 'band', label: 'checkout' })}
            >
              Get the Club License
            </ButtonTo>
            <ButtonLink
              href="#pricing"
              variant="ghost"
              onClick={() => track('cta_click', { placement: 'band', label: 'pricing' })}
            >
              What’s included
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
