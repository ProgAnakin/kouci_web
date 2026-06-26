import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { Hotspot } from './Hotspot'

// Penalty shots plotted on the goal mouth. Goals land at the corners; misses
// cluster centrally (keeper) or outside the frame.
const GOALS: [number, number][] = [
  [-1.45, 0.36],
  [1.5, 0.4],
  [-1.6, -0.36],
  [1.55, -0.4],
  [-0.25, 0.46],
  [0.3, -0.46],
  [1.2, 0.06],
  [-1.05, 0.0],
]

const MISSES: [number, number][] = [
  [0.0, 0.02],
  [0.12, 0.56],
  [-2.05, 0.2],
  [0.5, 0.28],
  [-0.4, -0.12],
]

const GOAL_W = 4
const GOAL_H = 1.2

const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

function makeNetTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(197, 201, 192, 0.55)'
  ctx.lineWidth = 2
  const step = size / 8
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(size, i)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(8, 3)
  return tex
}

function Bar({ size, position }: { size: [number, number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial color={palette.silver} roughness={0.3} metalness={0.3} clearcoat={0.8} clearcoatRoughness={0.3} />
    </mesh>
  )
}

export function PenaltyMap({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const netTexture = useMemo(makeNetTexture, [])
  const goalMat = useRef<THREE.MeshStandardMaterial>(null)
  const goalRefs = useRef<(THREE.Object3D | null)[]>([])
  const missRefs = useRef<(THREE.Object3D | null)[]>([])
  const startRef = useRef<number | null>(null)

  // Dispose the generated texture when the scene unmounts.
  useEffect(() => () => netTexture.dispose(), [netTexture])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle "heat" pulse on the scored shots.
    if (goalMat.current && !reducedMotion) {
      goalMat.current.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.25
    }

    if (reducedMotion) return
    if (startRef.current === null) startRef.current = t
    const e = t - startRef.current

    // Shots land one by one: goals first, then misses.
    for (let i = 0; i < GOALS.length; i++) {
      const g = goalRefs.current[i]
      if (g) g.scale.setScalar(easeOutBack(THREE.MathUtils.clamp((e - i * 0.08) / 0.5, 0, 1)))
    }
    for (let i = 0; i < MISSES.length; i++) {
      const m = missRefs.current[i]
      if (m) m.scale.setScalar(easeOutBack(THREE.MathUtils.clamp((e - 0.7 - i * 0.1) / 0.5, 0, 1)))
    }
  })

  return (
    <group>
      {/* Net */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[GOAL_W, GOAL_H]} />
        <meshStandardMaterial
          map={netTexture}
          color={palette.silver}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
          roughness={1}
        />
      </mesh>

      {/* Goal frame */}
      <Bar size={[0.07, GOAL_H + 0.12, 0.07]} position={[-GOAL_W / 2, 0, 0]} />
      <Bar size={[0.07, GOAL_H + 0.12, 0.07]} position={[GOAL_W / 2, 0, 0]} />
      <Bar size={[GOAL_W + 0.12, 0.07, 0.07]} position={[0, GOAL_H / 2, 0]} />
      <Bar size={[GOAL_W + 0.12, 0.07, 0.07]} position={[0, -GOAL_H / 2, 0]} />

      {/* Scored shots — emissive, pulsing, pop in one by one */}
      <Instances limit={GOALS.length} range={GOALS.length}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshStandardMaterial
          ref={goalMat}
          color={palette.brandLight}
          emissive={palette.brand}
          emissiveIntensity={0.5}
          roughness={0.35}
        />
        {GOALS.map(([x, y], i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (goalRefs.current[i] = el)}
            position={[x, y, 0.06]}
            scale={reducedMotion ? 1 : 0.0001}
          />
        ))}
      </Instances>

      {/* Missed shots — muted silver, smaller */}
      <Instances limit={MISSES.length} range={MISSES.length}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={palette.silver} roughness={0.6} transparent opacity={0.7} />
        {MISSES.map(([x, y], i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (missRefs.current[i] = el)}
            position={[x, y, 0.06]}
            scale={reducedMotion ? 1 : 0.0001}
          />
        ))}
      </Instances>

      <Hotspot
        position={[1.5, 0.4, 0.1]}
        label="Shot placement"
        detail="Every penalty mapped: goal or miss, first attempt or repeat, bounce or not."
      />
    </group>
  )
}
