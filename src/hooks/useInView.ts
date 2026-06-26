import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Stop observing after first intersection. Default true. */
  once?: boolean
  rootMargin?: string
  threshold?: number
}

/**
 * Lightweight IntersectionObserver hook. Used to defer mounting heavy 3D
 * canvases until they're about to scroll into view (lazy, on-demand GPU work).
 */
export function useInView<T extends HTMLElement>({
  once = true,
  rootMargin = '200px',
  threshold = 0.01,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return [ref, inView] as const
}
