import { track } from '@vercel/analytics'
import { ButtonTo, ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { LICENSE, LICENSE_INCLUDES, VERSION_LADDER, formatPrice } from '../../lib/commerce'

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-brand-light"
    >
      <path
        d="M3 8.5 6.5 12 13 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The offer, stated like the club purchase it is: one license, whole club,
 * price that only rises with each version. One card — no tier paralysis.
 */
export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="relative overflow-hidden border-t border-white/5 py-24 md:py-32"
    >
      {/* Focal glow behind the card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[760px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="container-content relative">
        <SectionHeading
          eyebrow="Founding clubs"
          id="pricing-title"
          layout="split"
          title="Bought once. Owned by the club. Not another subscription."
          lead="Clubs don’t rent their pool or their goals — why rent their data? One payment covers every team, every coach, every season."
        />

        <Reveal className="mt-14">
          <div className="card card-lift overflow-hidden">
            <div className="grid md:grid-cols-[1.2fr_1fr]">
              {/* Left: the license */}
              <div className="p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="font-display text-xl font-semibold text-ink">{LICENSE.name}</h3>
                  <span className="whitespace-nowrap rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-light">
                    {LICENSE.version} · founder price
                  </span>
                </div>
                <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-5xl font-bold text-ink">
                    {formatPrice(LICENSE.price)}
                  </span>
                  <span className="whitespace-nowrap text-sm text-silver">
                    one-time · per club · excl. VAT
                  </span>
                </p>

                <ul className="mt-7 space-y-2.5">
                  {LICENSE_INCLUDES.slice(0, 5).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed text-ink/90"
                    >
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <ButtonTo
                    to="/checkout"
                    withArrow
                    className="w-full justify-center sm:w-auto"
                    onClick={() => track('cta_click', { placement: 'pricing', label: 'checkout' })}
                  >
                    Get the Club License
                  </ButtonTo>
                  <ButtonLink
                    href="#early-access"
                    variant="ghost"
                    className="w-full justify-center sm:w-auto"
                    onClick={() => track('cta_click', { placement: 'pricing', label: 'demo' })}
                  >
                    See a demo first
                  </ButtonLink>
                </div>
                <p className="mt-4 text-xs text-silver/70">
                  Pay by card — or by bank transfer with an invoice, like most clubs.
                </p>
              </div>

              {/* Right: the ladder + white-label */}
              <div className="border-t border-white/5 bg-bg/40 p-8 md:border-l md:border-t-0 md:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-silver/70">
                  The price only goes up
                </p>
                <ul className="mt-5 space-y-3">
                  {VERSION_LADDER.map((step) => (
                    <li key={step.version} className="flex items-center justify-between text-sm">
                      <span className={step.current ? 'font-medium text-ink' : 'text-silver/60'}>
                        {step.version}
                        {step.current ? ' — you are here' : ` · ${step.label}`}
                      </span>
                      <span
                        className={
                          step.current
                            ? 'font-display text-lg font-semibold text-brand-light'
                            : 'text-silver/60'
                        }
                      >
                        {formatPrice(step.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-silver/80">
                  New versions launch at a higher price for new clubs. Owners only ever pay for
                  optional add-ons.
                </p>

                <div className="relative mt-8 rounded-xl border border-dashed border-white/15 p-4">
                  <span className="absolute -top-2.5 right-3 rounded-full border border-brand/40 bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-light">
                    Coming soon
                  </span>
                  <p className="text-sm font-medium text-ink">Your club’s own app</p>
                  <p className="mt-1 text-xs leading-relaxed text-silver">
                    Your crest and colors baked into your club’s build. License holders get it
                    first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
