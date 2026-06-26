import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../lib/theme'

// Three thin seam rings suggest a water polo ball without needing a texture
// or model. TODO: swap this group for a real GLB ball (Draco-compressed) —
// see public/assets/README.md and README.md.
const SEAM_ROTATIONS: [number, number, number][] = [
  [0, 0, 0],
  [Math.PI / 2, 0, 0],
  [0, 0, Math.PI / 2],
]

export function WaterPoloBall({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    if (reducedMotion) {
      g.position.y = 0.25
      return
    }
    const t = state.clock.elapsedTime
    g.position.y = 0.25 + Math.sin(t * 0.9) * 0.12
    g.rotation.y = t * 0.25
    g.rotation.x = Math.sin(t * 0.3) * 0.08
  })

  return (
    <group ref={group} position={[2.6, 0.25, 0.4]}>
      <mesh castShadow>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial color={palette.brandLight} roughness={0.45} metalness={0.05} />
      </mesh>
      {SEAM_ROTATIONS.map((rotation, i) => (
        <mesh key={i} rotation={rotation}>
          <torusGeometry args={[0.7, 0.012, 8, 64]} />
          <meshStandardMaterial color={palette.bg} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
