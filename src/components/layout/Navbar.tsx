import { useEffect, useState } from 'react'
import { ButtonLink } from '../ui/Button'
import { Logo } from '../ui/Logo'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#audience', label: 'Who it’s for' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

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
          <a href="#hero" aria-label="Kouci — home" className="rounded-full">
            <Logo />
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative text-sm text-silver transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-brand-light after:transition-all after:duration-300 hover:text-ink hover:after:w-full"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <ButtonLink href="#early-access" className="!px-5 !py-2">
            Get Early Access
          </ButtonLink>
        </nav>
      </div>
    </header>
  )
}
