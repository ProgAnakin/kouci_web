import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SITE_NAME } from '../lib/site'

export function CheckoutSuccess() {
  return (
    <main
      id="main"
      className="container-content flex min-h-[70vh] flex-col items-center justify-center py-32 text-center"
    >
      <Seo
        title={`Welcome aboard | ${SITE_NAME}`}
        description="Your Kouci club license is confirmed."
        path="/checkout/success"
        noindex
      />

      <span
        aria-hidden="true"
        className="grid h-16 w-16 place-items-center rounded-full border border-brand/40 bg-brand/15 text-3xl text-brand-light"
      >
        ✓
      </span>
      <h1 className="mt-6 text-4xl font-semibold text-ink md:text-5xl">Welcome aboard, coach.</h1>
      <p className="mt-4 max-w-md text-silver">
        Your club’s license is confirmed — the receipt and invoice are on their way to your inbox.
        We’ll be in touch <strong className="text-ink">within 24 hours</strong> to schedule your
        installation and staff training.
      </p>

      <ol className="mt-10 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
        {[
          ['1 · Today', 'Receipt + invoice by email.'],
          ['2 · Within 24h', 'We reach out to schedule your install.'],
          ['3 · Week one', 'Your staff is trained and tracking matches.'],
        ].map(([when, what]) => (
          <li key={when} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-light">
              {when}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-silver">{what}</p>
          </li>
        ))}
      </ol>

      <Link
        to="/"
        className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-brand-light"
      >
        Back to Kouci
      </Link>
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = CheckoutSuccess
