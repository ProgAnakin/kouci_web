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
  /** Add the floating pontoon base (as on a real water polo goal). */
  floats?: boolean
  emissiveIntensity?: number
}

/**
 * A floating water polo goal: two posts, a crossbar, a net, and the floating
 * pontoon base the frame sits on. Parameterized so it also serves the penalty
 * showcase. The frame is a bright semi-gloss white; the pontoons carry the
 * classic dark banding.
 */
export function WaterPoloGoal({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 3,
  height = 0.9,
  color = '#EEF0EA',
  net = true,
  floats = true,
  emissiveIntensity = 0,
}: WaterPoloGoalProps) {
  const tex = useMemo(
    () =>
      net ? makeNetTexture(Math.max(3, Math.round(width * 2)), Math.max(2, Math.round(height * 3))) : null,
    [net, width, height],
  )
  useEffect(() => () => tex?.dispose(), [tex])

  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.12,
        emissive: new THREE.Color(color),
        emissiveIntensity,
      }),
    [color, emissiveIntensity],
  )
  const floatMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#F4F5F0', roughness: 0.55, metalness: 0.05 }),
    [],
  )
  const bandMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette.brand, roughness: 0.5, metalness: 0.05 }),
    [],
  )

  const r = Math.min(0.05, height * 0.06)
  const half = width / 2
  const floatR = r * 1.8
  const depth = 0.7 // how far the pontoons/net reach back

  return (
    <group position={position} rotation={rotation}>
      {/* Posts */}
      {[-half, half].map((x) => (
        <mesh key={x} position={[x, height / 2, 0]} material={frameMat} castShadow>
          <cylinderGeometry args={[r, r, height, 16]} />
        </mesh>
      ))}

      {/* Crossbar */}
      <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]} material={frameMat} castShadow>
        <cylinderGeometry args={[r, r, width + r * 2, 16]} />
      </mesh>

      {/* Net: back panel + sloped roof, so the goal reads as 3D. */}
      {net && tex && (
        <>
          <mesh position={[0, height / 2, -depth]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial
              map={tex}
              color={color}
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              depthWrite={false}
              roughness={1}
            />
          </mesh>
          <mesh position={[0, height - 0.02, -depth / 2]} rotation={[Math.PI / 2.6, 0, 0]}>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial
              map={tex}
              color={color}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
              roughness={1}
            />
          </mesh>
        </>
      )}

      {/* Floating pontoon base: a front tube across the mouth, two side tubes
          reaching back, and dark bands near the posts. */}
      {floats && (
        <group position={[0, 0.02, 0]}>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={floatMat}>
            <cylinderGeometry args={[floatR, floatR, width + floatR * 2, 16]} />
          </mesh>
          {[-half, half].map((x) => (
            <mesh key={x} position={[x, 0, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} material={floatMat}>
              <cylinderGeometry args={[floatR, floatR, depth, 16]} />
            </mesh>
          ))}
          {[-half, half].map((x) => (
            <mesh key={`b${x}`} position={[x * 0.72, 0.001, 0]} rotation={[0, 0, Math.PI / 2]} material={bandMat}>
              <cylinderGeometry args={[floatR * 1.04, floatR * 1.04, width * 0.12, 16]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
