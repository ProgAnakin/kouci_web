import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PoloBall } from './PoloBall'
import { CausticGlow } from './CausticGlow'
import { WATER_Y } from './wave'
import { heroState } from './heroState'

interface FloatingBallProps {
  /** Where the ball floats (x, z at the water line; y is derived). */
  position: [number, number, number]
  radius?: number
  reducedMotion?: boolean
}

// How high the ball's centre rides above the water line — a real water polo
// ball floats with roughly a third of it submerged.
const RIDE = 0.17
const RING_COUNT = 3
const RING_PERIOD = 3.4 // seconds for a ripple to travel out and fade

/**
 * A single water polo ball bobbing on the swell: it rides the water with a soft
 * vertical bob, a lazy spin, and a gentle tilt, shedding expanding ripples on
 * the surface. Replaces the old two-player pass — simpler, and clean to render.
 */
export function FloatingBall({ position, radius = 0.4, reducedMotion = false }: FloatingBallProps) {
  const ball = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Mesh[]>([])
  const [x, , z] = position

  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#9FAC82',
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const bob = reducedMotion ? 0 : Math.sin(t * 0.9) * 0.05
    const y = WATER_Y + RIDE + bob

    if (ball.current) {
      ball.current.position.set(x, y, z)
      if (!reducedMotion) {
        ball.current.rotation.y += delta * 0.25
        ball.current.rotation.z = Math.sin(t * 0.7) * 0.06
        ball.current.rotation.x = Math.cos(t * 0.55) * 0.05
      }
    }
    // Share the ball position so the camera rig can gently follow it.
    heroState.ball.set(x, y, z)

    if (!reducedMotion) {
      rings.current.forEach((ring, i) => {
        if (!ring) return
        const phase = ((t / RING_PERIOD + i / RING_COUNT) % 1 + 1) % 1
        const s = 0.5 + phase * 2.4
        ring.scale.set(s, s, s)
        ;(ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.3
      })
    }
  })

  return (
    <group>
      <group ref={ball}>
        <PoloBall radius={radius} />
      </group>

      {/* Light pooling + expanding ripples on the surface under the ball. */}
      <group position={[x, WATER_Y + 0.02, z]}>
        <CausticGlow position={[0, 0, 0]} reducedMotion={reducedMotion} />
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) rings.current[i] = m
            }}
            rotation-x={-Math.PI / 2}
            material={ringMat}
          >
            <ringGeometry args={[0.32, 0.4, 48]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
