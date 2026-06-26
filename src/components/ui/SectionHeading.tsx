import type { ReactNode } from 'react'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  /** Optional supporting line under the title. */
  lead?: ReactNode
  align?: 'left' | 'center'
  /** Used to associate the section's aria-labelledby with this heading. */
  id?: string
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  id,
}: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 id={id} className="mt-4 text-3xl font-semibold leading-tight text-ink md:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-silver md:text-lg">{lead}</p>}
    </div>
  )
}
