import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const audience = [
  {
    title: 'Head coaches',
    body: 'Walk into every game knowing exactly what each player did last time — and what the opponent tends to do under pressure.',
  },
  {
    title: 'Analysts',
    body: 'Turn a season of matches into clean, queryable data instead of a stack of notebooks and half-remembered moments.',
  },
  {
    title: 'Clubs',
    body: 'Give every team in the club one shared way to track players, penalties and tactics from youth squads up.',
  },
  {
    title: 'Federations',
    body: 'Standardize how matches are recorded and scouted across programs, with data that travels between staff.',
  },
]

export function Audience() {
  return (
    <section
      id="audience"
      aria-labelledby="audience-title"
      className="border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <SectionHeading
          id="audience-title"
          eyebrow="Who it’s for"
          title="Made for the people on the bench"
          lead="Kouci is built for everyone who lives and dies by the next set — not just the scoreboard."
        />

        <Reveal as="ul" stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((a) => (
            <li key={a.title} className="card card-lift group flex flex-col p-6">
              <h3 className="font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-light">
                {a.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-silver">{a.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
