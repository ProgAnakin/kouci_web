import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ClayPlayer, type PlayerPose } from './ClayPlayer'
import { Ball } from './Ball'
import { Ripples, Spray, type SprayEmitter } from './effects'
import { WATER_Y, HERO_COLORS } from './constants'
import { heroState } from '../heroState'
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
} from './choreography'

const ARC_HEIGHT = 0.85

interface PassSceneProps {
  reducedMotion?: boolean
  /** Shifts the whole play along X (re-centres the scene on mobile). */
  offsetX?: number
}

/**
 * The hero centrepiece: two clay players passing the ball in a loop with real
 * throw choreography — wind-up, an accelerating whip to the release, a
 * ballistic lob with backspin, and a soft absorbing catch that splashes.
 * Everything runs off one clock; see choreography.ts for the beats.
 */
export function PassScene({ reducedMotion = false, offsetX = 0 }: PassSceneProps) {
  const baseA = useMemo(() => new THREE.Vector3(4.55 + offsetX, WATER_Y, 0.85), [offsetX])
  const baseB = useMemo(() => new THREE.Vector3(6.95 + offsetX, WATER_Y, -0.35), [offsetX])

  const ball = useRef<THREE.Group>(null)
  const splashA = useRef<THREE.Mesh>(null)
  const splashB = useRef<THREE.Mesh>(null)

  const handA = useRef(new THREE.Vector3())
  const handB = useRef(new THREE.Vector3())
  const ballPos = useRef(new THREE.Vector3())
  const poseA = useRef<PlayerPose>({ lean: 0, twist: 0 })
  const poseB = useRef<PlayerPose>({ lean: 0, twist: 0 })
  const spray = useRef<SprayEmitter>({ pos: new THREE.Vector3(), rate: 0 })

  const _from = useMemo(() => new THREE.Vector3(), [])
  const _to = useMemo(() => new THREE.Vector3(), [])

  const splashMatA = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: HERO_COLORS.foam,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  )
  const splashMatB = useMemo(() => splashMatA.clone(), [splashMatA])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    if (reducedMotion) {
      poseAt(handA.current, baseA, POSE.carry, 1, 0, 0, 0)
      poseAt(handB.current, baseB, POSE.idle, -1, 0, 0, 0)
      ballPos.current.copy(handA.current).add(PALM_OFFSET)
      spray.current.rate = 0
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
        const p = easeIn((u - BEAT.cockEnd) / (BEAT.release - BEAT.cockEnd))
        blendPoses(thrower.current, throwerBase, POSE.cock, POSE.release, p, throwerSign, t, throwerPhase, 0)
      } else {
        const p = easeInOut(Math.min(1, (u - BEAT.release) / 0.3))
        blendPoses(thrower.current, throwerBase, POSE.release, POSE.idle, p, throwerSign, t, throwerPhase)
      }

      // ---- Catcher's reach hand: idle → rise to meet the ball → absorb → carry ----
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

      // ---- Ball: glued to the thrower until release, then ballistic ----
      if (u < BEAT.release) {
        ballPos.current.copy(thrower.current).add(PALM_OFFSET)
      } else if (u < BEAT.catch) {
        poseAt(_from, throwerBase, POSE.release, throwerSign, 0, 0, 0).add(PALM_OFFSET)
        poseAt(_to, catcherBase, POSE.ready, catcherSign, 0, 0, 0).add(PALM_OFFSET)
        flightAt(ballPos.current, _from, _to, ARC_HEIGHT, (u - BEAT.release) / (BEAT.catch - BEAT.release))
      } else {
        ballPos.current.copy(catcher.current).add(PALM_OFFSET)
      }

      // ---- Body english ----
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
      if (u < 0.5) {
        catcherPose.lean = 0
        catcherPose.twist = 0
      } else if (u < BEAT.catch) {
        catcherPose.lean = 0.09 * easeInOut((u - 0.5) / (BEAT.catch - 0.5))
      } else if (u < BEAT.absorbEnd) {
        catcherPose.lean = THREE.MathUtils.lerp(0.09, -0.04, easeOut((u - BEAT.catch) / (BEAT.absorbEnd - BEAT.catch)))
      } else {
        catcherPose.lean = THREE.MathUtils.lerp(-0.04, 0, easeInOut((u - BEAT.absorbEnd) / (1 - BEAT.absorbEnd)))
      }

      // ---- Spray: bursts on the throw and the catch, a drip otherwise ----
      spray.current.pos.copy(ballPos.current)
      if (u >= 0.38 && u < 0.48) spray.current.rate = 70
      else if (u >= BEAT.catch && u < 0.9) spray.current.rate = 120
      else spray.current.rate = 3

      // ---- Catch splash ring blooming under the catch point ----
      const splash = aThrows ? splashB.current : splashA.current
      const mat = aThrows ? splashMatB : splashMatA
      const other = aThrows ? splashMatA : splashMatB
      other.opacity = Math.max(0, other.opacity - delta * 1.5)
      if (splash && u >= BEAT.catch) {
        const dt = (u - BEAT.catch) * HALF_CYCLE
        poseAt(_to, catcherBase, POSE.ready, catcherSign, 0, 0, 0)
        splash.position.set(_to.x, WATER_Y + 0.03, _to.z)
        const s = 0.4 + dt * 2.2
        splash.scale.set(s, s, 1)
        mat.opacity = Math.max(0, 0.4 * (1 - dt / 0.6))
      }

      // ---- Ball spin: backspin in flight, lazy roll while held ----
      if (ball.current) {
        const inFlight = u >= BEAT.release && u < BEAT.catch
        const rate = inFlight ? 4.6 : 0.4
        ball.current.rotation.x -= delta * rate * throwerSign
        ball.current.rotation.z += delta * rate * 0.3
      }
    }

    if (ball.current) ball.current.position.copy(ballPos.current)
    heroState.ball.copy(ballPos.current)
  })

  return (
    <group>
      <ClayPlayer
        base={baseA}
        facing={0.5}
        capColor={HERO_COLORS.capDark}
        capNumber="4"
        reachSide="right"
        hand={handA}
        watch={ballPos}
        pose={poseA}
        phase={0}
        reducedMotion={reducedMotion}
      />
      <ClayPlayer
        base={baseB}
        facing={-0.55}
        capColor={HERO_COLORS.capLight}
        capNumber="7"
        reachSide="left"
        hand={handB}
        watch={ballPos}
        pose={poseB}
        phase={1.4}
        reducedMotion={reducedMotion}
      />

      <Ball ref={ball} radius={0.26} />

      <Ripples center={baseA} reducedMotion={reducedMotion} phase={0} />
      <Ripples center={baseB} reducedMotion={reducedMotion} phase={1.3} />
      <Spray emitter={spray} reducedMotion={reducedMotion} />

      {/* Catch splash rings (one per player's catch spot). */}
      <mesh ref={splashA} rotation-x={-Math.PI / 2} material={splashMatA}>
        <ringGeometry args={[0.34, 0.42, 48]} />
      </mesh>
      <mesh ref={splashB} rotation-x={-Math.PI / 2} material={splashMatB}>
        <ringGeometry args={[0.34, 0.42, 48]} />
      </mesh>
    </group>
  )
}
