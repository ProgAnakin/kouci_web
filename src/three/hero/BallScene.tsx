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

interface BallSceneProps {
  /** Where the ball floats (x, z on the water). */
  position: [number, number]
  reducedMotion?: boolean
}

/**
 * The hero centrepiece: a match ball riding the swell — bobbing, tilting and
 * lazily turning, ringed by ripples and the odd drip. Feeds its position to
 * heroState so the camera drifts with it.
 */
export function BallScene({ position, reducedMotion = false }: BallSceneProps) {
  const [x, z] = position
  const ball = useRef<THREE.Group>(null)
  const spray = useRef<SprayEmitter>({ pos: new THREE.Vector3(x, WATER_Y + RIDE, z), rate: 0 })
  const center = useMemo(() => new THREE.Vector3(x, WATER_Y, z), [x, z])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const bob = reducedMotion ? 0 : Math.sin(t * 0.85) * 0.045 + Math.sin(t * 1.7 + 1.3) * 0.015
    const y = WATER_Y + RIDE + bob

    const g = ball.current
    if (g) {
      g.position.set(x, y, z)
      if (!reducedMotion) {
        g.rotation.y += delta * 0.22
        g.rotation.z = Math.sin(t * 0.7) * 0.07
        g.rotation.x = Math.cos(t * 0.55) * 0.06
      }
    }
    heroState.ball.set(x, y, z)

    // The occasional drip as the swell laps at the ball.
    spray.current.pos.set(x, y - BALL_RADIUS * 0.4, z)
    spray.current.rate = reducedMotion ? 0 : 2.5
  })

  return (
    <group>
      <Ball ref={ball} radius={BALL_RADIUS} />
      <Ripples center={center} reducedMotion={reducedMotion} scale={0.75} />
      <Spray emitter={spray} reducedMotion={reducedMotion} />
    </group>
  )
}
