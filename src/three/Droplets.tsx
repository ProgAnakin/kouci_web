import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const dummy = new THREE.Object3D()
const GRAVITY = -2.4

interface Drop {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
  size: number
}

function dead(): Drop {
  return { x: 0, y: -20, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, size: 0.03 }
}

/**
 * Water droplets that shed off the ball while it's airborne — emitted at the
 * ball, pulled down by gravity, fading out. One instanced draw call.
 */
export function Droplets({
  source,
  count = 26,
  reducedMotion = false,
}: {
  source: MutableRefObject<THREE.Vector3>
  count?: number
  reducedMotion?: boolean
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const drops = useMemo<Drop[]>(() => Array.from({ length: count }, dead), [count])
  const timer = useRef(0)

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m || reducedMotion) return
    const dt = Math.min(delta, 0.05)

    // Emit only while the ball is up in the air (mid-pass).
    timer.current -= dt
    if (timer.current <= 0 && source.current.y > 0.25) {
      timer.current = 0.045
      for (let s = 0; s < 2; s++) {
        const d = drops.find((dr) => dr.life <= 0)
        if (!d) break
        d.x = source.current.x + (Math.random() - 0.5) * 0.22
        d.y = source.current.y - 0.12
        d.z = source.current.z + (Math.random() - 0.5) * 0.22
        d.vx = (Math.random() - 0.5) * 0.7
        d.vy = -0.2 - Math.random() * 0.4
        d.vz = (Math.random() - 0.5) * 0.7
        d.maxLife = 0.5 + Math.random() * 0.45
        d.life = d.maxLife
        d.size = 0.018 + Math.random() * 0.022
      }
    }

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i]
      if (d.life > 0) {
        d.life -= dt
        d.vy += GRAVITY * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.z += d.vz * dt
        const k = Math.max(d.life / d.maxLife, 0)
        dummy.position.set(d.x, d.y, d.z)
        dummy.scale.setScalar(d.size * (0.5 + 0.5 * k))
      } else {
        dummy.position.set(0, -20, 0)
        dummy.scale.setScalar(0.0001)
      }
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshPhysicalMaterial color="#dfeae3" roughness={0.1} metalness={0} clearcoat={1} transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  )
}
