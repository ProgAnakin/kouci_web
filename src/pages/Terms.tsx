import { Seo } from '../components/Seo'
import { SITE_NAME, SITE_URL } from '../lib/site'

/**
 * Terms of use for this marketing site + early-access programme. Like the
 * privacy policy, the [BRACKETED] placeholders MUST be filled in with real
 * legal details before relying on this. It is not legal advice.
 */
export function Terms() {
  return (
    <main id="main" className="container-content pb-24 pt-32 md:pt-40">
      <Seo
        title={`Terms of Use | ${SITE_NAME}`}
        description="The terms that govern the use of the Kouci website and early-access programme."
        path="/terms"
      />
      <article className="prose prose-kouci mx-auto max-w-2xl">
        <h1>Terms of Use</h1>
        <p>
          <em>Last updated: 5 July 2026</em>
        </p>
        <p>
          These terms govern your use of <strong>{SITE_URL.replace('https://', '')}</strong> (the
          “Site”) and of the Kouci early-access programme. By using the Site, you agree to them.
        </p>

        <h2>1. Who we are</h2>
        <p>
          The Site is operated by <strong>[YOUR LEGAL ENTITY / NAME]</strong>, based in Portugal
          (EU). Contact: <strong>[YOUR CONTACT EMAIL]</strong>.
        </p>

        <h2>2. What this Site is</h2>
        <p>
          The Site presents <strong>{SITE_NAME}</strong>, a water polo tactical and statistical
          analysis application currently <strong>in development</strong>. Content on the Site —
          including feature descriptions, visuals and timelines — describes a product before its
          launch and may change without notice. Nothing on the Site is a binding offer.
        </p>

        <h2>3. Early access</h2>
        <p>
          Joining the early-access list gives no guarantee of access, timing, price or features. It
          registers your interest, and we will contact you as described in the{' '}
          <a href="/privacy">Privacy Policy</a>. Any future purchase or licence of the Kouci
          application will be governed by its own terms, presented at that time.
        </p>

        <h2>4. Intellectual property</h2>
        <p>
          The Kouci name, logo, design, 3D scenes, text and imagery on this Site are owned by{' '}
          <strong>[YOUR LEGAL ENTITY / NAME]</strong> (or used with permission) and are protected by
          law. You may not copy, redistribute or create derivative works from them without written
          consent, except for personal, non-commercial viewing.
        </p>

        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>disrupt or attempt to breach the Site’s security or availability;</li>
          <li>submit false or misleading information through our forms;</li>
          <li>use automated tools to scrape or spam the Site or its forms.</li>
        </ul>

        <h2>6. Third-party services</h2>
        <p>
          The Site links to third-party platforms (e.g. social networks) and relies on third-party
          processors (see the <a href="/privacy">Privacy Policy</a>). We are not responsible for
          third-party content or practices.
        </p>

        <h2>7. Disclaimer and liability</h2>
        <p>
          The Site is provided “as is”, without warranties of any kind. To the maximum extent
          permitted by law, we are not liable for damages arising from your use of the Site or from
          reliance on pre-launch information. Nothing in these terms limits liability that cannot be
          limited under applicable law.
        </p>

        <h2>8. Changes</h2>
        <p>
          We may update these terms as the product evolves; the “last updated” date above will
          change accordingly. Continued use of the Site after an update means you accept the revised
          terms.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by Portuguese law, and any dispute is subject to the competent
          courts of Portugal, without prejudice to mandatory consumer protections in your country of
          residence.
        </p>
      </article>
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = Terms
