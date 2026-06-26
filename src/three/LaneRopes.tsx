import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { surfaceY } from './wave'

// Lane ropes span the pool across X at these depths (Z), kept clear of the ball.
const ROPE_Z = [-2.6, -0.9, 2.7]
const X_MIN = -8
const X_MAX = 8
const SPACING = 0.42
// Classic lane-rope float pattern, kept within the brand palette.
const BEAD_COLORS = [palette.brandLight, palette.silver, palette.brand]

const dummy = new THREE.Object3D()

interface Bead {
  x: number
  z: number
}

/**
 * Floating lane ropes — the unmistakable "swimming pool" cue. A single
 * instanced draw call of float beads that ride the actual water swell (shared
 * wave fn), with the classic alternating-color rope pattern.
 */
export function LaneRopes({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const beads = useMemo<Bead[]>(() => {
    const out: Bead[] = []
    for (const z of ROPE_Z) {
      for (let x = X_MIN; x <= X_MAX; x += SPACING) out.push({ x, z })
    }
    return out
  }, [])

  // Per-bead color (set once) + initial placement.
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const color = new THREE.Color()
    beads.forEach((b, i) => {
      dummy.position.set(b.x, surfaceY(b.x, b.z, 0) + 0.03, b.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, color.set(BEAD_COLORS[i % BEAD_COLORS.length]))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [beads])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || reducedMotion) return
    // Match the water shader's time scale (uTime += delta * 0.6).
    const t = state.clock.elapsedTime * 0.6
    for (let i = 0; i < beads.length; i++) {
      const b = beads[i]
      dummy.position.set(b.x, surfaceY(b.x, b.z, t) + 0.03, b.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, beads.length]} frustumCulled={false}>
      <sphereGeometry args={[0.07, 10, 10]} />
      <meshStandardMaterial roughness={0.5} metalness={0.05} />
    </instancedMesh>
  )
}
