import { features } from '../../data/features'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { FeatureVisual } from './FeatureVisual'

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="border-t border-white/5 py-24 md:py-32"
    >
      <div className="container-content">
        <SectionHeading
          id="features-title"
          layout="split"
          eyebrow="What Kouci does"
          title="Four tools that turn a season into signal"
          lead="From the first roster of the year to the last whistle of the final, every part of Kouci feeds the same picture of your team."
        />

        <div className="mt-16 space-y-6 md:space-y-8">
          {features.map((feature, i) => (
            <Reveal
              key={feature.id}
              as="article"
              pop
              distance={44}
              aria-labelledby={`feature-${feature.id}`}
              className="card card-lift group grid items-center gap-8 p-6 md:grid-cols-2 md:gap-12 md:p-10"
            >
              {/* Visual — alternates side on desktop for rhythm. */}
              <div
                className={`order-1 ${i % 2 === 1 ? 'md:order-2' : ''} aspect-[8/5] overflow-hidden rounded-xl border border-white/5 bg-bg/60`}
              >
                <FeatureVisual id={feature.id} />
              </div>

              <div className={`order-2 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-semibold text-brand-light">
                    {feature.index}
                  </span>
                  <span className="h-px w-8 bg-brand/40" />
                  <span className="eyebrow !text-silver">{feature.eyebrow}</span>
                </div>
                <h3
                  id={`feature-${feature.id}`}
                  className="mt-4 text-2xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-light md:text-3xl"
                >
                  {feature.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-silver">{feature.description}</p>
                <ul className="mt-5 space-y-2">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-ink/90">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-light"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
