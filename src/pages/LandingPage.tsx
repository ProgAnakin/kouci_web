import { Hero } from '../components/sections/Hero'
import { PromiseSection } from '../components/sections/Promise'
import { Features } from '../components/sections/Features'
import { Showcase } from '../components/sections/Showcase'
import { Audience } from '../components/sections/Audience'
import { Reviews } from '../components/sections/Reviews'
import { EarlyAccess } from '../components/sections/EarlyAccess'
import { usePageScroll } from '../hooks/usePageScroll'

/**
 * The marketing landing page. Owns the hero-canvas scroll bridge so that
 * ScrollTrigger only runs while these sections are mounted (not on the blog).
 */
export function LandingPage() {
  // Bridges page scroll → the hero camera (and keeps ScrollTrigger alive).
  usePageScroll('#hero')

  return (
    <main id="main">
      <Hero />
      <PromiseSection />
      <Features />
      <Showcase />
      <Audience />
      <Reviews />
      <EarlyAccess />
    </main>
  )
}
