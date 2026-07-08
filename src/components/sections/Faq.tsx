import { useId, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
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

/**
 * Accessible disclosure: a real <button> toggles aria-expanded and controls the
 * answer panel by id. The answer stays mounted (so it's in the static HTML for
 * crawlers and AI) and is spring-animated open/closed via motion; it's
 * aria-hidden while collapsed so screen readers skip it. Reduced motion snaps.
 */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const id = useId()
  const panelId = `${id}-panel`
  const btnId = `${id}-btn`

  return (
    <div className="card overflow-hidden">
      <h3 className="m-0">
        <button
          type="button"
          id={btnId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-base font-medium text-ink transition-colors hover:text-brand-light"
        >
          {q}
          <span
            aria-hidden="true"
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 text-sm text-brand-light transition-transform duration-300 ${
              open ? 'rotate-45' : ''
            }`}
          >
            +
          </span>
        </button>
      </h3>
      <m.div
        id={panelId}
        aria-labelledby={btnId}
        aria-hidden={!open}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={
          reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }
        }
        style={{ overflow: 'hidden' }}
      >
        <p className="px-6 pb-5 text-sm leading-relaxed text-silver">{a}</p>
      </m.div>
    </div>
  )
}

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
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
