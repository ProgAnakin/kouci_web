import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { SKIN, SKIN_PROPS, CAP_PROPS } from './playerLook'
import { makeNumberTexture } from './numberTexture'
import { makeNoiseTexture } from './proceduralTextures'
import { PlayerArm } from './PlayerArm'

interface PlayerProps {
  /** Base position at the water line (local y = 0 sits at the surface). */
  position: [number, number, number]
  capColor: string
  number: number
  /** Shared world-space ball position both the head and reach-arm follow. */
  aim: MutableRefObject<THREE.Vector3>
  reducedMotion?: boolean
  phase?: number
  /** Which arm reaches for the ball. */
  reachSide?: 'left' | 'right'
}

// Chubby proportions: big rounded head, almost no neck, broad soft shoulders,
// a full torso. The surface is at local y = 0 — only the upper chest, shoulders
// and head sit above it; the rest is submerged (hidden by the opaque water).
const SHOULDER_Y = 0.22
const HEAD_Y = 0.74
const _ballLocal = new THREE.Vector3()

// Slightly lighter tint for the ear guards (reads as the perforated cup).
function lighten(hex: string, amt: number) {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#ffffff'), amt)
  return `#${c.getHexString()}`
}

export function Player({
  position,
  capColor,
  number,
  aim,
  reducedMotion = false,
  phase = 0,
  reachSide = 'right',
}: PlayerProps) {
  const base = useMemo(() => new THREE.Vector3(...position), [position])
  const numberTex = useMemo(() => makeNumberTexture(number, '#E6E8E2'), [number])
  const capWear = useMemo(() => makeNoiseTexture(128, 0.4), [])
  const earColor = useMemo(() => lighten(capColor, 0.25), [capColor])
  useEffect(() => {
    return () => {
      numberTex.dispose()
      capWear.dispose()
    }
  }, [numberTex, capWear])

  const torso = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const foam = useRef<THREE.Mesh>(null)
  const ripple = useRef<THREE.Mesh>(null)

  const sign = reachSide === 'right' ? 1 : -1
  const reachShoulder: [number, number, number] = [sign * 0.42, SHOULDER_Y + 0.02, 0.08]
  const restShoulder: [number, number, number] = [-sign * 0.42, SHOULDER_Y + 0.02, 0.08]
  const reachPole: [number, number, number] = [sign * 0.7, -0.2, 0.6]
  const restPole: [number, number, number] = [-sign * 0.6, -0.8, 0.2]

  const restTarget = useRef(new THREE.Vector3())

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (torso.current) {
      if (reducedMotion) {
        torso.current.position.y = 0
        torso.current.scale.set(1, 1, 1)
        torso.current.rotation.z = 0
      } else {
        torso.current.position.y = Math.sin(t * 0.8 + phase) * 0.03
        torso.current.scale.y = 1 + Math.sin(t * 1.2 + phase) * 0.016
        torso.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.02
      }
    }

    if (head.current) {
      _ballLocal.copy(aim.current).sub(base)
      // Look toward the ball, nudged by the cursor so the players react to the
      // mouse (the interactivity that justifies a live 3D scene).
      const px = reducedMotion ? 0 : state.pointer.x
      const py = reducedMotion ? 0 : state.pointer.y
      const yaw = THREE.MathUtils.clamp(Math.atan2(_ballLocal.x, Math.max(_ballLocal.z, 0.4)) + px * 0.3, -0.85, 0.85)
      const pitch = THREE.MathUtils.clamp((_ballLocal.y - HEAD_Y) * 0.18 - py * 0.2, -0.5, 0.45)
      const k = reducedMotion ? 1 : 0.12
      head.current.rotation.y += (yaw - head.current.rotation.y) * k
      head.current.rotation.x += (-pitch - head.current.rotation.x) * k
    }

    restTarget.current.set(
      base.x - sign * 0.45,
      base.y - 0.06 + (reducedMotion ? 0 : Math.sin(t * 1.1 + phase) * 0.03),
      base.z + 0.5,
    )

    if (foam.current && !reducedMotion) {
      foam.current.scale.setScalar(1 + Math.sin(t * 1.6 + phase) * 0.04)
    }
    if (ripple.current && !reducedMotion) {
      const rp = (t * 0.5 + phase) % 1
      ripple.current.scale.setScalar(1 + rp * 1.4)
      ;(ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.26 * (1 - rp)
    }
  })

  return (
    <group position={position}>
      <group ref={torso}>
        {/* Full, soft torso (mostly submerged) */}
        <RoundedBox args={[0.94, 1.5, 0.7]} radius={0.3} smoothness={5} position={[0, -0.42, 0]} castShadow>
          <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
        </RoundedBox>
        {/* Soft chest swell at the water line */}
        <mesh position={[0, 0.06, 0.12]} scale={[1.05, 0.8, 0.9]} castShadow>
          <sphereGeometry args={[0.46, 26, 22]} />
          <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
        </mesh>

        {/* Broad, sloping shoulders */}
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, SHOULDER_Y, 0.03]} scale={[1.05, 0.9, 1]} castShadow>
            <sphereGeometry args={[0.3, 24, 20]} />
            <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
          </mesh>
        ))}

        {/* Short thick neck */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.26, 0.2, 18]} />
          <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
        </mesh>

        {/* Big round head + cap */}
        <group ref={head} position={[0, HEAD_Y, 0]}>
          <mesh scale={[1, 1.02, 1]} castShadow>
            <sphereGeometry args={[0.33, 36, 30]} />
            <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
          </mesh>

          {/* Cap dome */}
          <mesh position={[0, 0.02, -0.01]} castShadow>
            <sphereGeometry args={[0.352, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.66]} />
            <meshPhysicalMaterial color={capColor} roughnessMap={capWear} {...CAP_PROPS} />
          </mesh>
          {/* Cap rim / chin strap */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.03, 12, 44]} />
            <meshPhysicalMaterial color={capColor} {...CAP_PROPS} />
          </mesh>

          {/* Ear protectors (lighter perforated cups) */}
          {[-0.31, 0.31].map((x) => (
            <group key={x} position={[x, -0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.13, 0.13, 0.06, 22]} />
                <meshPhysicalMaterial color={earColor} {...CAP_PROPS} />
              </mesh>
              {/* Perforations */}
              {[0, 1, 2, 3, 4].map((i) => {
                const ang = (i / 5) * Math.PI * 2
                return (
                  <mesh key={i} position={[Math.cos(ang) * 0.06, 0.031, Math.sin(ang) * 0.06]}>
                    <cylinderGeometry args={[0.014, 0.014, 0.02, 8]} />
                    <meshStandardMaterial color="#2A2E22" roughness={0.8} />
                  </mesh>
                )
              })}
            </group>
          ))}

          {/* Cap numbers on the sides */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.352, 0.07, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
              <planeGeometry args={[0.32, 0.32]} />
              <meshBasicMaterial map={numberTex} transparent toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Chubby arms */}
      <PlayerArm base={base} shoulder={reachShoulder} target={aim} pole={reachPole} />
      <PlayerArm base={base} shoulder={restShoulder} target={restTarget} pole={restPole} upperLen={0.4} foreLen={0.38} girth={0.92} />

      {/* Foam collar + treading ripple at the water line */}
      <mesh ref={foam} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.74, 44]} />
        <meshBasicMaterial color="#E6E8E2" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ripple} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.56, 0.68, 44]} />
        <meshBasicMaterial color={palette.silver} transparent opacity={0.26} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
