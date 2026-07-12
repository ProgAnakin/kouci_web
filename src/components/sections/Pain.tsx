import { Reveal } from '../ui/Reveal'
import { IconChip, IconHistory, IconMoon, IconNotebook } from '../ui/icons'

/**
 * The problem, told the way it is lived on deck. This section exists to make a
 * coach nod three times before we show a single feature — recognition first,
 * product second.
 */
const pains = [
  {
    icon: <IconHistory />,
    head: 'The exclusion nobody remembers',
    body: 'By Monday, the details that decide games — who conceded, where, in which quarter — are gone. So decisions get made on gut feeling, again.',
  },
  {
    icon: <IconNotebook />,
    head: 'A season locked in notebooks',
    body: 'Years of matches live in paper pads and half-finished spreadsheets. When a coach moves on, the club’s entire memory walks out the door with them.',
  },
  {
    icon: <IconMoon />,
    head: 'Sunday nights lost to admin',
    body: 'Hours rebuilding stats after every match weekend — or, more honestly, never doing it at all. That’s coaching time, spent on data entry.',
  },
]

export function Pain() {
  return (
    <section
      id="pain"
      aria-labelledby="pain-title"
      className="relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <Reveal>
          <p className="eyebrow">Why Kouci exists</p>
          <h2
            id="pain-title"
            className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-ink md:text-5xl"
          >
            Coaching from memory is costing you games.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-silver">
            You know your team better than anyone. But after four quarters of adrenaline, memory is
            a terrible analyst — and every club is quietly paying for it.
          </p>
        </Reveal>

        <Reveal
          as="dl"
          stagger
          pop
          delay={0.1}
          className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3"
        >
          {pains.map((p) => (
            <div key={p.head} className="bg-bg p-7">
              <IconChip>{p.icon}</IconChip>
              <dt className="mt-4 font-display text-lg font-semibold text-brand-light">{p.head}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-silver">{p.body}</dd>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-lg leading-relaxed text-ink">
            Kouci exists so the next decision is never a guess —{' '}
            <span className="text-brand-light">
              your club’s matches, penalties and set plays, captured once and owned forever.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
