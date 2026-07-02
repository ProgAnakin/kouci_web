import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeNumberTexture } from './numberTexture'

interface CapProps {
  position: [number, number, number]
  color: string
  number: number
  /** Pop-in delay (s). */
  delay?: number
  reducedMotion?: boolean
}

const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/**
 * A water polo cap as a tactics marker: a flattened glossy dome with ear
 * protectors and the player's cap number on top. Ties the board directly to
 * the app's "name + cap number" roster. Pops in, then floats gently.
 */
export function Cap({ position, color, number, delay = 0, reducedMotion = false }: CapProps) {
  const group = useRef<THREE.Group>(null)
  const start = useRef<number | null>(null)
  const numberTex = useMemo(() => makeNumberTexture(number), [number])

  useEffect(() => () => numberTex.dispose(), [numberTex])

  useFrame((state) => {
    const g = group.current
    if (!g) return
    if (reducedMotion) {
      g.scale.setScalar(1)
      return
    }
    const t = state.clock.elapsedTime
    if (start.current === null) start.current = t
    const prog = THREE.MathUtils.clamp((t - start.current - delay) / 0.55, 0, 1)
    g.scale.setScalar(easeOutBack(prog))
    g.position.y = position[1] + (prog >= 1 ? Math.sin(t * 1.3 + number) * 0.012 : 0)
  })

  return (
    <group ref={group} position={position} scale={reducedMotion ? 1 : 0.0001}>
      {/* Cap dome */}
      <mesh castShadow scale={[1, 0.62, 1]}>
        <sphereGeometry args={[0.2, 28, 22]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.3}
        />
      </mesh>
      {/* Ear protectors */}
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} position={[x, -0.01, 0]} scale={[0.5, 0.7, 0.9]}>
          <sphereGeometry args={[0.08, 14, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {/* Cap number on top */}
      <mesh position={[0, 0.128, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.24, 0.24]} />
        <meshBasicMaterial map={numberTex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}
