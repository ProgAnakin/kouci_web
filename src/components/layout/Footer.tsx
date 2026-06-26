import { Logo } from '../ui/Logo'

// Social links are placeholders. TODO: point these at the real Kouci profiles.
const socials = [
  { label: 'Instagram', href: '#' },
  { label: 'X', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'YouTube', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-14">
      <div className="container-content">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="#hero" aria-label="Kouci — home" className="inline-flex rounded-full">
              <Logo />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-silver">
              Water polo tactical &amp; statistical analysis for coaches and analysts.
              Master Every Play.
            </p>
          </div>

          <nav aria-label="Social" className="flex flex-wrap gap-x-8 gap-y-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={`Kouci on ${s.label}`}
                className="text-sm text-silver transition-colors hover:text-brand-light"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-silver/70 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Kouci. All rights reserved.</span>
          <span>Made for water polo.</span>
        </div>
      </div>
    </footer>
  )
}
