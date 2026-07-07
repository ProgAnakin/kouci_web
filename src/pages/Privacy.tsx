import { Seo } from '../components/Seo'
import { SITE_NAME, LEGAL_ENTITY, CONTACT_EMAIL } from '../lib/site'

/**
 * Privacy policy for the site's data collection (the early-access form + basic
 * analytics). This is a GDPR-oriented template: the placeholders in [BRACKETS]
 * MUST be filled in with your real legal details before this is relied upon.
 * It is not legal advice — have it reviewed if in doubt.
 */
export function Privacy() {
  return (
    <main id="main" className="container-content pb-24 pt-32 md:pt-40">
      <Seo
        title={`Privacy Policy | ${SITE_NAME}`}
        description="How Kouci collects, uses, and protects the personal data you share through this site."
        path="/privacy"
      />
      <article className="prose prose-kouci mx-auto max-w-2xl">
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: 1 July 2026</em>
        </p>
        <p>
          This policy explains how {SITE_NAME} handles the personal data you share through this
          website. We keep data collection to the minimum and never sell it.
        </p>

        <h2>1. Who is responsible</h2>
        <p>
          The controller of your data is <strong>{LEGAL_ENTITY}</strong>, based in Portugal (EU).
          For any privacy question or request, contact <strong>{CONTACT_EMAIL}</strong>.
        </p>

        <h2>2. What we collect</h2>
        <ul>
          <li>
            <strong>Early-access form:</strong> the <strong>name</strong>,{' '}
            <strong>email address</strong>, <strong>club/team</strong> and <strong>role</strong> you
            submit — plus, optionally, your <strong>country</strong> and whether you’d like a guided
            demo.
          </li>
          <li>
            <strong>Basic analytics:</strong> aggregated, anonymous usage statistics (page views,
            country, device type) via Vercel Web Analytics. This uses <strong>no cookies</strong>{' '}
            and does not identify you.
          </li>
        </ul>

        <h2>3. Why we use it, and the legal basis</h2>
        <p>
          We use your name and email <strong>only</strong> to contact you about Kouci’s launch and
          early access. The legal basis is your <strong>consent</strong> (Article 6(1)(a) GDPR),
          given when you tick the box and submit the form. You can withdraw it at any time.
        </p>

        <h2>4. Who we share it with</h2>
        <p>We do not sell your data. We use two processors to run the site:</p>
        <ul>
          <li>
            <strong>Formspree</strong> — receives and stores the form submissions on our behalf.
          </li>
          <li>
            <strong>Vercel</strong> — hosts the site and provides the anonymous analytics.
          </li>
        </ul>

        <h2>5. International transfers</h2>
        <p>
          Formspree and Vercel are based in the United States, so your data may be processed outside
          the European Economic Area. Where that happens, it is covered by the appropriate
          safeguards (e.g. Standard Contractual Clauses / EU–US Data Privacy Framework).
        </p>

        <h2>6. How long we keep it</h2>
        <p>
          We keep your early-access details until Kouci launches and we have told you, or until you
          ask us to delete them or withdraw consent — whichever comes first.
        </p>

        <h2>7. Your rights</h2>
        <p>Under the GDPR you can, at any time:</p>
        <ul>
          <li>access the data we hold about you, and have it corrected;</li>
          <li>have it deleted, or ask us to stop using it (withdraw consent);</li>
          <li>receive a copy of it (portability);</li>
          <li>
            lodge a complaint with the Portuguese supervisory authority, the <strong>CNPD</strong> (
            <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">
              cnpd.pt
            </a>
            ).
          </li>
        </ul>
        <p>
          To exercise any of these, email <strong>{CONTACT_EMAIL}</strong> and we will respond
          within 30 days.
        </p>

        <h2>8. Changes to this policy</h2>
        <p>
          If we change how we handle your data, we will update this page and its “last updated”
          date.
        </p>
      </article>
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = Privacy
