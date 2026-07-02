import { Reveal } from '../ui/Reveal'

const proofs = [
  {
    head: 'Four tools, one app',
    body: 'Roster, penalties, tactics and live stats — the whole analysis workflow in a single place.',
  },
  {
    head: 'Season-long memory',
    body: 'Every game compounds. Kouci remembers what each player did, shot after shot.',
  },
  {
    head: 'Ready on game day',
    body: 'Log stats live and walk away with the numbers already done — no late-night data entry.',
  },
]

export function PromiseSection() {
  return (
    <section
      aria-labelledby="promise-title"
      className="relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <Reveal>
          <p className="eyebrow">The promise</p>
          <h2
            id="promise-title"
            className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-ink md:text-5xl"
          >
            The pool moves fast. Your decisions should move faster.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-silver">
            Every set, every exclusion, every penalty tells a story. Kouci captures it — and hands
            you the clarity to act on it. Stop coaching from memory. Start coaching from data.
          </p>
        </Reveal>

        <Reveal
          as="dl"
          stagger
          delay={0.1}
          className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3"
        >
          {proofs.map((p) => (
            <div key={p.head} className="bg-bg p-7">
              <dt className="font-display text-lg font-semibold text-brand-light">{p.head}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-silver">{p.body}</dd>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
