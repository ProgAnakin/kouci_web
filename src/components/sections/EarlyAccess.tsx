import { useState, type FormEvent } from 'react'
import { track } from '@vercel/analytics'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Reveal } from '../ui/Reveal'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Where early-access signups are sent. Configure VITE_FORMSPREE_ENDPOINT in
// your environment (see .env.example) — the form surfaces a clear error if unset.
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function EarlyAccess() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [status, setStatus] = useState<Status>('idle')

  function validate() {
    const next: { name?: string; email?: string } = {}
    if (!name.trim()) next.name = 'Please enter your name.'
    if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.'
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
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      track('early_access_signup')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="early-access"
      aria-labelledby="early-access-title"
      className="relative overflow-hidden border-t border-white/5 py-24 md:py-32"
    >
      {/* Focal glow behind the card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="container-content relative">
        <Reveal className="card mx-auto max-w-3xl overflow-hidden p-8 md:p-12">
          <div className="text-center">
            <p className="eyebrow justify-center">Early access</p>
            <h2 id="early-access-title" className="mt-4 text-3xl font-semibold text-ink md:text-4xl">
              Be first on deck
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-silver">
              Join the coaches shaping Kouci. We’ll email you the moment early access opens —
              no spam, just the launch.
            </p>
          </div>

          {status === 'success' ? (
            <div
              role="status"
              className="mx-auto mt-10 max-w-md rounded-2xl border border-brand/30 bg-brand/10 p-6 text-center"
            >
              <p className="font-display text-lg font-semibold text-brand-light">You’re on the list.</p>
              <p className="mt-2 text-sm text-silver">
                Thanks, {name.trim().split(' ')[0] || 'coach'}. We’ll be in touch at {email.trim()}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mx-auto mt-10 max-w-md space-y-5">
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
              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Request Access'}
              </Button>
              <p className="text-center text-xs text-silver/70">
                We’ll only use your email to tell you about Kouci’s launch.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
