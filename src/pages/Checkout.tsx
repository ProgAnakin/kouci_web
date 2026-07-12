import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { track } from '@vercel/analytics'
import { Seo } from '../components/Seo'
import { Field } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { LICENSE, LICENSE_INCLUDES, VERSION_LADDER, formatPrice } from '../lib/commerce'
import { CONTACT_EMAIL, SITE_NAME } from '../lib/site'

// Until the real contact address is filled into site.ts the invoice path
// falls back to the demo/contact form instead of a dead mailto.
const HAS_CONTACT_EMAIL = !CONTACT_EMAIL.startsWith('[')
const INVOICE_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  `Invoice request — ${LICENSE.name} (${LICENSE.version})`,
)}&body=${encodeURIComponent(
  'Hi Kouci,\n\nWe would like to pay the Club License by bank transfer.\n\nClub name:\nBilling address:\nVAT ID (if any):\nContact person:\n',
)}`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'unavailable' | 'error'
type Errors = { club?: string; name?: string; email?: string }

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

export function Checkout() {
  const [params] = useSearchParams()
  const cancelled = params.get('cancelled') === '1'

  const [club, setClub] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')

  function validate() {
    const next: Errors = {}
    if (!club.trim()) next.club = 'Please enter your club’s name.'
    if (!name.trim()) next.name = 'Please enter your name.'
    if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    track('checkout_submit', { club: club.trim() })

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club: club.trim(),
          name: name.trim(),
          email: email.trim(),
          country: country.trim(),
        }),
      })
      if (res.status === 503) {
        setStatus('unavailable')
        return
      }
      if (!res.ok) throw new Error('checkout_failed')
      const data = (await res.json()) as { url?: string }
      if (!data.url) throw new Error('no_url')
      track('checkout_redirect')
      window.location.assign(data.url)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main id="main" className="container-content pb-24 pt-32 md:pt-40">
      <Seo
        title={`Get the Club License | ${SITE_NAME}`}
        description={`Buy the ${LICENSE.name} (${LICENSE.version}) — one payment, your whole club, every team and coach. Secure checkout by Stripe.`}
        path="/checkout"
      />

      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">Founding clubs · {LICENSE.version}</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink md:text-5xl">
          Own the tactical edge.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-silver md:text-lg">
          One payment. Your whole club — every team, every coach, every season. The{' '}
          {LICENSE.version} price is the lowest Kouci will ever cost.
        </p>
      </header>

      {cancelled && (
        <div
          role="status"
          className="mx-auto mt-8 max-w-2xl rounded-xl border border-white/10 bg-surface/80 px-4 py-3 text-center text-sm text-silver"
        >
          Checkout cancelled — nothing was charged. Your details are still here whenever you’re
          ready.
        </div>
      )}

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* ------------------------------------------------ Order summary */}
        <section aria-labelledby="summary-title" className="card p-7 md:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="summary-title" className="font-display text-xl font-semibold text-ink">
                {LICENSE.name}
              </h2>
              <p className="mt-1 text-sm text-silver">
                Version {LICENSE.version} · one-time payment · per club
              </p>
            </div>
            <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-light">
              Founder price
            </span>
          </div>

          <p className="mt-6 font-display text-5xl font-bold text-ink">
            {formatPrice(LICENSE.price)}
            <span className="ml-2 align-middle font-sans text-sm font-normal text-silver/70">
              excl. VAT
            </span>
          </p>
          <p className="mt-1 text-sm text-silver">
            Not per season. Not per user. Yours — like buying the boat, not renting the lane.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-silver/70">
            VAT is added at checkout where applicable — enter your club’s VAT ID for a compliant
            invoice.
          </p>

          <ul className="mt-8 space-y-3">
            {LICENSE_INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink/90">
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>

          {/* Version ladder */}
          <div className="mt-9 rounded-xl border border-white/10 bg-bg/50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-silver/70">
              The price only goes up
            </p>
            <div className="mt-4 flex items-end justify-between gap-2">
              {VERSION_LADDER.map((step) => (
                <div key={step.version} className="flex-1 text-center">
                  <p
                    className={`font-display text-lg font-semibold ${
                      step.current ? 'text-brand-light' : 'text-silver/50'
                    }`}
                  >
                    {formatPrice(step.price)}
                  </p>
                  <p className={`mt-1 text-xs ${step.current ? 'text-ink' : 'text-silver/50'}`}>
                    {step.version} {step.current ? '· now' : ''}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-silver/80">
              Each new version launches at a higher price for new clubs. Clubs that already own
              Kouci only ever pay for optional add-ons — buying {LICENSE.version} is the best deal
              this product will ever have.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------ Buyer details */}
        <section aria-labelledby="details-title" className="card h-fit p-7 md:p-9">
          <h2 id="details-title" className="font-display text-xl font-semibold text-ink">
            Your club
          </h2>
          <p className="mt-1 text-sm text-silver">
            We use this to prepare your license and installation.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            {status === 'error' && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-center text-sm text-red-200"
              >
                Something went wrong starting the checkout. Please try again.
              </div>
            )}
            {status === 'unavailable' && (
              <div
                role="alert"
                className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-silver"
              >
                <span className="font-medium text-brand-light">Checkout opens shortly.</span>{' '}
                Payments aren’t switched on yet — leave your details through the{' '}
                <Link to="/#early-access" className="text-brand-light underline">
                  early-access form
                </Link>{' '}
                and we’ll reserve your founder price.
              </div>
            )}

            <Field
              id="co-club"
              label="Club name"
              type="text"
              autoComplete="organization"
              placeholder="CN Lisboa"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              error={errors.club}
            />
            <Field
              id="co-name"
              label="Contact name"
              type="text"
              autoComplete="name"
              placeholder="Alex Marques"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <Field
              id="co-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="office@club.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Field
              id="co-country"
              label="Country (optional)"
              type="text"
              autoComplete="country-name"
              placeholder="Portugal"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            {/* White-label — coming soon */}
            <div className="relative rounded-xl border border-dashed border-white/15 bg-bg/40 p-4">
              <span className="absolute -top-2.5 right-3 rounded-full border border-brand/40 bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-light">
                Coming soon
              </span>
              <p className="text-sm font-medium text-ink">Your club’s own app</p>
              <p className="mt-1 text-xs leading-relaxed text-silver">
                Soon you’ll upload your club’s logo here and we’ll generate your build with your
                colors and crest baked in. License holders get it first — we’ll ask for your logo
                the moment it ships.
              </p>
              <div
                aria-disabled="true"
                className="mt-3 flex cursor-not-allowed items-center justify-center rounded-lg border border-white/10 bg-bg/60 px-4 py-5 text-xs text-silver/50"
              >
                Logo upload — available at launch
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={status === 'submitting'} withArrow>
              {status === 'submitting'
                ? 'Opening secure checkout…'
                : `Pay ${formatPrice(LICENSE.price)} — secure checkout`}
            </Button>

            <p className="text-center text-xs text-silver/60">
              By paying you agree to the{' '}
              <Link to="/terms" className="text-silver underline underline-offset-2 hover:text-ink">
                License Terms
              </Link>
              .
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-silver/70">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4Zm2 6H6V5a2 2 0 1 1 4 0v2Z" />
                </svg>
                Payment handled by Stripe
              </span>
              <span>·</span>
              <span>Invoice &amp; tax ID collected at checkout</span>
              <span>·</span>
              <span>We never see your card</span>
            </div>

            {/* Bank-transfer path — how most European club treasuries actually pay. */}
            <div className="rounded-xl border border-white/10 bg-bg/50 px-4 py-3.5 text-center text-sm text-silver">
              <span className="font-medium text-ink">Prefer bank transfer?</span> Most clubs pay by
              invoice —{' '}
              {HAS_CONTACT_EMAIL ? (
                <a
                  href={INVOICE_MAILTO}
                  onClick={() => track('invoice_request_click')}
                  className="text-brand-light hover:underline"
                >
                  request an invoice
                </a>
              ) : (
                <Link
                  to="/#early-access"
                  onClick={() => track('invoice_request_click')}
                  className="text-brand-light hover:underline"
                >
                  ask for an invoice via the demo form
                </Link>
              )}{' '}
              and we’ll send payment details within one business day. Same price, same license.
            </div>
          </form>
        </section>
      </div>

      {/* What happens next */}
      <section aria-labelledby="next-title" className="mx-auto mt-14 max-w-5xl">
        <h2 id="next-title" className="text-center font-display text-lg font-semibold text-ink">
          What happens after you pay
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Within 24h', 'We contact you to schedule installation and set up your club.'],
            ['Week one', 'Assisted install + a training session for your coaching staff.'],
            [
              'Every season',
              'Your data compounds — and future versions cost you add-ons, not licenses.',
            ],
          ].map(([when, what]) => (
            <li key={when} className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-light">
                {when}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-silver">{what}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm text-silver">
          Want to see it before you buy?{' '}
          <Link to="/#early-access" className="text-brand-light hover:underline">
            Book a guided demo
          </Link>{' '}
          — 30 minutes, on your club’s context.
        </p>
      </section>
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = Checkout
