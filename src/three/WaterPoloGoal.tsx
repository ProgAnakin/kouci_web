import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { makeNetTexture } from './netTexture'

interface WaterPoloGoalProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  color?: string
  net?: boolean
  emissiveIntensity?: number
}

/**
 * A floating water polo goal (two posts + crossbar + optional net). Used at the
 * far end of the hero pool for context; parameterized so it can be reused.
 */
export function WaterPoloGoal({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 3,
  height = 0.9,
  color = palette.silver,
  net = true,
  emissiveIntensity = 0,
}: WaterPoloGoalProps) {
  const tex = useMemo(
    () => (net ? makeNetTexture(Math.max(3, Math.round(width * 2)), Math.max(2, Math.round(height * 3))) : null),
    [net, width, height],
  )
  useEffect(() => () => tex?.dispose(), [tex])

  const r = Math.min(0.05, height * 0.06)
  const half = width / 2

  return (
    <group position={position} rotation={rotation}>
      {[-half, half].map((x) => (
        <mesh key={x} position={[x, height / 2, 0]}>
          <cylinderGeometry args={[r, r, height, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} emissive={color} emissiveIntensity={emissiveIntensity} />
        </mesh>
      ))}
      <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r, r, width + r * 2, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {net && tex && (
        <mesh position={[0, height / 2, -0.18]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={tex}
            color={color}
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}
    </group>
  )
}
