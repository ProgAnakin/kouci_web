import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createArm } from './armRig'
import { HERO_COLORS } from './constants'

export interface PlayerPose {
  lean: number
  twist: number
}

interface ClayPlayerProps {
  /** Waterline position of the player. */
  base: THREE.Vector3
  /** Static facing yaw (radians; 0 faces the camera). */
  facing: number
  capColor: string
  capNumber: string
  /** Which arm reaches for the ball. */
  reachSide: 'left' | 'right'
  /** World-space choreographed target for the reach hand. */
  hand: MutableRefObject<THREE.Vector3>
  /** World-space ball position — the head watches it. */
  watch: MutableRefObject<THREE.Vector3>
  /** Body english (lean/twist) from the pass choreography. */
  pose: MutableRefObject<PlayerPose>
  phase?: number
  reducedMotion?: boolean
}

function makeNumberTexture(num: string): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.font = '700 88px "Inter", "Helvetica Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(244, 246, 236, 0.92)'
  ctx.fillText(num, size / 2, size / 2 + 4)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Smooth chunky torso profile (waterline → shoulders), lathed. */
function makeTorsoGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.005, -0.55),
    new THREE.Vector2(0.3, -0.52),
    new THREE.Vector2(0.4, -0.3),
    new THREE.Vector2(0.43, -0.06),
    new THREE.Vector2(0.4, 0.1),
    new THREE.Vector2(0.33, 0.24),
    new THREE.Vector2(0.22, 0.32),
    new THREE.Vector2(0.13, 0.36),
    new THREE.Vector2(0.005, 0.37),
  ]
  return new THREE.LatheGeometry(pts, 40)
}

const _target = new THREE.Vector3()
const _pole = new THREE.Vector3()
/** The head's neutral local orientation (straight ahead). */
const _restQ = new THREE.Quaternion()

/** Rest height of the body above the waterline (chest riding clear). */
const LIFT = 0.09

/**
 * A stylized clay water polo player: chunky lathed torso in a dark suit, round
 * head under a numbered cap with ear guards, and smooth two-bone skinned arms —
 * one reaching for the ball, one treading water. The whole figure bobs, leans
 * and twists with the pass choreography, and the head tracks the ball.
 */
