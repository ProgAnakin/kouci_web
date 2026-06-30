import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Client-side routing scroll behaviour:
 * - navigating to a new route scrolls to the top,
 * - navigating to a URL with a hash (e.g. /#early-access) scrolls that section
 *   into view once it has mounted.
 * Renders nothing.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      // Wait a frame so the target section is in the DOM after a route change.
      const raf = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return () => cancelAnimationFrame(raf)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
