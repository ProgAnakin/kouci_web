/**
 * JS mirror of the hero water height field (src/three/shaders/water.ts).
 * Keep the terms in sync with the GLSL `waveHeight` so objects that float on
 * the surface (lane ropes, etc.) ride the exact same swell.
 */
export const WATER_Y = -0.6

export function waveHeight(px: number, py: number, t: number): number {
  let h = 0
  h += Math.sin(px * 0.55 + t * 0.8) * 0.16
  h += Math.sin(py * 0.85 - t * 0.62) * 0.11
  h += Math.sin((px + py) * 0.4 + t * 0.5) * 0.09
  h += Math.sin(px * 1.7 - t * 1.1) * 0.04
  return h
}

/**
 * World-space surface height at (x, z). The water plane is rotated -90° about
 * X, so the shader's local p = (x, y) maps to world (x, -z).
 */
export function surfaceY(x: number, z: number, t: number): number {
  return WATER_Y + waveHeight(x, -z, t)
}
