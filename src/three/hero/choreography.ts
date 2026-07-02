import * as THREE from 'three'

/**
 * Timing + pose data for the two-player pass loop.
 *
 * One half-cycle = one full pass (A throws, B catches); roles swap every half.
 * Within a half, normalized time u ∈ [0,1] moves through five beats:
 *
 *   carry ──(wind-up)──▶ cock ──(whip)──▶ release ─▶ [flight] ─▶ catch ──(absorb)──▶ carry
 *   0 ................. 0.30 ........... 0.42 .............. 0.80 .............. 0.92 ... 1
 *
 * The beats sell the motion: anticipation before the throw, a fast accelerating
 * whip, a lazy ballistic lob, and a soft give on the catch.
 */
export const HALF_CYCLE = 3.2 // seconds per pass

export const BEAT = {
  cockEnd: 0.3,
  release: 0.42,
  catch: 0.8,
  absorbEnd: 0.92,
}

export const easeInOut = (p: number) => p * p * (3 - 2 * p)
export const easeIn = (p: number) => p * p * p
export const easeOut = (p: number) => 1 - (1 - p) ** 3

/**
 * Reach-hand targets as offsets from the player's waterline base. `x` runs
 * toward the other player (sign-flipped for the mirrored player), `y` up from
 * the waterline, `z` toward the camera. Kept within the arm's reach (~0.70
 * from a shoulder at (±0.30, 0.24, 0.10)).
 */
export const POSE = {
  /** Ball resting in the hand in front of the chest. */
  carry: new THREE.Vector3(0.42, 0.42, 0.34),
  /** Wind-up: hand pulled up and behind the shoulder. */
  cock: new THREE.Vector3(0.02, 0.78, 0.0),
  /** Full extension at the moment the ball leaves. */
  release: new THREE.Vector3(0.68, 0.78, 0.16),
  /** Relaxed treading-water hand, near the surface. */
  idle: new THREE.Vector3(0.3, 0.1, 0.38),
  /** Arm up, waiting for the incoming ball. */
  ready: new THREE.Vector3(0.56, 0.84, 0.12),
  /** The catch gives back toward the chest, absorbing the ball. */
  absorb: new THREE.Vector3(0.44, 0.5, 0.28),
}

/** Where the ball sits relative to the reach hand while held. */
export const PALM_OFFSET = new THREE.Vector3(0, 0.12, 0.03)

const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

/** out = base + pose (x mirrored by sign), plus a soft organic sway. */
export function poseAt(
  out: THREE.Vector3,
  base: THREE.Vector3,
  pose: THREE.Vector3,
  sign: 1 | -1,
  t: number,
  phase: number,
  sway = 0.02,
) {
  out.set(base.x + pose.x * sign, base.y + pose.y, base.z + pose.z)
  out.x += Math.sin(t * 1.3 + phase) * sway
  out.y += Math.sin(t * 1.7 + phase * 2.1) * sway
  return out
}

/** out = blend of two poses for the same player. */
export function blendPoses(
  out: THREE.Vector3,
  base: THREE.Vector3,
  from: THREE.Vector3,
  to: THREE.Vector3,
  p: number,
  sign: 1 | -1,
  t: number,
  phase: number,
  sway = 0.02,
) {
  poseAt(_a, base, from, sign, t, phase, 0)
  poseAt(_b, base, to, sign, t, phase, 0)
  out.lerpVectors(_a, _b, p)
  out.x += Math.sin(t * 1.3 + phase) * sway
  out.y += Math.sin(t * 1.7 + phase * 2.1) * sway
  return out
}

/**
 * Quadratic bezier flight path: release → catch with a raised midpoint, so the
 * lob reads ballistic without simulating physics.
 */
export function flightAt(
  out: THREE.Vector3,
  from: THREE.Vector3,
  to: THREE.Vector3,
  arc: number,
  p: number,
) {
  const q = 1 - p
  const cx = (from.x + to.x) / 2
  const cy = (from.y + to.y) / 2 + arc
  const cz = (from.z + to.z) / 2
  out.set(
    q * q * from.x + 2 * q * p * cx + p * p * to.x,
    q * q * from.y + 2 * q * p * cy + p * p * to.y,
    q * q * from.z + 2 * q * p * cz + p * p * to.z,
  )
  return out
}
