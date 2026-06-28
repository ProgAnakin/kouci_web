import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { PromiseSection } from './components/sections/Promise'
import { Features } from './components/sections/Features'
import { Showcase } from './components/sections/Showcase'
import { Audience } from './components/sections/Audience'
import { EarlyAccess } from './components/sections/EarlyAccess'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { Analytics } from '@vercel/analytics/react'
import { usePageScroll } from './hooks/usePageScroll'
import { useSmoothScroll } from './hooks/useSmoothScroll'

export default function App() {
  // Inertial smooth scroll (reduced-motion safe) for a premium feel.
  useSmoothScroll()
  // Bridges page scroll → the hero camera (and keeps ScrollTrigger alive).
  usePageScroll('#hero')

  return (
    <>
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <PromiseSection />
        <Features />
        <Showcase />
        <Audience />
        <EarlyAccess />
      </main>

      <Footer />
      <Analytics />
    </>
  )
}
