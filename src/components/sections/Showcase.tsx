import { lazy, Suspense, type ReactNode } from 'react'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { CanvasFallback } from '../../three/Loader'
import { useCanvasActivation } from '../../hooks/useCanvasActivation'

// Each demo is its own code-split bundle + WebGL context, only mounted when
// it scrolls near the viewport — and paused again once it scrolls away.
const TacticsCanvas = lazy(() => import('../../three/TacticsCanvas'))
const PenaltyCanvas = lazy(() => import('../../three/PenaltyCanvas'))

interface PanelProps {
  title: string
  description: string
  /** Short alt text announced for the interactive canvas region. */
  ariaLabel: string
  /** Longer, screen-reader-only parallel description of the 3D content. */
  srDescription: ReactNode
  legend: ReactNode
  /** Render the canvas; `active` gates its render loop while on screen. */
  renderCanvas: (active: boolean) => ReactNode
}

function ShowcasePanel({
  title,
  description,
  ariaLabel,
  srDescription,
  legend,
  renderCanvas,
}: PanelProps) {
  const [ref, mount, active] = useCanvasActivation<HTMLDivElement>({ rootMargin: '300px' })

  return (
    <Reveal as="article" className="card overflow-hidden">
      <div
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        className="relative aspect-[4/3] w-full bg-bg sm:aspect-[16/10]"
      >
        {mount ? (
          <Suspense fallback={<CanvasFallback />}>{renderCanvas(active)}</Suspense>
        ) : (
          <CanvasFallback />
        )}
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-semibold text-ink md:text-2xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-silver">{description}</p>
        <div className="mt-5">{legend}</div>
      </div>
      {/* Parallel content for assistive tech — the data the scene shows. */}
      <div className="sr-only">{srDescription}</div>
    </Reveal>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

export function Showcase() {
  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      className="border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <SectionHeading
          id="showcase-title"
          eyebrow="See it move"
          title="Water polo is a visual game. So is Kouci."
          lead="The tactics board and the penalty map are where the data becomes a decision. Drag-free, drawn in 3D, ready to share."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <ShowcasePanel
            title="Animated tactics board"
            description="Set the formation with numbered caps, then watch the play animate along 3D arrows. Export the sequence to MP4 or GIF and send it to the group chat."
            ariaLabel="3D water polo tactics board with numbered caps and animated arrows"
            legend={
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-silver">
                <li className="flex items-center gap-2">
                  <Dot color="#9FAC82" /> Caps = players
                </li>
                <li className="flex items-center gap-2">
                  <Dot color="#C5C9C0" /> Arrows = movement &amp; passes
                </li>
              </ul>
            }
            srDescription={
              <p>
                A 3D water polo field shown from above, with six numbered player caps arranged in an
                attacking set and three animated arrows tracing movement toward the goal. Caps are
                colored by team and the whole sequence can be exported to MP4 or GIF.
              </p>
            }
            renderCanvas={(active) => <TacticsCanvas active={active} />}
          />

          <ShowcasePanel
            title="Penalty shot map"
            description="Every penalty a player has taken, plotted on the goal: where it went, whether it scored, if it was a first attempt, and whether it bounced off the water."
            ariaLabel="3D goal showing scored and missed penalty shots plotted across the net"
            legend={
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-silver">
                <li className="flex items-center gap-2">
                  <Dot color="#9FAC82" /> Goal
                </li>
                <li className="flex items-center gap-2">
                  <Dot color="#C5C9C0" /> Miss / saved
                </li>
              </ul>
            }
            srDescription={
              <p>
                A 3D water polo goal viewed from the front, with eight scored penalties plotted in
                the corners and five missed or saved attempts clustered centrally and outside the
                frame. Goals are shown in olive, misses in silver.
              </p>
            }
            renderCanvas={(active) => <PenaltyCanvas active={active} />}
          />
        </div>
      </div>
    </section>
  )
}
