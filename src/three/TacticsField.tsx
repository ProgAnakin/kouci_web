import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { palette, pinColors } from '../lib/theme'
import { Arrow } from './Arrow'
import { Hotspot } from './Hotspot'

const FIELD_W = 6
const FIELD_D = 4

// Player markers (x, z) on the board, each tagged with a palette color.
const PINS: { x: number; z: number; color: string }[] = [
  { x: -1.5, z: -1.2, color: pinColors[0] },
  { x: 0, z: -1.5, color: pinColors[0] },
  { x: 1.5, z: -1.2, color: pinColors[0] },
  { x: -0.8, z: 0.5, color: pinColors[2] },
  { x: 0.9, z: 0.6, color: pinColors[2] },
  { x: 0, z: 1.4, color: pinColors[1] },
]

// Movement arrows linking pins into a simple set play.
const ARROWS: { from: [number, number, number]; to: [number, number, number]; color: string }[] = [
  { from: [-1.5, 0.16, -1.2], to: [-0.8, 0.16, 0.5], color: pinColors[0] },
  { from: [0, 0.16, -1.5], to: [0, 0.16, 1.4], color: pinColors[1] },
  { from: [1.5, 0.16, -1.2], to: [0.9, 0.16, 0.6], color: pinColors[2] },
]

/** Thin box used for field markings. */
function Line({
  size,
  position,
  color = palette.silver,
  opacity = 0.5,
}: {
  size: [number, number, number]
  position: [number, number, number]
  color?: string
  opacity?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.8} />
    </mesh>
  )
}

/** A simple goal frame: two posts + a crossbar. */
function Goal({ x, dir }: { x: number; dir: 1 | -1 }) {
  void dir
  return (
    <group position={[x, 0, 0]}>
      {[-0.9, 0.9].map((z) => (
        <mesh key={z} position={[0, 0.22, z]}>
          <boxGeometry args={[0.05, 0.45, 0.05]} />
          <meshStandardMaterial color={palette.silver} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.05, 0.05, 1.85]} />
        <meshStandardMaterial color={palette.silver} roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  )
}

export function TacticsField({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return
    group.current.rotation.y += delta * 0.08
  })

  return (
    <group ref={group}>
      {/* Board */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[FIELD_W + 0.4, 0.1, FIELD_D + 0.4]} />
        <meshStandardMaterial color={palette.surface} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Field markings */}
      <Line size={[FIELD_W, 0.012, 0.05]} position={[0, 0.011, -FIELD_D / 2]} color={palette.silver} />
      <Line size={[FIELD_W, 0.012, 0.05]} position={[0, 0.011, FIELD_D / 2]} color={palette.silver} />
      <Line size={[0.05, 0.012, FIELD_D]} position={[-FIELD_W / 2, 0.011, 0]} color={palette.silver} />
      <Line size={[0.05, 0.012, FIELD_D]} position={[FIELD_W / 2, 0.011, 0]} color={palette.silver} />
      <Line size={[0.05, 0.012, FIELD_D]} position={[0, 0.011, 0]} color={palette.brandLight} opacity={0.7} />
      <Line size={[0.04, 0.012, FIELD_D]} position={[-1.8, 0.011, 0]} color={palette.brand} opacity={0.35} />
      <Line size={[0.04, 0.012, FIELD_D]} position={[1.8, 0.011, 0]} color={palette.brand} opacity={0.35} />

      <Goal x={-FIELD_W / 2} dir={1} />
      <Goal x={FIELD_W / 2} dir={-1} />

      {/* Pins — one draw call via instancing, per-instance color. */}
      <Instances limit={PINS.length} range={PINS.length} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.12, 24]} />
        <meshStandardMaterial roughness={0.4} metalness={0.1} />
        {PINS.map((p, i) => (
          <Instance key={i} position={[p.x, 0.06, p.z]} color={p.color} />
        ))}
      </Instances>

      {/* Animated 3D arrows */}
      {ARROWS.map((a, i) => (
        <Arrow
          key={i}
          from={a.from}
          to={a.to}
          color={a.color}
          reducedMotion={reducedMotion}
          delay={i * 0.22}
        />
      ))}

      <Hotspot
        position={[0, 0.5, 1.4]}
        label="Animated 3D arrows"
        detail="Draw the play, animate it, export to MP4 or GIF for your players."
      />
    </group>
  )
}
