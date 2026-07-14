import { track } from '@vercel/analytics'
import { ButtonLink, ButtonTo } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

/**
 * Mid-page conversion band. Visitors convinced by the showcase shouldn't have
 * to scroll to the end of the page to act. Set as an asymmetric row — claim on
 * the left, actions on the right — so it reads like a decision, not a poster.
 */
export function CtaBand() {
  return (
    <section aria-label="Get the club license" className="border-t border-white/5 py-16 md:py-20">
      <div className="container-content">
        <Reveal className="card relative overflow-hidden p-8 md:p-12">
          {/* Soft brand glow, anchored to the claim. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[18%] top-0 h-64 w-[560px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.35fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-semibold leading-snug text-ink md:text-3xl">
                Your club could own this before the{' '}
                <span className="text-brand-light">next match</span>.
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-silver">
                Your players, your penalties, your set plays — read clearly, season after season.
                One license for the whole club.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-end">
              <ButtonTo
                to="/checkout"
                withArrow
                className="w-full justify-center whitespace-nowrap sm:w-auto"
                onClick={() => track('cta_click', { placement: 'band', label: 'checkout' })}
              >
                Get the Club License
              </ButtonTo>
              <ButtonLink
                href="#pricing"
                variant="ghost"
                className="w-full justify-center whitespace-nowrap sm:w-auto"
                onClick={() => track('cta_click', { placement: 'band', label: 'pricing' })}
              >
                What’s included
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
