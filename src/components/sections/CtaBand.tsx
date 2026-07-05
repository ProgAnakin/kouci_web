import { track } from '@vercel/analytics'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

/**
 * Mid-page conversion band. Visitors convinced by the showcase shouldn't have
 * to scroll to the end of the page to act — both CTAs land on the form.
 */
export function CtaBand() {
  return (
    <section aria-label="Get early access" className="border-t border-white/5 py-16 md:py-20">
      <div className="container-content">
        <Reveal className="card relative overflow-hidden p-8 text-center md:p-12">
          {/* Soft brand glow. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[560px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl"
          />
          <h2 className="relative font-display text-2xl font-semibold text-ink md:text-3xl">
            Imagine this on <span className="text-brand-light">your</span> matches.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base leading-relaxed text-silver">
            Your players, your penalties, your set plays — read clearly before the next game.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink
              href="#early-access"
              withArrow
              onClick={() => track('cta_click', { placement: 'band', label: 'early_access' })}
            >
              Get Early Access
            </ButtonLink>
            <ButtonLink
              href="#early-access"
              variant="ghost"
              onClick={() => track('cta_click', { placement: 'band', label: 'demo' })}
            >
              Request a guided demo
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
