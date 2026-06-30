import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ButtonLink } from '../ui/Button'
import { Logo } from '../ui/Logo'

const sections = [
  { id: 'features', label: 'Features' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'audience', label: 'Who it’s for' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

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

  const linkClass =
    'relative text-sm text-silver transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-brand-light after:transition-all after:duration-300 hover:text-ink hover:after:w-full'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container-content">
        <nav
          aria-label="Primary"
          className={`mt-4 flex items-center justify-between rounded-full border px-5 transition-all duration-300 ${
            scrolled
              ? 'border-white/10 bg-bg/80 py-2.5 shadow-lg shadow-black/30 backdrop-blur-xl'
              : 'border-white/5 bg-bg/40 py-3 backdrop-blur-md'
          }`}
        >
          <Link to="/" aria-label="Kouci — home" className="rounded-full">
            <Logo />
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
              <Link to="/blog" className={linkClass} aria-current={pathname.startsWith('/blog') ? 'page' : undefined}>
                Blog
              </Link>
            </li>
          </ul>

          <ButtonLink href={isHome ? '#early-access' : '/#early-access'} className="!px-5 !py-2">
            Get Early Access
          </ButtonLink>
        </nav>
      </div>
    </header>
  )
}
