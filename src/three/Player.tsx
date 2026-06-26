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

// Vertical layout — the surface is at local y = 0, so only the shoulders, neck
// and head sit above it; the torso is submerged (hidden by the opaque water).
const SHOULDER_Y = 0.16
const HEAD_Y = 0.72
const _ballLocal = new THREE.Vector3()

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
  const reachShoulder: [number, number, number] = [sign * 0.4, SHOULDER_Y + 0.02, 0.06]
  const restShoulder: [number, number, number] = [-sign * 0.4, SHOULDER_Y + 0.02, 0.06]
  const reachPole: [number, number, number] = [sign * 0.7, -0.2, 0.6]
  const restPole: [number, number, number] = [-sign * 0.6, -0.8, 0.2]

  // Rest hand sinks just below the surface (so that arm reads as in the water).
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
        torso.current.scale.y = 1 + Math.sin(t * 1.2 + phase) * 0.018
        torso.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.02
      }
    }

    if (head.current) {
      _ballLocal.copy(aim.current).sub(base)
      const yaw = THREE.MathUtils.clamp(Math.atan2(_ballLocal.x, Math.max(_ballLocal.z, 0.4)), -0.7, 0.7)
      const pitch = THREE.MathUtils.clamp((_ballLocal.y - HEAD_Y) * 0.18, -0.45, 0.4)
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
      ripple.current.scale.setScalar(1 + rp * 1.5)
      ;(ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.28 * (1 - rp)
    }
  })

  return (
    <group position={position}>
      <group ref={torso}>
        {/* Torso (mostly submerged) */}
        <RoundedBox args={[0.8, 1.35, 0.55]} radius={0.19} smoothness={4} position={[0, -0.34, 0]} castShadow>
          <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
        </RoundedBox>

        {/* Broad shoulders */}
        {[-0.36, 0.36].map((x) => (
          <mesh key={x} position={[x, SHOULDER_Y, 0.02]} castShadow>
            <sphereGeometry args={[0.24, 22, 18]} />
            <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
          </mesh>
        ))}

        {/* Neck */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.19, 0.26, 16]} />
          <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
        </mesh>

        {/* Head + cap */}
        <group ref={head} position={[0, HEAD_Y, 0]}>
          <mesh scale={[1, 1.04, 1]} castShadow>
            <sphereGeometry args={[0.29, 32, 28]} />
            <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
          </mesh>

          {/* Cap dome */}
          <mesh position={[0, 0.02, -0.01]} castShadow>
            <sphereGeometry args={[0.315, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.66]} />
            <meshPhysicalMaterial color={capColor} roughnessMap={capWear} {...CAP_PROPS} />
          </mesh>
          {/* Cap rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.285, 0.026, 12, 40]} />
            <meshPhysicalMaterial color={capColor} {...CAP_PROPS} />
          </mesh>

          {/* Ear protectors */}
          {[-0.28, 0.28].map((x) => (
            <group key={x} position={[x, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.11, 0.11, 0.055, 20]} />
                <meshPhysicalMaterial color={capColor} {...CAP_PROPS} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <torusGeometry args={[0.065, 0.016, 10, 24]} />
                <meshStandardMaterial color="#2A2E22" roughness={0.7} />
              </mesh>
            </group>
          ))}

          {/* Cap numbers on the sides */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.32, 0.06, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial map={numberTex} transparent toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Arms */}
      <PlayerArm base={base} shoulder={reachShoulder} target={aim} pole={reachPole} />
      <PlayerArm base={base} shoulder={restShoulder} target={restTarget} pole={restPole} upperLen={0.4} foreLen={0.38} />

      {/* Foam collar + treading ripple at the water line */}
      <mesh ref={foam} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.62, 40]} />
        <meshBasicMaterial color="#E6E8E2" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ripple} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.58, 40]} />
        <meshBasicMaterial color={palette.silver} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
