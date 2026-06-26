import { ButtonLink } from '../ui/Button'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#audience', label: 'Who it’s for' },
]

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container-content">
        <nav
          aria-label="Primary"
          className="mt-4 flex items-center justify-between rounded-full border border-white/5 bg-bg/70 px-5 py-3 backdrop-blur-md"
        >
          <a href="#hero" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            {/* TODO: replace with the real Kouci wordmark/logo. */}
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-bg">K</span>
            Kouci
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-silver transition-colors hover:text-ink"
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
