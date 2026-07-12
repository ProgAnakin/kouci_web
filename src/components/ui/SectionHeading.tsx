import type { ReactNode } from 'react'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  /** Optional supporting line under (stack) or beside (split) the title. */
  lead?: ReactNode
  /**
   * 'stack'  — eyebrow, title and lead stacked in a measure-capped column.
   * 'split'  — editorial 12-col header: title owns the left, the lead sits
   *            bottom-aligned on the right, so wide screens have no dead lane.
   * 'center' — reserved for true focal moments only.
   */
  layout?: 'stack' | 'split' | 'center'
  /** Used to associate the section's aria-labelledby with this heading. */
  id?: string
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  layout = 'stack',
  id,
}: SectionHeadingProps) {
  if (layout === 'split') {
    return (
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2
            id={id}
            className="mt-4 text-3xl font-semibold leading-tight text-ink md:text-4xl lg:text-5xl"
          >
            {title}
          </h2>
        </div>
        {lead && (
          <div className="lg:col-span-4 lg:col-start-9 lg:pb-1.5">
            <span aria-hidden="true" className="mb-4 hidden h-px w-10 bg-brand/70 lg:block" />
            <p className="text-base leading-relaxed text-silver md:text-lg">{lead}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={layout === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 id={id} className="mt-4 text-3xl font-semibold leading-tight text-ink md:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-silver md:text-lg">{lead}</p>}
    </div>
  )
}
