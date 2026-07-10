import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { track } from '@vercel/analytics'
import { ButtonLink } from '../ui/Button'
import { Logo } from '../ui/Logo'

const sections = [
  { id: 'features', label: 'Features' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'audience', label: 'Who it’s for' },
  { id: 'faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { pathname } = location
  const isHome = pathname === '/'
  const reduce = useReducedMotion()

  // On the home page, section links are native anchors (smooth-scrolled by
  // Lenis). From any other page they point back to the home section.
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Close the mobile menu on any navigation (route or hash) and on Escape.
  useEffect(() => {
    setOpen(false)
  }, [location])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass =
    'relative text-sm text-silver transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-brand-light after:transition-all after:duration-300 hover:text-ink hover:after:w-full'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container-content">
        <nav
          aria-label="Primary"
          className={`mt-4 flex items-center justify-between rounded-full border px-5 transition-all duration-300 ${
            scrolled || open
              ? 'border-white/10 bg-bg/80 py-2.5 shadow-lg shadow-black/30 backdrop-blur-xl'
              : 'border-white/5 bg-bg/40 py-3 backdrop-blur-md'
          }`}
        >
          <Link to="/" aria-label="Kouci — home" className="rounded-full">
            {/* On very small screens the KC mark stands alone — the wordmark
                would collide with the CTA button. */}
            <Logo wordmarkClassName="hidden min-[440px]:inline" />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={sectionHref(section.id)} className={linkClass}>
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/blog"
                className={linkClass}
                aria-current={pathname.startsWith('/blog') ? 'page' : undefined}
              >
                Blog
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <ButtonLink
              href={isHome ? '#early-access' : '/#early-access'}
              className="whitespace-nowrap !px-5 !py-2"
              onClick={() => track('cta_click', { placement: 'navbar', label: 'early_access' })}
            >
              Get Early Access
            </ButtonLink>

            {/* Mobile menu toggle — the section links live in the disclosure
                panel below on small screens. */}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-white/5 md:hidden"
            >
              <span className="relative block h-3.5 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition-transform duration-200 ${
                    open ? 'translate-y-[6px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded bg-current transition-opacity duration-200 ${
                    open ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full rounded bg-current transition-transform duration-200 ${
                    open ? '-translate-y-[6px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile disclosure panel — spring slide-down via motion. The header is
            fixed, so the panel never pushes page content. */}
        <AnimatePresence initial={false}>
          {open && (
            <m.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }
              }
              className="md:hidden"
            >
              <ul className="mt-2 flex flex-col rounded-2xl border border-white/10 bg-bg/95 p-2 shadow-lg shadow-black/40 backdrop-blur-xl">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={sectionHref(section.id)}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-silver transition-colors hover:bg-white/5 hover:text-ink"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    to="/blog"
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith('/blog') ? 'page' : undefined}
                    className="block rounded-lg px-3 py-2.5 text-sm text-silver transition-colors hover:bg-white/5 hover:text-ink"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
