import { useRef } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'

/**
 * Freezes the outlet for one route instance. When the location changes, react-
 * router's data-router Outlet updates synchronously — so to animate the *old*
 * page out we must keep rendering the outlet it mounted with. A new keyed
 * instance mounts for the new route and freezes that one. This is what lets
 * AnimatePresence "mode=wait" show the outgoing page during its exit.
 */
function FrozenOutlet() {
  const outlet = useOutlet()
  const frozen = useRef(outlet)
  return <>{frozen.current}</>
}

/**
 * Cross-route transition: the outgoing page fades/slides up and out, then the
 * incoming page fades/slides in. Keyed by pathname only, so in-page hash links
 * (e.g. /#features) never trigger it.
 *
 * SSG-safe: AnimatePresence `initial={false}` means the first (server-rendered)
 * page is painted at its resolved `animate` state — no opacity:0 baked into the
 * static HTML, no hydration flash. Fully skipped under reduced motion.
 */
export function PageTransition() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: reduce ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        <FrozenOutlet />
      </m.div>
    </AnimatePresence>
  )
}
