import { Hero } from '../components/sections/Hero'
import { PromiseSection } from '../components/sections/Promise'
import { Features } from '../components/sections/Features'
import { Showcase } from '../components/sections/Showcase'
import { Audience } from '../components/sections/Audience'
import { Reviews } from '../components/sections/Reviews'
import { EarlyAccess } from '../components/sections/EarlyAccess'
import { Seo } from '../components/Seo'
import { SITE_URL, SITE_NAME, SOCIAL_LINKS, absoluteUrl } from '../lib/site'
import { usePageScroll } from '../hooks/usePageScroll'

const DESCRIPTION =
  'Kouci turns water polo match data into a tactical edge — player stats, penalty and exclusion maps, animated set plays, and live game tracking. Built for water polo coaches and analysts.'

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description: DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Early access',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/og-image.png'),
    description: 'Water polo tactical and statistical analysis for coaches and analysts.',
    sameAs: SOCIAL_LINKS,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
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
        <PromiseSection />
        <Features />
        <Showcase />
        <Audience />
        <Reviews />
        <EarlyAccess />
      </main>
    </>
  )
}
