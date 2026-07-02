import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Ball } from './Ball'
import { Ripples, Spray, type SprayEmitter } from './effects'
import { WATER_Y } from './constants'
import { heroState } from '../heroState'

/** Match-ball radius in scene units. The goal is sized off this (see BALL_SPEC). */
export const BALL_RADIUS = 0.27

/**
 * Real-world proportions (FINA): ball Ø ≈ 0.22 m, goal mouth 3.0 m wide and
 * 0.9 m above the waterline. Everything in the scene keeps that ratio.
 */
export const BALL_SPEC = {
  realDiameter: 0.22,
  goalWidth: 3.0,
  goalHeight: 0.9,
}
const SCALE = (BALL_RADIUS * 2) / BALL_SPEC.realDiameter
export const GOAL_WIDTH = BALL_SPEC.goalWidth * SCALE
export const GOAL_HEIGHT = BALL_SPEC.goalHeight * SCALE

// A ball floats about a third submerged.
const RIDE = BALL_RADIUS * 0.62

// Pass timing: one leg every ~2.4s, with a soft arc between the hands.
const PASS_SPEED = 0.42
const ARC_HEIGHT = 0.5

const smooth = (p: number) => p * p * (3 - 2 * p)

interface BallSceneProps {
  /** Where the ball floats (x, z on the water) when there is no pass. */
  position: [number, number]
  /** Two hand points (world space); when set, the ball arcs between them. */
  pass?: { a: [number, number, number]; b: [number, number, number] }
  reducedMotion?: boolean
}

/**
 * The hero centrepiece. With `pass` set, the match ball arcs between the two
 * players' hands — tumbling in flight, shedding spray on each catch. Without
 * it (or under reduced motion) it rides the swell where it floats: bobbing,
 * tilting, ringed by ripples. Feeds its position to heroState so the camera
 * (and the players' gaze) drift with it.
 */
export function BallScene({ position, pass, reducedMotion = false }: BallSceneProps) {
  const [x, z] = position
  const ball = useRef<THREE.Group>(null)
  const spray = useRef<SprayEmitter>({ pos: new THREE.Vector3(x, WATER_Y + RIDE, z), rate: 0 })
  const center = useMemo(() => new THREE.Vector3(x, WATER_Y, z), [x, z])
  const floating = !pass || reducedMotion

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const g = ball.current
    let bx = x
    let by = WATER_Y + RIDE
    let bz = z

    if (pass && !reducedMotion) {
      // Ball arcs hand-to-hand, forever.
      const cycle = (t * PASS_SPEED) % 2
      const leg = cycle < 1 ? 0 : 1
      const p = cycle - leg
      const e = smooth(p)
      const from = leg === 0 ? pass.a : pass.b
      const to = leg === 0 ? pass.b : pass.a
      bx = THREE.MathUtils.lerp(from[0], to[0], e)
      by = THREE.MathUtils.lerp(from[1], to[1], e) + Math.sin(Math.PI * p) * ARC_HEIGHT
      bz = THREE.MathUtils.lerp(from[2], to[2], e)

      if (g) {
        g.position.set(bx, by, bz)
        // Backspin around the flight's cross axis (like a real pass), so the
        // camera keeps seeing the panel seams, not the poles.
        const air = Math.sin(Math.PI * p)
        g.rotation.z -= delta * (0.6 + air * 4.2) * (leg === 0 ? 1 : -1)
        g.rotation.y += delta * 0.3
        g.rotation.x = air * 0.1
      }
      // Spray bursts at the catch/release, a drizzle in flight.
      const atHands = p < 0.07 || p > 0.93
      spray.current.pos.set(bx, by - BALL_RADIUS * 0.45, bz)
      spray.current.rate = atHands ? 26 : 3
    } else {
      if (pass && reducedMotion) {
        // Static pose: the ball rests in player A's hands.
        bx = pass.a[0]
        by = pass.a[1]
        bz = pass.a[2]
      } else {
        const bob = reducedMotion ? 0 : Math.sin(t * 0.85) * 0.045 + Math.sin(t * 1.7 + 1.3) * 0.015
        by = WATER_Y + RIDE + bob
      }
      if (g) {
        g.position.set(bx, by, bz)
        if (!reducedMotion) {
          g.rotation.y += delta * 0.22
          g.rotation.z = Math.sin(t * 0.7) * 0.07
          g.rotation.x = Math.cos(t * 0.55) * 0.06
        }
      }
      // The occasional drip as the swell laps at the ball.
      spray.current.pos.set(bx, by - BALL_RADIUS * 0.4, bz)
      spray.current.rate = reducedMotion ? 0 : 2.5
    }

    heroState.ball.set(bx, by, bz)
  })

  return (
    <group>
      <Ball ref={ball} radius={BALL_RADIUS} />
      {floating && <Ripples center={center} reducedMotion={reducedMotion} scale={0.75} />}
      <Spray emitter={spray} reducedMotion={reducedMotion} />
    </group>
  )
}
