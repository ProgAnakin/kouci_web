import { Outlet } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { ScrollToHash } from './components/ScrollToHash'
import { useSmoothScroll } from './hooks/useSmoothScroll'

/**
 * Persistent shell shared by every route: smooth scroll, progress bar, skip
 * link, navbar, the page outlet, and the footer. All scroll/Lenis logic runs
 * in effects, so this renders cleanly during static generation too.
 */
export function RootLayout() {
  // Inertial smooth scroll (reduced-motion safe), site-wide.
  useSmoothScroll()

  return (
    <>
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <ScrollToHash />
      <Navbar />

      <Outlet />

      <Footer />
    </>
  )
}
