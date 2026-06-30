import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PlayerArm } from './PlayerArm'

interface ModelArmsProps {
  /** Player world position (the waterline base). */
  base: THREE.Vector3
  /** Shared world-space ball position the reach arm follows. */
  aim: MutableRefObject<THREE.Vector3>
  /** Which arm reaches for the ball. */
  reachSide?: 'left' | 'right'
  reducedMotion?: boolean
  phase?: number
  /** Shoulder height above the waterline (tune to the bust). */
  shoulderY?: number
  /** Half-distance between the shoulders. */
  shoulderX?: number
  /** Shoulder forward offset. */
  shoulderZ?: number
  /** Limb thickness multiplier. */
  girth?: number
  /** Upper-arm length. */
  upperLen?: number
  /** Forearm length. */
  foreLen?: number
  /** Skin tone to match the model. */
  skin?: string
}

/**
 * Procedural arms for a rig-less player bust: a reach arm that throws/catches by
 * tracking the ball, and a relaxed rest arm. Same two-bone IK and pass logic as
 * the procedural Player, so a static image-to-3D model can join the pass.
 */
export function ModelArms({
  base,
  aim,
  reachSide = 'right',
  reducedMotion = false,
  phase = 0,
  shoulderY = 0.26,
  shoulderX = 0.44,
  shoulderZ = 0.12,
  girth = 1,
  upperLen = 0.32,
  foreLen = 0.3,
  skin,
}: ModelArmsProps) {
  const sign = reachSide === 'right' ? 1 : -1
  const reachShoulder: [number, number, number] = [sign * shoulderX, shoulderY, shoulderZ]
  const restShoulder: [number, number, number] = [-sign * shoulderX, shoulderY, shoulderZ]
  const reachPole: [number, number, number] = [sign * 0.7, -0.2, 0.6]
  const restPole: [number, number, number] = [-sign * 0.6, -0.8, 0.2]
  const restTarget = useRef(new THREE.Vector3())

  useFrame((state) => {
    const t = state.clock.elapsedTime
    restTarget.current.set(
      base.x - sign * 0.45,
      base.y - 0.06 + (reducedMotion ? 0 : Math.sin(t * 1.1 + phase) * 0.03),
      base.z + 0.5,
    )
  })

  // PlayerArm solves in player-local space (it subtracts `base`), so it must
  // live in a group translated to the player position — same as Player.tsx.
  return (
    <group position={[base.x, base.y, base.z]}>
      <PlayerArm
        base={base}
        shoulder={reachShoulder}
        target={aim}
        pole={reachPole}
        upperLen={upperLen}
        foreLen={foreLen}
        girth={girth}
        skin={skin}
      />
      <PlayerArm
        base={base}
        shoulder={restShoulder}
        target={restTarget}
        pole={restPole}
        upperLen={upperLen * 0.92}
        foreLen={foreLen * 0.92}
        girth={girth * 0.92}
        skin={skin}
      />
    </group>
  )
}
