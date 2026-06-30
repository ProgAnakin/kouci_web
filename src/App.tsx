import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { ScrollToHash } from './components/ScrollToHash'
import { LandingPage } from './pages/LandingPage'
import { useSmoothScroll } from './hooks/useSmoothScroll'

// The blog (router + markdown renderer + posts) is split out so the landing
// page never pays for it. It loads on demand when /blog is visited.
const BlogIndex = lazy(() => import('./pages/BlogIndex').then((m) => ({ default: m.BlogIndex })))
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

function RouteFallback() {
  return <div aria-hidden="true" className="min-h-[60vh]" />
}

export default function App() {
  // Inertial smooth scroll (reduced-motion safe) for a premium feel, site-wide.
  useSmoothScroll()

  return (
    <BrowserRouter>
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <ScrollToHash />
      <Navbar />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  )
}
