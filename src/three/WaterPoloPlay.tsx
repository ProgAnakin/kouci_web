import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { Swimmer } from './Swimmer'
import { PoloBall } from './PoloBall'
import { CausticGlow } from './CausticGlow'
import { WATER_Y } from './wave'

// Two players at the water line, set apart across the right of the frame.
const A = new THREE.Vector3(1.0, WATER_Y, 0.9)
const B = new THREE.Vector3(3.4, WATER_Y, 0.2)

// Hand height the ball is thrown from / caught at (world Y).
const HAND_Y = 0.05
const HAND_A = new THREE.Vector3(A.x + 0.25, HAND_Y, A.z)
const HAND_B = new THREE.Vector3(B.x - 0.25, HAND_Y, B.z)

const ARC_HEIGHT = 0.85
const SPEED = 0.42 // passes per second-ish (one leg per ~2.4s)

const smooth = (p: number) => p * p * (3 - 2 * p)

/**
 * The hero centrepiece: two water polo players passing the ball back and forth.
 * The ball arcs between their hands (with a spin), and both swimmers' arms track
 * it every frame via a shared aim vector. Under reduced motion the ball simply
 * rests in one player's hands.
 */
export function WaterPoloPlay({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ball = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Group>(null)
  const aim = useRef(new THREE.Vector3().copy(HAND_A))

  // Avoid per-frame allocation.
  const from = useMemo(() => new THREE.Vector3(), [])
  const to = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    let p = 0
    if (reducedMotion) {
      from.copy(HAND_A)
      to.copy(HAND_A)
    } else {
      const phase = (t * SPEED) % 2
      if (phase < 1) {
        from.copy(HAND_A)
        to.copy(HAND_B)
        p = phase
      } else {
        from.copy(HAND_B)
        to.copy(HAND_A)
        p = phase - 1
      }
    }

    const e = smooth(p)
    const x = THREE.MathUtils.lerp(from.x, to.x, e)
    const z = THREE.MathUtils.lerp(from.z, to.z, e)
    const y = THREE.MathUtils.lerp(from.y, to.y, e) + Math.sin(Math.PI * p) * ARC_HEIGHT

    aim.current.set(x, y, z)

    if (ball.current) {
      ball.current.position.set(x, y, z)
      if (!reducedMotion) {
        ball.current.rotation.x += delta * 4.5
        ball.current.rotation.z += delta * 2.5
      }
    }
    if (glow.current) glow.current.position.set(x, WATER_Y + 0.02, z)
  })

  return (
    <group>
      <Swimmer position={A.toArray()} capColor={palette.silver} number={4} aim={aim} reducedMotion={reducedMotion} phase={0} />
      <Swimmer position={B.toArray()} capColor={palette.brand} number={7} aim={aim} reducedMotion={reducedMotion} phase={1.4} />

      <PoloBall ref={ball} radius={0.3} />

      {/* Light pool that follows the ball across the surface. */}
      <group ref={glow}>
        <CausticGlow position={[0, 0, 0]} reducedMotion={reducedMotion} />
      </group>
    </group>
  )
}
