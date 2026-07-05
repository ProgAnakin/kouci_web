import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'

/**
 * FAQ content is exported so the landing page can also emit it as FAQPage
 * structured data (search engines and AI answer engines read that directly).
 * Keep answers in plain text — they are serialized into JSON-LD.
 */
export const FAQ_ITEMS = [
  {
    q: 'Is Kouci only for water polo?',
    a: 'Yes — and that is the point. Kouci is built exclusively around how water polo is played and coached: exclusions, power plays, penalty situations, and the rhythm of the four quarters. Nothing is adapted from a field-sport template.',
  },
  {
    q: 'What do I need to run it?',
    a: 'Kouci is an iOS & Android app. It runs on the phone or tablet you already bring to the pool deck, and it is designed to be usable courtside during a live match.',
  },
  {
    q: 'When does it launch?',
    a: 'Kouci is in active development with early access opening soon. Join the early-access list and you will be the first to know — clubs on the list get priority onboarding.',
  },
  {
    q: 'How much will it cost?',
    a: 'Pricing will be announced with the launch. Clubs on the early-access list hear first — and get the best conditions we will ever offer.',
  },
  {
    q: 'Who owns the data my club records?',
    a: 'Your club does, entirely. Your players, matches and statistics are yours — Kouci never sells data, and you can export everything at any time.',
  },
  {
    q: 'Can I see Kouci before the launch?',
    a: 'Yes. Request a guided demo in the early-access form — a 30-minute walkthrough of Kouci applied to your club’s context.',
  },
]

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <SectionHeading
          eyebrow="FAQ"
          id="faq-title"
          title="Questions coaches ask us"
          lead="Short and straight — the way you'd want it on the pool deck."
          align="center"
        />

        <Reveal className="mx-auto mt-12 max-w-2xl space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="card group overflow-hidden px-6 py-1 open:border-brand/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 text-sm text-brand-light transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pr-10 text-sm leading-relaxed text-silver">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