export function ClayPlayer({
  base,
  facing,
  capColor,
  capNumber,
  reachSide,
  hand,
  watch,
  pose,
  phase = 0,
  reducedMotion = false,
}: ClayPlayerProps) {
  const side = reachSide === 'right' ? 1 : -1

  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)

  // Shared materials — one of each, reused by every mesh of this player.
  const skinMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: HERO_COLORS.skin,
        roughness: 0.36,
        clearcoat: 0.55,
        clearcoatRoughness: 0.38,
        sheen: 0.3,
        sheenColor: new THREE.Color('#e8b98a'),
        envMapIntensity: 0.85,
      }),
    [],
  )
  const suitMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: HERO_COLORS.suitDark,
        roughness: 0.5,
        clearcoat: 0.28,
        clearcoatRoughness: 0.5,
        envMapIntensity: 0.7,
      }),
    [],
  )
  const capMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: capColor,
        roughness: 0.42,
        clearcoat: 0.4,
        clearcoatRoughness: 0.42,
        envMapIntensity: 0.8,
      }),
    [capColor],
  )
  const trimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: HERO_COLORS.capTrim,
        roughness: 0.6,
      }),
    [],
  )

  const torsoGeo = useMemo(makeTorsoGeometry, [])
  const numberTex = useMemo(() => makeNumberTexture(capNumber), [capNumber])

  // Skinned arms (reach + rest).
  const reachArm = useMemo(
    () => createArm({ L1: 0.36, L2: 0.34, rShoulder: 0.115, rWrist: 0.085, material: skinMat }),
    [skinMat],
  )
  const restArm = useMemo(
    () => createArm({ L1: 0.34, L2: 0.32, rShoulder: 0.105, rWrist: 0.08, material: skinMat }),
    [skinMat],
  )

  useEffect(() => {
    return () => {
      reachArm.dispose()
      restArm.dispose()
      torsoGeo.dispose()
      numberTex.dispose()
      skinMat.dispose()
      suitMat.dispose()
      capMat.dispose()
      trimMat.dispose()
    }
  }, [reachArm, restArm, torsoGeo, numberTex, skinMat, suitMat, capMat, trimMat])

  useFrame((state) => {
    const g = body.current
    if (!g) return
    const t = state.clock.elapsedTime
    const lean = pose.current.lean
    const twist = pose.current.twist

    if (!reducedMotion) {
      // Treading-water bob; the throw pushes the body down a touch as it whips.
      g.position.y = LIFT + Math.sin(t * 1.1 + phase) * 0.035 - Math.abs(lean) * 0.1
      g.rotation.x = lean + Math.sin(t * 0.9 + phase * 1.7) * 0.015
      g.rotation.y = twist + Math.sin(t * 0.5 + phase) * 0.05 + state.pointer.x * 0.06
      g.rotation.z = Math.sin(t * 0.8 + phase * 1.3) * 0.02
    }

    // Head glances toward the ball (and a little of the cursor). The blend is
    // toward the head's FIXED rest pose — not the previous frame — so the look
    // stays a partial glance instead of converging to a full neck-crank.
    const h = head.current
    if (h) {
      _target.copy(watch.current)
      if (!reducedMotion) {
        _target.x += state.pointer.x * 0.5
        _target.y += state.pointer.y * 0.3
      }
      h.lookAt(_target)
      h.quaternion.slerp(_restQ, 0.55) // keep 55% neutral, 45% look
    }

    // Reach arm: world target → body-local, relative to its shoulder.
    _target.copy(hand.current)
    g.worldToLocal(_target)
    _target.sub(reachArm.group.position)
    _pole.set(side * 0.7, -0.15, 0.55)
    reachArm.solve(_target, _pole)

    // Rest arm: sculls underwater (as in the reference — only the reaching arm
    // shows), with a slow treading sway.
    _target.set(
      -side * 0.06,
      -0.5 + (reducedMotion ? 0 : Math.sin(t * 1.15 + phase) * 0.04),
      0.2 + (reducedMotion ? 0 : Math.cos(t * 0.9 + phase) * 0.05),
    )
    _pole.set(-side * 0.85, -0.25, 0.25)
    restArm.solve(_target, _pole)
  })

  return (
    <group position={base} rotation-y={facing}>
      <group ref={body} position-y={LIFT}>
        {/* Torso (suit) */}
        <mesh geometry={torsoGeo} material={suitMat} />
        {/* Suit shoulder straps read through the shoulder spheres — skip; the
            shoulders themselves are skin. */}
        <mesh position={[0.24, 0.22, 0]} material={skinMat}>
          <sphereGeometry args={[0.13, 20, 18]} />
        </mesh>
        <mesh position={[-0.24, 0.22, 0]} material={skinMat}>
          <sphereGeometry args={[0.13, 20, 18]} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.36, 0.02]} material={skinMat}>
          <cylinderGeometry args={[0.11, 0.13, 0.14, 18]} />
        </mesh>

        {/* Head + cap */}
        <group ref={head} position={[0, 0.55, 0.04]}>
          <mesh scale={[1, 1.06, 1.02]} material={skinMat}>
            <sphereGeometry args={[0.25, 32, 28]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.03, 0.245]} scale={[1, 0.85, 0.9]} material={skinMat}>
            <sphereGeometry args={[0.05, 14, 12]} />
          </mesh>
          {/* Cap dome (covers the skull down past the ears) */}
          <mesh position={[0, 0.015, -0.005]} material={capMat}>
            <sphereGeometry args={[0.265, 32, 24, 0, Math.PI * 2, 0, 2.05]} />
          </mesh>
          {/* Cap centre band */}
          <mesh position={[0, 0.015, -0.005]} rotation-x={Math.PI / 2} material={trimMat}>
            <torusGeometry args={[0.266, 0.008, 10, 40, Math.PI]} />
          </mesh>
          {/* Ear guards + grille dot (axis along local X, disc on the outside) */}
          {[1, -1].map((s) => (
            <group key={s} position={[s * 0.245, -0.03, 0.01]}>
              <mesh rotation-z={Math.PI / 2} material={capMat}>
                <cylinderGeometry args={[0.075, 0.08, 0.05, 20]} />
              </mesh>
              <mesh position={[s * 0.028, 0, 0]} rotation-z={Math.PI / 2} material={trimMat}>
                <cylinderGeometry args={[0.048, 0.048, 0.006, 18]} />
              </mesh>
            </group>
          ))}
          {/* Cap numbers, one on each side above the ear guards — sitting just
              off the dome, angled so they read in three-quarter views. */}
          {[1, -1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.255, 0.09, 0.01]}
              rotation-y={s * 1.25}
              rotation-z={-s * 0.1}
            >
              <planeGeometry args={[0.17, 0.17]} />
              <meshBasicMaterial
                map={numberTex}
                transparent
                depthWrite={false}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>

        {/* Arms */}
        <primitive object={reachArm.group} position={[side * 0.3, 0.24, 0.1]} />
        <primitive object={restArm.group} position={[-side * 0.3, 0.24, 0.1]} />
      </group>

      {/* Waterline blend: a dark seat ring + faint foam ring hug the torso. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.015} scale={[1, 0.82, 1]}>
        <ringGeometry args={[0.3, 0.56, 36]} />
        <meshBasicMaterial color="#161a12" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} scale={[1, 0.82, 1]}>
        <ringGeometry args={[0.5, 0.56, 36]} />
        <meshBasicMaterial
          color={HERO_COLORS.foam}
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
