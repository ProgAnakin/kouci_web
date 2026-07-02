import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WATER_Y, HERO_COLORS } from './constants'

/* ------------------------------------------------------------------ */
/* Ripples — looping concentric rings around a treading player.        */
/* ------------------------------------------------------------------ */

const RING_COUNT = 3
const RING_PERIOD = 2.6

export function Ripples({
  center,
  reducedMotion = false,
  phase = 0,
  scale = 1,
}: {
  center: THREE.Vector3
  reducedMotion?: boolean
  phase?: number
  /** Overall size multiplier (rings are sized for a player by default). */
  scale?: number
}) {
  const rings = useRef<THREE.Mesh[]>([])
  const mats = useMemo(
    () =>
      Array.from(
        { length: RING_COUNT },
        () =>
          new THREE.MeshBasicMaterial({
            color: HERO_COLORS.foam,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
      ),
    [],
  )
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])

  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime + phase
    rings.current.forEach((ring, i) => {
      if (!ring) return
      const p = (((t / RING_PERIOD + i / RING_COUNT) % 1) + 1) % 1
      const s = 0.7 + p * 1.5
      ring.scale.set(s, s, 1)
      mats[i].opacity = (1 - p) * 0.16
    })
  })

  return (
    <group position={[center.x, WATER_Y + 0.025, center.z]} scale={[scale, 1, scale]}>
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m
          }}
          rotation-x={-Math.PI / 2}
          material={mats[i]}
        >
          <ringGeometry args={[0.56, 0.6, 48]} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Spray — droplets emitted around a moving source (throws, catches).  */
/* ------------------------------------------------------------------ */

const DROP_COUNT = 80

export interface SprayEmitter {
  /** World position droplets spawn from. */
  pos: THREE.Vector3
  /** Particles per second (0 = off). */
  rate: number
}

function makeDropTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(32, 30, 2, 32, 32, 30)
  g.addColorStop(0, 'rgba(225, 232, 214, 0.95)')
  g.addColorStop(0.5, 'rgba(190, 200, 175, 0.45)')
  g.addColorStop(1, 'rgba(190, 200, 175, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export function Spray({
  emitter,
  reducedMotion = false,
}: {
  emitter: MutableRefObject<SprayEmitter>
  reducedMotion?: boolean
}) {
  const points = useRef<THREE.Points>(null)
  const tex = useMemo(makeDropTexture, [])
  const data = useMemo(() => {
    const positions = new Float32Array(DROP_COUNT * 3)
    positions.fill(9999) // park unused drops far away
    return {
      positions,
      vel: new Float32Array(DROP_COUNT * 3),
      life: new Float32Array(DROP_COUNT),
      maxLife: new Float32Array(DROP_COUNT),
      cursor: 0,
      pending: 0,
    }
  }, [])

  useEffect(() => () => tex.dispose(), [tex])

  useFrame((_, delta) => {
    if (reducedMotion || !points.current) return
    const dt = Math.min(delta, 0.05)
    const { positions, vel, life, maxLife } = data
    const e = emitter.current

    // Spawn according to the emitter rate.
    data.pending += e.rate * dt
    while (data.pending >= 1) {
      data.pending -= 1
      const i = data.cursor
      data.cursor = (data.cursor + 1) % DROP_COUNT
      positions[i * 3] = e.pos.x + (Math.random() - 0.5) * 0.22
      positions[i * 3 + 1] = e.pos.y + (Math.random() - 0.5) * 0.1
      positions[i * 3 + 2] = e.pos.z + (Math.random() - 0.5) * 0.22
      vel[i * 3] = (Math.random() - 0.5) * 1.1
      vel[i * 3 + 1] = 0.6 + Math.random() * 1.2
      vel[i * 3 + 2] = (Math.random() - 0.5) * 1.1
      maxLife[i] = 0.45 + Math.random() * 0.4
      life[i] = maxLife[i]
    }

    // Integrate.
    for (let i = 0; i < DROP_COUNT; i++) {
      if (life[i] <= 0) continue
      life[i] -= dt
      if (life[i] <= 0 || positions[i * 3 + 1] < WATER_Y + 0.01) {
        positions[i * 3] = 9999
        life[i] = 0
        continue
      }
      vel[i * 3 + 1] -= 3.4 * dt
      positions[i * 3] += vel[i * 3] * dt
      positions[i * 3 + 1] += vel[i * 3 + 1] * dt
      positions[i * 3 + 2] += vel[i * 3 + 2] * dt
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.05}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.85}
      />
    </points>
  )
}
