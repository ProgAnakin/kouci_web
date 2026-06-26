import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../lib/theme'

interface ParticlesProps {
  count?: number
  reducedMotion?: boolean
}

// Shared scratch object to compose instance matrices without allocating.
const dummy = new THREE.Object3D()

interface Mote {
  x: number
  z: number
  y: number
  speed: number
  phase: number
  wob: number
  scale: number
}

const TOP = 3.4
const BOTTOM = -0.5

function spawn(): Mote {
  return {
    x: THREE.MathUtils.randFloatSpread(13),
    z: THREE.MathUtils.randFloat(-3, 4),
    y: THREE.MathUtils.randFloat(BOTTOM, TOP),
    speed: THREE.MathUtils.randFloat(0.12, 0.32),
    phase: Math.random() * Math.PI * 2,
    wob: THREE.MathUtils.randFloat(0.05, 0.16),
    scale: THREE.MathUtils.randFloat(0.014, 0.05),
  }
}

/**
 * Atmospheric spray drifting up over the water — a single instanced draw call.
 * Each mote rises, wobbles, fades (via scale) near the top and recycles to the
 * bottom. Frame-rate independent; frozen under reduced motion.
 */
export function Particles({ count = 30, reducedMotion = false }: ParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const motes = useMemo(() => Array.from({ length: count }, spawn), [count])

  // Initial placement (also the static layout under reduced motion).
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    motes.forEach((m, i) => {
      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(m.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [motes])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    if (!mesh || reducedMotion) return
    const t = state.clock.elapsedTime

    for (let i = 0; i < motes.length; i++) {
      const m = motes[i]
      m.y += m.speed * delta
      if (m.y > TOP) Object.assign(m, spawn(), { y: BOTTOM })

      // Fade out near the top by shrinking.
      const fade = THREE.MathUtils.smoothstep(m.y, TOP - 1.0, TOP)
      const s = Math.max(m.scale * (1 - fade), 0.0001)
      dummy.position.set(m.x + Math.sin(t * 0.8 + m.phase) * m.wob, m.y, m.z)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial
        color={palette.silver}
        transparent
        opacity={0.35}
        roughness={0.25}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
