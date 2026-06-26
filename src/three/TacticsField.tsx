import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances, Sparkles } from '@react-three/drei'
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

const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

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
function Goal({ x }: { x: number }) {
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
  const pinRefs = useRef<(THREE.Object3D | null)[]>([])
  const haloRefs = useRef<(THREE.Object3D | null)[]>([])
  const startRef = useRef<number | null>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Organic presentation sway of the whole board (no full spin).
    if (group.current && !reducedMotion) {
      group.current.rotation.y = Math.sin(t * 0.22) * 0.42
      group.current.rotation.x = Math.sin(t * 0.35) * 0.04
    }

    if (reducedMotion) return
    if (startRef.current === null) startRef.current = t
    const elapsed = t - startRef.current

    // Staggered pop-in + gentle idle float for the pins, and a pulsing halo.
    for (let i = 0; i < PINS.length; i++) {
      const prog = THREE.MathUtils.clamp((elapsed - i * 0.09) / 0.55, 0, 1)

      const pin = pinRefs.current[i]
      if (pin) {
        pin.scale.setScalar(easeOutBack(prog))
        pin.position.y = 0.07 + (prog >= 1 ? Math.sin(t * 1.3 + i) * 0.015 : 0)
      }

      const halo = haloRefs.current[i]
      if (halo) {
        const pulse = 1 + Math.sin(t * 1.6 + i) * 0.12
        halo.scale.setScalar(prog * pulse)
      }
    }
  })

  return (
    <group ref={group}>
      {/* Board */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[FIELD_W + 0.4, 0.1, FIELD_D + 0.4]} />
        <meshPhysicalMaterial color={palette.surface} roughness={0.65} metalness={0.05} clearcoat={0.4} clearcoatRoughness={0.6} />
      </mesh>

      {/* Field markings */}
      <Line size={[FIELD_W, 0.012, 0.05]} position={[0, 0.011, -FIELD_D / 2]} color={palette.silver} />
      <Line size={[FIELD_W, 0.012, 0.05]} position={[0, 0.011, FIELD_D / 2]} color={palette.silver} />
      <Line size={[0.05, 0.012, FIELD_D]} position={[-FIELD_W / 2, 0.011, 0]} color={palette.silver} />
      <Line size={[0.05, 0.012, FIELD_D]} position={[FIELD_W / 2, 0.011, 0]} color={palette.silver} />
      <Line size={[0.05, 0.012, FIELD_D]} position={[0, 0.011, 0]} color={palette.brandLight} opacity={0.7} />
      <Line size={[0.04, 0.012, FIELD_D]} position={[-1.8, 0.011, 0]} color={palette.brand} opacity={0.35} />
      <Line size={[0.04, 0.012, FIELD_D]} position={[1.8, 0.011, 0]} color={palette.brand} opacity={0.35} />

      <Goal x={-FIELD_W / 2} />
      <Goal x={FIELD_W / 2} />

      {/* Colored halos under the pins — one instanced draw call, additive. */}
      <Instances limit={PINS.length} range={PINS.length}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        {PINS.map((p, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (haloRefs.current[i] = el)}
            position={[p.x, 0.014, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={reducedMotion ? 1 : 0.0001}
            color={p.color}
          />
        ))}
      </Instances>

      {/* Pins — one draw call via instancing, per-instance color, glossy chip. */}
      <Instances limit={PINS.length} range={PINS.length} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.14, 28]} />
        <meshPhysicalMaterial roughness={0.3} metalness={0.1} clearcoat={1} clearcoatRoughness={0.25} />
        {PINS.map((p, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (pinRefs.current[i] = el)}
            position={[p.x, 0.07, p.z]}
            scale={reducedMotion ? 1 : 0.0001}
            color={p.color}
          />
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

      {/* Fine glints drifting over the board. */}
      <Sparkles count={20} scale={[FIELD_W, 1.4, FIELD_D]} position={[0, 0.6, 0]} size={1.6} speed={reducedMotion ? 0 : 0.25} opacity={0.4} color={palette.brandLight} />

      <Hotspot
        position={[0, 0.5, 1.4]}
        label="Animated 3D arrows"
        detail="Draw the play, animate it, export to MP4 or GIF for your players."
      />
    </group>
  )
}
