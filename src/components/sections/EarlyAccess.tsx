import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { track } from '@vercel/analytics'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Reveal } from '../ui/Reveal'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Where early-access signups are sent. Configure VITE_FORMSPREE_ENDPOINT in
// your environment (see .env.example) — the form surfaces a clear error if unset.
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT

const ROLES = [
  'Head coach',
  'Assistant coach',
  'Analyst',
  'Club director',
  'Player',
  'Other',
] as const

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Errors = { name?: string; email?: string; club?: string; role?: string; consent?: string }

export function EarlyAccess() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [club, setClub] = useState('')
  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [wantsDemo, setWantsDemo] = useState(true)
  const [consent, setConsent] = useState(false)
  // Honeypot: real users leave this empty; bots that fill every field trip it,
  // and Formspree silently drops any submission where `_gotcha` is non-empty.
  const [botField, setBotField] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')

  function validate() {
    const next: Errors = {}
    if (!name.trim()) next.name = 'Please enter your name.'
    if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.'
    if (!club.trim()) next.club = 'Please enter your club or team.'
    if (!role) next.role = 'Please select your role.'
    if (!consent) next.consent = 'Please accept the privacy policy to continue.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    setStatus('submitting')

    try {
      if (!FORMSPREE_ENDPOINT) throw new Error('Missing VITE_FORMSPREE_ENDPOINT')
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          club: club.trim(),
          role,
          country: country.trim(),
          wants_demo: wantsDemo ? 'yes' : 'no',
          _gotcha: botField,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      track('early_access_signup', { role, wants_demo: wantsDemo })
      if (wantsDemo) track('demo_requested', { role })
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border bg-bg/60 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-light'

  return (
    <section
      id="early-access"
      aria-labelledby="early-access-title"
      className="relative overflow-hidden border-t border-white/5 py-24 md:py-32"
    >
      {/* Focal glow — pushed left, behind the pitch column. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[22%] top-1/2 h-[420px] w-[720px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="container-content relative">
        {/* Split card: the pitch makes the case on the left, the form does the
            work on the right — the section finally earns its full width. */}
        <Reveal className="card grid overflow-hidden lg:grid-cols-[1fr_1.15fr]">
          <div className="border-b border-white/5 bg-bg/30 p-8 md:p-10 lg:border-b-0 lg:border-r">
            <p className="eyebrow">Not ready to buy today?</p>
            <h2
              id="early-access-title"
              className="mt-4 text-3xl font-semibold leading-tight text-ink md:text-4xl"
            >
              See it on your club first
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-silver">
              A 30-minute guided demo, on your club’s context — your teams, your questions. No spam,
              ever.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Live walkthrough on your club’s real situations',
                'Your founder price reserved while you decide',
                'Every question answered by the people building it',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-ink/90">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-light"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 md:p-10">
            {status === 'success' ? (
              <div
                role="status"
                className="flex h-full flex-col justify-center rounded-2xl border border-brand/30 bg-brand/10 p-6 text-center"
              >
                <p className="font-display text-lg font-semibold text-brand-light">
                  You’re on the list.
                </p>
                <p className="mt-2 text-sm text-silver">
                  Thanks, {name.trim().split(' ')[0] || 'coach'}. We’ll be in touch at{' '}
                  {email.trim()}
                  {wantsDemo ? ' to schedule your demo.' : '.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {status === 'error' && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-center text-sm text-red-200"
                  >
                    Something went wrong. Please try again.
                  </div>
                )}
                <Field
                  id="name"
                  label="Name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Marques"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="coach@club.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <Field
                  id="club"
                  label="Club / team"
                  type="text"
                  autoComplete="organization"
                  placeholder="CN Lisboa"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  error={errors.club}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-ink">
                      Your role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      aria-invalid={errors.role ? true : undefined}
                      aria-describedby={errors.role ? 'role-error' : undefined}
                      className={`${inputClass} ${errors.role ? 'border-red-400/60' : 'border-white/10'} ${role ? '' : 'text-silver/50'}`}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-surface text-ink">
                          {r}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <p id="role-error" className="mt-2 text-xs text-red-300">
                        {errors.role}
                      </p>
                    )}
                  </div>
                  <Field
                    id="country"
                    label="Country (optional)"
                    type="text"
                    autoComplete="country-name"
                    placeholder="Portugal"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                {/* Honeypot — visually hidden, not shown to real users. */}
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                />

                <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-bg/40 px-4 py-3 text-left text-sm text-silver transition-colors hover:border-brand/40">
                  <input
                    type="checkbox"
                    checked={wantsDemo}
                    onChange={(e) => setWantsDemo(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-bg/60 accent-brand"
                  />
                  <span>
                    <span className="font-medium text-ink">I’d like a guided demo</span>
                    <span className="block text-xs text-silver/80">
                      A 30-minute walkthrough of Kouci on your club’s context, before launch.
                    </span>
                  </span>
                </label>

                <div>
                  <label className="flex items-start gap-3 text-left text-xs leading-relaxed text-silver/80">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? 'consent-error' : undefined}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-bg/60 accent-brand"
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/privacy" className="text-brand-light hover:underline">
                        Privacy Policy
                      </Link>{' '}
                      and to being emailed about Kouci’s launch.
                    </span>
                  </label>
                  {errors.consent && (
                    <p id="consent-error" className="mt-2 text-xs text-red-300">
                      {errors.consent}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                  {status === 'submitting'
                    ? 'Sending…'
                    : wantsDemo
                      ? 'Book my demo'
                      : 'Request access'}
                </Button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
