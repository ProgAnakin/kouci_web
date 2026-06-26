/**
 * Dependency-free bridge between GSAP ScrollTrigger (DOM world) and
 * React Three Fiber's render loop (useFrame). ScrollTrigger writes the
 * normalized scroll progress here; the 3D camera rig reads it every frame.
 *
 * A plain mutable module object is intentional: it avoids re-renders and
 * keeps the hot path allocation-free, which matters at 60fps.
 */
export const scrollState = {
  /** Whole-page scroll progress, 0 (top) → 1 (bottom). */
  progress: 0,
  /** Progress through the hero section only, 0 → 1. */
  hero: 0,
}

export type ScrollState = typeof scrollState
