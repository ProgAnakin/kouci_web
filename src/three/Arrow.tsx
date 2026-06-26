import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ArrowProps {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  reducedMotion?: boolean
  /** Phase offset (0–1) so multiple arrows don't draw in lockstep. */
  delay?: number
  thickness?: number
}

const HEAD_LEN = 0.34
const UP = new THREE.Vector3(0, 1, 0)

/**
 * A 3D tactics arrow that "draws itself" on a loop: the shaft grows from the
 * origin point and the cone head rides the tip. Built from a cylinder + cone
 * (no CapsuleGeometry, per the brief). Reduced motion → drawn fully, static.
 */
export function Arrow({
  from,
  to,
  color,
  reducedMotion = false,
  delay = 0,
  thickness = 0.045,
}: ArrowProps) {
  const shaft = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Mesh>(null)

  const { quaternion, position, shaftMax } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = new THREE.Vector3().subVectors(b, a)
    const length = dir.length()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize())
    return { quaternion, position: a, shaftMax: Math.max(0.0001, length - HEAD_LEN) }
  }, [from, to])

  useFrame((state) => {
    let p = 1
    if (!reducedMotion) {
      // Sawtooth: draw across 80% of the cycle, hold, then reset.
      const cycle = (state.clock.elapsedTime * 0.32 + delay) % 1
      const raw = Math.min(cycle / 0.8, 1)
      p = 1 - Math.pow(1 - raw, 3) // easeOutCubic
    }

    const shaftLen = Math.max(0.0001, p * shaftMax)
    if (shaft.current) {
      shaft.current.scale.y = shaftLen
      shaft.current.position.y = shaftLen / 2
    }
    if (head.current) {
      head.current.position.y = shaftLen + HEAD_LEN / 2
      head.current.visible = p > 0.02
    }
  })

  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={shaft}>
        {/* Unit-height cylinder; scaled along Y each frame. */}
        <cylinderGeometry args={[thickness, thickness, 1, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh ref={head}>
        <coneGeometry args={[thickness * 2.4, HEAD_LEN, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.45} metalness={0.1} />
      </mesh>
    </group>
  )
}
