import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Grow the viewport box so work starts a little before the edge. */
  rootMargin?: string
}

/**
 * Lifecycle helper for heavy R3F canvases. Returns:
 *  - `mount`: false until the element first nears the viewport *and* the
 *    browser is idle, then latches true. Defers the 3D bundle + first render so
 *    initial paint and scroll stay smooth.
 *  - `active`: true only while the element is on screen — feed it to the
 *    Canvas `frameloop` so it stops rendering (and stops fighting the scroll)
 *    once scrolled away.
 */
export function useCanvasActivation<T extends HTMLElement>({ rootMargin = '200px' }: Options = {}) {
  const ref = useRef<T>(null)
  const [mount, setMount] = useState(false)
  const [active, setActive] = useState(false)
  const scheduled = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setMount(true)
      setActive(true)
      return
    }

    let idleId: number | undefined
    const scheduleMount = () => {
      if (scheduled.current) return
      scheduled.current = true
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(() => setMount(true), { timeout: 600 })
      } else {
        idleId = window.setTimeout(() => setMount(true), 150)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting)
        if (entry.isIntersecting) scheduleMount()
      },
      { rootMargin, threshold: 0 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (idleId !== undefined) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId)
        else window.clearTimeout(idleId)
      }
    }
  }, [rootMargin])

  return [ref, mount, active] as const
}
