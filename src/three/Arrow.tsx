import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ArrowProps {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  reducedMotion?: boolean
  /** Phase offset (0–1) so multiple arrows don't draw in lockstep. */
  delay?: number
  /** Line width of the stroke. */
  width?: number
  /** Externally-driven draw progress (0–1). When provided, the arrow follows it
   *  each frame (e.g. synced to a swimming cap) instead of its own loop. */
  progressRef?: MutableRefObject<number>
}

const HEAD_LEN = 0.24
const HEAD_SWEEP = 2.62 // rad from the shaft direction — an open, classic chevron

/**
 * A classic tactics-board arrow: a thin stroke lying flat on the water that
 * draws itself from the origin, finished with an open chevron head — the way a
 * coach draws it on a whiteboard, not a solid 3D dart. Horizontal only (the
 * group is yawed from the from→to direction); reduced motion renders it fully.
 */
export function Arrow({
  from,
  to,
  color,
  reducedMotion = false,
  delay = 0,
  width = 0.034,
  progressRef,
}: ArrowProps) {
  const shaft = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Group>(null)

  const { yaw, length } = useMemo(() => {
    const dx = to[0] - from[0]
    const dz = to[2] - from[2]
    return { yaw: Math.atan2(dx, dz), length: Math.max(0.0001, Math.hypot(dx, dz)) }
  }, [from, to])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.6,
        transparent: true,
        opacity: 0.95,
      }),
    [color],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame((state) => {
    let p = 1
    if (!reducedMotion) {
      if (progressRef) {
        p = THREE.MathUtils.clamp(progressRef.current, 0, 1)
      } else {
        // Sawtooth: draw across 80% of the cycle, hold, then reset.
        const cycle = (state.clock.elapsedTime * 0.32 + delay) % 1
        const raw = Math.min(cycle / 0.8, 1)
        p = 1 - Math.pow(1 - raw, 3) // easeOutCubic
      }
    }

    const len = Math.max(0.0001, p * length)
    if (shaft.current) {
      shaft.current.scale.z = len
      shaft.current.position.z = len / 2
    }
    if (head.current) {
      head.current.position.z = len
      head.current.visible = p > 0.04
    }
  })

  return (
    <group position={from} rotation-y={yaw}>
      {/* Stroke — unit-depth flat box, scaled along Z each frame. */}
      <mesh ref={shaft} material={material}>
        <boxGeometry args={[width, 0.055, 1]} />
      </mesh>
      {/* Open chevron head: two blades sweeping back from the tip. */}
      <group ref={head}>
        {[HEAD_SWEEP, -HEAD_SWEEP].map((angle) => (
          <group key={angle} rotation-y={angle}>
            <mesh position={[0, 0, HEAD_LEN / 2]} material={material}>
              <boxGeometry args={[width, 0.055, HEAD_LEN]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
