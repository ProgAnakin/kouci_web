import { LazyMotion, domAnimation } from 'motion/react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { ScrollToHash } from './components/ScrollToHash'
import { PageTransition } from './components/PageTransition'
import { useSmoothScroll } from './hooks/useSmoothScroll'

/**
 * Persistent shell shared by every route: smooth scroll, progress bar, skip
 * link, navbar, the animated page outlet, and the footer. All scroll/Lenis
 * logic runs in effects, so this renders cleanly during static generation too.
 *
 * A single LazyMotion (with the lightweight `domAnimation` feature set, `strict`
 * so only the tree-shakeable `m` component is used) powers every motion element
 * on the site — page transitions, the mobile menu, the FAQ, the hero parallax —
 * without pulling the full motion bundle onto any page.
 */
export function RootLayout() {
  // Inertial smooth scroll (reduced-motion safe), site-wide.
  useSmoothScroll()

  return (
    <LazyMotion features={domAnimation} strict>
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <ScrollToHash />
      <Navbar />

      <PageTransition />

      <Footer />
      {/* Cookieless visit + performance telemetry (only active on Vercel). */}
      <Analytics />
      <SpeedInsights />
    </LazyMotion>
  )
}
