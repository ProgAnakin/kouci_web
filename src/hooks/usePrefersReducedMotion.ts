import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Reactive `prefers-reduced-motion` flag. Components use this to freeze or
 * skip 3D/scroll animations for users who request reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  // Start `false` to match the server-rendered HTML exactly (window/matchMedia
  // don't exist during static generation). Reconcile on the client after mount,
  // so hydration never sees a mismatch.
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    setReduced(mql.matches)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
