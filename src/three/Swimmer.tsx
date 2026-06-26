import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { makeNumberTexture } from './numberTexture'

interface SwimmerProps {
  /** Base position at the water line. */
  position: [number, number, number]
  capColor: string
  bodyColor?: string
  number: number
  /** Shared world-space point both arms reach toward (the ball). */
  aim: MutableRefObject<THREE.Vector3>
  reducedMotion?: boolean
  /** Phase offset so the two swimmers don't bob in lockstep. */
  phase?: number
}

const ARM_LEN = 0.58
const SHOULDER_Y = 0.2
const HEAD_Y = 0.52
const SHOULDER_L = new THREE.Vector3(-0.22, SHOULDER_Y, 0.04)
const SHOULDER_R = new THREE.Vector3(0.22, SHOULDER_Y, 0.04)
const UP = new THREE.Vector3(0, 1, 0)

// Module-scoped scratch to keep the frame loop allocation-free.
const _aimLocal = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _q = new THREE.Quaternion()

/**
 * A stylised water polo player seen at the water line: a numbered cap (with ear
 * protectors) for the head, shoulders, and two arms that continuously reach
 * toward the ball. The body below the surface is hidden by the opaque water, so
 * the swimmer reads as emerging from the pool, ringed by a treading ripple.
 */
export function Swimmer({
  position,
  capColor,
  bodyColor = palette.silver,
  number,
  aim,
  reducedMotion = false,
  phase = 0,
}: SwimmerProps) {
  const base = useMemo(() => new THREE.Vector3(...position), [position])
  const numberTex = useMemo(() => makeNumberTexture(number), [number])
  useEffect(() => () => numberTex.dispose(), [numberTex])

  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const ripple = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    _aimLocal.copy(aim.current).sub(base)

    if (leftArm.current) {
      _dir.copy(_aimLocal).sub(SHOULDER_L).normalize()
      _q.setFromUnitVectors(UP, _dir)
      leftArm.current.quaternion.copy(_q)
    }
    if (rightArm.current) {
      _dir.copy(_aimLocal).sub(SHOULDER_R).normalize()
      _q.setFromUnitVectors(UP, _dir)
      rightArm.current.quaternion.copy(_q)
    }

    if (head.current) {
      head.current.position.y = HEAD_Y + (reducedMotion ? 0 : Math.sin(t * 1.5 + phase) * 0.025)
      head.current.rotation.y = reducedMotion ? 0 : Math.sin(t * 0.8 + phase) * 0.12
    }

    if (ripple.current && !reducedMotion) {
      const rp = (t * 0.6 + phase) % 1
      ripple.current.scale.setScalar(0.6 + rp * 1.7)
      ;(ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - rp)
    }
  })

  return (
    <group position={position}>
      {/* Shoulders at the water line */}
      <mesh position={[0, SHOULDER_Y - 0.04, 0]} scale={[1, 0.5, 0.72]} castShadow>
        <sphereGeometry args={[0.32, 20, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, (SHOULDER_Y + HEAD_Y) / 2, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.24, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>

      {/* Capped head */}
      <group ref={head} position={[0, HEAD_Y, 0]}>
        <mesh castShadow scale={[1, 0.95, 1]}>
          <sphereGeometry args={[0.24, 28, 24]} />
          <meshPhysicalMaterial color={capColor} roughness={0.35} metalness={0.05} clearcoat={0.8} clearcoatRoughness={0.3} />
        </mesh>
        {[-0.23, 0.23].map((x) => (
          <mesh key={x} position={[x, -0.02, 0]} scale={[0.5, 0.7, 0.9]}>
            <sphereGeometry args={[0.08, 14, 12]} />
            <meshStandardMaterial color={capColor} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.26, 0.26]} />
          <meshBasicMaterial map={numberTex} transparent toneMapped={false} />
        </mesh>
      </group>

      {/* Arms — aimed at the ball each frame */}
      {[leftArm, rightArm].map((armRef, i) => (
        <group key={i} ref={armRef} position={i === 0 ? SHOULDER_L.toArray() : SHOULDER_R.toArray()}>
          <mesh position={[0, ARM_LEN / 2, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, ARM_LEN, 10]} />
            <meshStandardMaterial color={bodyColor} roughness={0.55} metalness={0.05} />
          </mesh>
          <mesh position={[0, ARM_LEN, 0]}>
            <sphereGeometry args={[0.065, 14, 12]} />
            <meshStandardMaterial color={bodyColor} roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* Treading-water ripple at the surface */}
      <mesh ref={ripple} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.42, 32]} />
        <meshBasicMaterial color={palette.silver} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
