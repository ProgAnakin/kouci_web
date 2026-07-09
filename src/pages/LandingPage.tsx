import { Hero } from '../components/sections/Hero'
import { Pain } from '../components/sections/Pain'
import { Features } from '../components/sections/Features'
import { Pricing } from '../components/sections/Pricing'
import { Showcase } from '../components/sections/Showcase'
import { Audience } from '../components/sections/Audience'
import { CtaBand } from '../components/sections/CtaBand'
import { Faq, FAQ_ITEMS } from '../components/sections/Faq'
import { EarlyAccess } from '../components/sections/EarlyAccess'
// Reviews section is intentionally not rendered until real, attributable
// testimonials exist (see src/components/sections/Reviews.tsx). Re-add <Reviews />
// below <Audience /> once the placeholder quotes are replaced.
import { Seo } from '../components/Seo'
import { SITE_URL, SITE_NAME, SOCIAL_LINKS, absoluteUrl } from '../lib/site'
import { LICENSE } from '../lib/commerce'
import { usePageScroll } from '../hooks/usePageScroll'

const DESCRIPTION =
  'Kouci turns water polo match data into a tactical edge — player stats, penalty and exclusion maps, animated set plays, and live game tracking. Built for water polo coaches and analysts.'

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'SportsApplication',
    operatingSystem: 'iOS, Android',
    url: SITE_URL,
    description: DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: String(LICENSE.price),
      priceCurrency: LICENSE.currency,
      description: `${LICENSE.name} (${LICENSE.version}) — one-time payment per club`,
      url: absoluteUrl('/checkout'),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/brand/kouci-logo-512.png'),
    description: 'Water polo tactical and statistical analysis for coaches and analysts.',
    sameAs: SOCIAL_LINKS,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  },
]

/**
 * The marketing landing page. Owns the hero-canvas scroll bridge so that
 * ScrollTrigger only runs while these sections are mounted (not on the blog).
 */
export function LandingPage() {
  // Bridges page scroll → the hero camera (and keeps ScrollTrigger alive).
  usePageScroll('#hero')

  return (
    <>
      <Seo
        title="Kouci — Water Polo Tactical & Statistical Analysis for Coaches"
        description={DESCRIPTION}
        path="/"
        jsonLd={structuredData}
      />
      <main id="main">
        <Hero />
        <Pain />
        <Features />
        <Showcase />
        <CtaBand />
        <Audience />
        <Pricing />
        <Faq />
        <EarlyAccess />
      </main>
    </>
  )
}
