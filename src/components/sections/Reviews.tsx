import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'

interface Testimonial {
  quote: string
  name: string
  role: string
  rating: number
  initials: string
}

/**
 * PLACEHOLDER testimonials. Replace these with real, attributable quotes from
 * your early-access coaches before launch — and keep the ratings honest. Each
 * entry is just data, so editing copy here is all it takes.
 */
const testimonials: Testimonial[] = [
  {
    quote:
      'The penalty maps showed us a pattern in our man-up we had completely missed. We fixed it in two training sessions.',
    name: 'Head Coach',
    role: 'Senior Men’s Team',
    rating: 5,
    initials: 'HC',
  },
  {
    quote:
      'Finally a tool that speaks water polo. Setting up a set play and replaying it to the squad takes minutes, not a wiped whiteboard.',
    name: 'Assistant Coach',
    role: 'National League Club',
    rating: 5,
    initials: 'AC',
  },
  {
    quote:
      'Tracking the match live and reviewing the stats straight after has changed how we prepare for the next opponent.',
    name: 'Performance Analyst',
    role: 'Women’s Programme',
    rating: 5,
    initials: 'PA',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={i < rating ? 'text-brand-light' : 'text-white/15'}
        >
          <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 15.7l-4.95 2.6.94-5.5-4-3.9 5.53-.8z" />
        </svg>
      ))}
    </div>
  )
}

export function Reviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <SectionHeading
          eyebrow="Early feedback"
          id="reviews-title"
          title="What coaches are saying"
          lead="Kouci is being shaped hand-in-hand with the coaches and analysts using it first."
          layout="center"
        />

        <Reveal as="div" stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name + t.role} className="card flex h-full flex-col p-6 md:p-8">
              <Stars rating={t.rating} />
              <blockquote className="mt-5 flex-1 text-base leading-relaxed text-ink/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/5 pt-5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand text-sm font-semibold text-bg"
                >
                  {t.initials}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">{t.name}</span>
                  <span className="text-xs text-silver/80">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
