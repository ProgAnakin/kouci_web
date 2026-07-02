import { lazy, Suspense, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from './Player'
import { ModelArms } from './ModelArms'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { PLAYER_MODELS, type PlayerModelDef } from './modelConfig'
import { PoloBall } from './PoloBall'
import { Droplets } from './Droplets'
import { CausticGlow } from './CausticGlow'
import { CAP_DARK, CAP_LIGHT } from './playerLook'
import { WATER_Y } from './wave'
import { heroState } from './heroState'
import {
  HALF_CYCLE,
  BEAT,
  POSE,
  PALM_OFFSET,
  easeIn,
  easeInOut,
  easeOut,
  blendPoses,
  poseAt,
  flightAt,
} from './passChoreography'

// The GLTF loader (Draco, animation, skinning) is its own chunk — it only
// downloads once a real model is configured, so the default build stays light.
const ModelPlayer = lazy(() => import('./ModelPlayer').then((m) => ({ default: m.ModelPlayer })))

// Procedural arms attached to the rig-less busts. Skin tone matches the model;
// shoulder placement is tuned to where the bust's shoulders sit (scale/offsetY).
const MODEL_SKIN = '#B97C50'
const ARM_PROPS = {
  // The bust's visual shoulders sit ≈0.15 above the waterline (offsetY 0.5,
  // scale 1.5); these offsets are relative to the waterline base.
  shoulderY: 0.75,
  shoulderX: 0.42,
  shoulderZ: 0.18,
  girth: 0.7,
  upperLen: 0.32,
  foreLen: 0.3,
}

const ARC_HEIGHT = 0.75

export interface PlayerPose {
  lean: number
  twist: number
}

interface HeroPlayerProps {
  model: PlayerModelDef | null
  position: [number, number, number]
  capColor: string
  number: number
  /** Choreographed reach-hand target (what the arm actually does). */
  hand: MutableRefObject<THREE.Vector3>
  /** Ball position — what the head/torso watches. */
  watch: MutableRefObject<THREE.Vector3>
  /** Body english (lean/twist) driven by the pass choreography. */
  pose: MutableRefObject<PlayerPose>
  reducedMotion?: boolean
  phase?: number
  reachSide?: 'left' | 'right'
}

/** Renders the real model if one is configured, else the procedural player. */
function HeroPlayer({
  model,
  position,
  capColor,
  number,
  hand,
  watch,
  pose,
  reducedMotion,
  phase,
  reachSide,
}: HeroPlayerProps) {
  const [px, py, pz] = position
  const base = useMemo(() => new THREE.Vector3(px, py, pz), [px, py, pz])

  const placeholder = (
    <Player
      position={position}
      capColor={capColor}
      number={number}
      aim={hand}
      reducedMotion={reducedMotion}
      phase={phase}
      reachSide={reachSide}
    />
  )
  if (!model) return placeholder
  return (
    <ModelErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <ModelPlayer
          def={model}
          position={position}
          aim={watch}
          pose={pose}
          reducedMotion={reducedMotion}
          phase={phase}
        />
        {/* Procedural arms so the rig-less bust can throw and catch. */}
        <ModelArms
          base={base}
          aim={hand}
          reachSide={reachSide}
          reducedMotion={reducedMotion}
          phase={phase}
          skin={MODEL_SKIN}
          {...ARM_PROPS}
        />
      </Suspense>
    </ModelErrorBoundary>
  )
}

interface WaterPoloPlayProps {
  reducedMotion?: boolean
  /** Shifts the whole play along X (used to re-centre the scene on mobile). */
  offsetX?: number
}

/**
 * The hero centrepiece: two players passing a water polo ball in a loop, with
 * real throw choreography — wind-up (anticipation), an accelerating whip to the
 * release, a ballistic lob with spin, and a soft absorbing catch that splashes.
 * Body lean/twist and head tracking follow the same timeline, so the whole
 * figure participates in every throw. See passChoreography.ts for the beats.
 */
export function WaterPoloPlay({ reducedMotion = false, offsetX = 0 }: WaterPoloPlayProps) {
  // Player bases: A on the left throws first; B sits deeper for a diagonal
  // composition. Both pushed right of the headline.
  const baseA = useMemo(() => new THREE.Vector3(4.55 + offsetX, WATER_Y, 0.85), [offsetX])
  const baseB = useMemo(() => new THREE.Vector3(6.95 + offsetX, WATER_Y, -0.35), [offsetX])

  const ball = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Group>(null)
  const splashA = useRef<THREE.Mesh>(null)
  const splashB = useRef<THREE.Mesh>(null)

  const handA = useRef(new THREE.Vector3())
  const handB = useRef(new THREE.Vector3())
  const ballPos = useRef(new THREE.Vector3())
  const poseA = useRef<PlayerPose>({ lean: 0, twist: 0 })
  const poseB = useRef<PlayerPose>({ lean: 0, twist: 0 })

  // Scratch vectors (allocation-free frame loop).
  const _from = useMemo(() => new THREE.Vector3(), [])
  const _to = useMemo(() => new THREE.Vector3(), [])
  const _prev = useMemo(() => new THREE.Vector3(), [])

  const splashMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#C5C9C0',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  const splashMatB = useMemo(() => splashMat.clone(), [splashMat])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    if (reducedMotion) {
      // Static tableau: A carries the ball, B waits.
      poseAt(handA.current, baseA, POSE.carry, 1, 0, 0, 0)
      poseAt(handB.current, baseB, POSE.idle, -1, 0, 0, 0)
      ballPos.current.copy(handA.current).add(PALM_OFFSET)
    } else {
      const cycle = t / HALF_CYCLE
      const u = cycle % 1
      const aThrows = Math.floor(cycle) % 2 === 0

      const thrower = aThrows ? handA : handB
      const catcher = aThrows ? handB : handA
      const throwerBase = aThrows ? baseA : baseB
      const catcherBase = aThrows ? baseB : baseA
      const throwerSign: 1 | -1 = aThrows ? 1 : -1
      const catcherSign: 1 | -1 = aThrows ? -1 : 1
      const throwerPose = aThrows ? poseA.current : poseB.current
      const catcherPose = aThrows ? poseB.current : poseA.current
      const throwerPhase = aThrows ? 0 : 1.4
      const catcherPhase = aThrows ? 1.4 : 0

      // ---- Thrower's reach hand: carry → cock → release → relax to idle ----
      if (u < BEAT.cockEnd) {
        const p = easeInOut(u / BEAT.cockEnd)
        blendPoses(thrower.current, throwerBase, POSE.carry, POSE.cock, p, throwerSign, t, throwerPhase)
      } else if (u < BEAT.release) {
        // The whip: accelerating, so the release snaps.
        const p = easeIn((u - BEAT.cockEnd) / (BEAT.release - BEAT.cockEnd))
        blendPoses(thrower.current, throwerBase, POSE.cock, POSE.release, p, throwerSign, t, throwerPhase, 0)
      } else {
        const p = easeInOut(Math.min(1, (u - BEAT.release) / 0.3))
        blendPoses(thrower.current, throwerBase, POSE.release, POSE.idle, p, throwerSign, t, throwerPhase)
      }

      // ---- Catcher's reach hand: idle → raise to meet the ball → absorb → carry ----
      if (u < 0.5) {
        poseAt(catcher.current, catcherBase, POSE.idle, catcherSign, t, catcherPhase, 0.03)
      } else if (u < BEAT.catch) {
        const p = easeInOut((u - 0.5) / (BEAT.catch - 0.5))
        blendPoses(catcher.current, catcherBase, POSE.idle, POSE.ready, p, catcherSign, t, catcherPhase)
      } else if (u < BEAT.absorbEnd) {
        const p = easeOut((u - BEAT.catch) / (BEAT.absorbEnd - BEAT.catch))
        blendPoses(catcher.current, catcherBase, POSE.ready, POSE.absorb, p, catcherSign, t, catcherPhase, 0)
      } else {
        const p = easeInOut((u - BEAT.absorbEnd) / (1 - BEAT.absorbEnd))
        blendPoses(catcher.current, catcherBase, POSE.absorb, POSE.carry, p, catcherSign, t, catcherPhase, 0)
      }

      // ---- Ball: glued to the thrower until release, ballistic to the catch ----
      _prev.copy(ballPos.current)
      if (u < BEAT.release) {
        ballPos.current.copy(thrower.current).add(PALM_OFFSET)
      } else if (u < BEAT.catch) {
        poseAt(_from, throwerBase, POSE.release, throwerSign, 0, 0, 0).add(PALM_OFFSET)
        poseAt(_to, catcherBase, POSE.ready, catcherSign, 0, 0, 0).add(PALM_OFFSET)
        const p = (u - BEAT.release) / (BEAT.catch - BEAT.release)
        flightAt(ballPos.current, _from, _to, ARC_HEIGHT, p)
      } else {
        ballPos.current.copy(catcher.current).add(PALM_OFFSET)
      }

      // ---- Body english: the whole figure throws, not just the arm ----
      // Thrower: lean back through the wind-up, whip forward at release, settle.
      if (u < BEAT.cockEnd) {
        const p = easeInOut(u / BEAT.cockEnd)
        throwerPose.lean = -0.11 * p
        throwerPose.twist = -throwerSign * 0.14 * p
      } else if (u < BEAT.release) {
        const p = easeIn((u - BEAT.cockEnd) / (BEAT.release - BEAT.cockEnd))
        throwerPose.lean = THREE.MathUtils.lerp(-0.11, 0.16, p)
        throwerPose.twist = THREE.MathUtils.lerp(-throwerSign * 0.14, throwerSign * 0.1, p)
      } else {
        const p = easeInOut(Math.min(1, (u - BEAT.release) / 0.35))
        throwerPose.lean = THREE.MathUtils.lerp(0.16, 0, p)
        throwerPose.twist = THREE.MathUtils.lerp(throwerSign * 0.1, 0, p)
      }
      // Catcher: rise toward the incoming ball, give slightly on the catch.
      if (u < 0.5) {
        catcherPose.lean = 0
        catcherPose.twist = 0
      } else if (u < BEAT.catch) {
        const p = easeInOut((u - 0.5) / (BEAT.catch - 0.5))
        catcherPose.lean = 0.09 * p
      } else if (u < BEAT.absorbEnd) {
        const p = easeOut((u - BEAT.catch) / (BEAT.absorbEnd - BEAT.catch))
        catcherPose.lean = THREE.MathUtils.lerp(0.09, -0.04, p)
      } else {
        const p = easeInOut((u - BEAT.absorbEnd) / (1 - BEAT.absorbEnd))
        catcherPose.lean = THREE.MathUtils.lerp(-0.04, 0, p)
      }

      // ---- Catch splash: a ring blooming on the water under the catch ----
      const splash = aThrows ? splashB.current : splashA.current
      const splashMaterial = aThrows ? splashMatB : splashMat
      const otherMaterial = aThrows ? splashMat : splashMatB
      otherMaterial.opacity = Math.max(0, otherMaterial.opacity - delta * 1.5)
      if (splash && u >= BEAT.catch) {
        const dt = (u - BEAT.catch) * HALF_CYCLE
        poseAt(_to, catcherBase, POSE.ready, catcherSign, 0, 0, 0)
        splash.position.set(_to.x, WATER_Y + 0.02, _to.z)
        const s = 0.45 + dt * 2.1
        splash.scale.set(s, s, 1)
        splashMaterial.opacity = Math.max(0, 0.42 * (1 - dt / 0.62))
      }

      // ---- Ball spin: fast backspin in flight, lazy roll while held ----
      if (ball.current) {
        const inFlight = u >= BEAT.release && u < BEAT.catch
        const rate = inFlight ? 5.2 : 0.5
        ball.current.rotation.x -= delta * rate * throwerSign
        ball.current.rotation.z += delta * rate * 0.35
      }
    }

    if (ball.current) ball.current.position.copy(ballPos.current)
    heroState.ball.copy(ballPos.current)
    if (glow.current) glow.current.position.set(ballPos.current.x, WATER_Y + 0.02, ballPos.current.z)
  })

  return (
    <group>
      <HeroPlayer
        model={PLAYER_MODELS.a}
        position={baseA.toArray()}
        capColor={CAP_DARK}
        number={4}
        hand={handA}
        watch={ballPos}
        pose={poseA}
        reducedMotion={reducedMotion}
        phase={0}
        reachSide="right"
      />
      <HeroPlayer
        model={PLAYER_MODELS.b}
        position={baseB.toArray()}
        capColor={CAP_LIGHT}
        number={7}
        hand={handB}
        watch={ballPos}
        pose={poseB}
        reducedMotion={reducedMotion}
        phase={1.4}
        reachSide="left"
      />

      <PoloBall ref={ball} radius={0.3} />
      <Droplets source={ballPos} reducedMotion={reducedMotion} />

      {/* Catch splashes (one ring per player's catch spot). */}
      <mesh ref={splashA} rotation-x={-Math.PI / 2} material={splashMat}>
        <ringGeometry args={[0.3, 0.4, 48]} />
      </mesh>
      <mesh ref={splashB} rotation-x={-Math.PI / 2} material={splashMatB}>
        <ringGeometry args={[0.3, 0.4, 48]} />
      </mesh>

      {/* Light pool that follows the ball across the surface. */}
      <group ref={glow}>
        <CausticGlow position={[0, 0, 0]} reducedMotion={reducedMotion} />
      </group>
    </group>
  )
}
