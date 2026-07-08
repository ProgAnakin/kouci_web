import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { Hotspot } from './Hotspot'
import { Ball } from './hero/Ball'
import { Goal } from './hero/Goal'

export const GOAL_W = 3.4
export const GOAL_H = 1.05

// Raw shot data in the app's own coordinates (x across the goal, y up),
// mapped below onto the 3D goal mouth. Interleaved goal/save order so the
// replay feels like a real shootout, not two batches.
type Kind = 'goal' | 'save' | 'wide'
const RAW: { x: number; y: number; kind: Kind }[] = [
  { x: -1.45, y: 0.36, kind: 'goal' },
  { x: 0.0, y: 0.02, kind: 'save' },
  { x: 1.5, y: 0.4, kind: 'goal' },
  { x: -1.6, y: -0.36, kind: 'goal' },
  { x: 0.12, y: 0.56, kind: 'save' },
  { x: 1.55, y: -0.4, kind: 'goal' },
  { x: -2.3, y: 0.2, kind: 'wide' },
  { x: -0.25, y: 0.46, kind: 'goal' },
  { x: 0.5, y: 0.28, kind: 'save' },
  { x: 0.3, y: -0.46, kind: 'goal' },
  { x: 1.2, y: 0.06, kind: 'goal' },
  { x: -0.4, y: -0.12, kind: 'save' },
  { x: -1.05, y: 0.0, kind: 'goal' },
]

const mapX = (x: number) => x * 0.8
const mapY = (y: number) => 0.14 + (y + 0.5) * 0.72

interface Shot {
  kind: Kind
  target: THREE.Vector3
  start: number
  land: number
}

const FIRST = 0.9
const EVERY = 0.85
const FLIGHT = 0.5
const LAST_LAND = FIRST + (RAW.length - 1) * EVERY + FLIGHT
const FADE_AT = LAST_LAND + 2.2
const T = FADE_AT + 0.9

const SHOTS: Shot[] = RAW.map((s, i) => ({
  kind: s.kind,
  target:
    s.kind === 'wide'
      ? new THREE.Vector3(-1.88, 0.07, 0.16) // splashes down just wide of the post
      : new THREE.Vector3(mapX(s.x), mapY(s.y), 0.08),
  start: FIRST + i * EVERY,
  land: FIRST + i * EVERY + FLIGHT,
}))

const GOALS = SHOTS.filter((s) => s.kind === 'goal')
const MISSES = SHOTS.filter((s) => s.kind !== 'goal')

const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
const clamp01 = (v: number) => THREE.MathUtils.clamp(v, 0, 1)

const _p0 = new THREE.Vector3()
const _pc = new THREE.Vector3()

/**
 * The penalty map, alive: a floating goal on real water, and the season's
 * penalties replayed as a shootout — each ball flies in from the 5m line and
 * lands exactly where the app plotted it. Goals flash the net and stay lit;
 * saves freeze at the keeper's stop; the wide one splashes past the post.
 */
export function PenaltyMap({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const goalMat = useRef<THREE.MeshStandardMaterial>(null)
  const goalRefs = useRef<(THREE.Object3D | null)[]>([])
  const missRefs = useRef<(THREE.Object3D | null)[]>([])
  const ball = useRef<THREE.Group>(null)
  const flash = useRef<THREE.Mesh>(null)
  const splash = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const e = reducedMotion ? LAST_LAND + 0.1 : t % T
    const fade = reducedMotion ? 0 : clamp01((e - FADE_AT) / 0.6)

    // "Heat" pulse on the scored shots once they're on the board.
    if (goalMat.current) {
      goalMat.current.emissiveIntensity = reducedMotion ? 0.5 : 0.5 + Math.sin(t * 2) * 0.25
    }

    // Markers pop exactly when their shot lands, and fade out before replay.
    GOALS.forEach((s, i) => {
      const g = goalRefs.current[i]
      if (!g) return
      const pop = reducedMotion ? 1 : easeOutBack(clamp01((e - s.land) / 0.45))
      g.scale.setScalar(Math.max(0.0001, pop * (1 - fade)))
    })
    MISSES.forEach((s, i) => {
      const m = missRefs.current[i]
      if (!m) return
      const pop = reducedMotion ? 1 : easeOutBack(clamp01((e - s.land) / 0.45))
      m.scale.setScalar(Math.max(0.0001, pop * (1 - fade)))
    })

    // The flying ball: quadratic arc from the 5m line to the plotted point.
    const b = ball.current
    if (b) {
      const shot = reducedMotion ? undefined : SHOTS.find((s) => e >= s.start && e < s.land)
      b.visible = !!shot
      if (shot) {
        const p = (e - shot.start) / FLIGHT
        const tgt = shot.target
        _p0.set(tgt.x * 0.2, 0.42, 3.2)
        _pc.set(tgt.x * 0.55, Math.max(tgt.y, 0.3) + 0.5, 1.5)
        const u = 1 - p
        b.position.set(
          u * u * _p0.x + 2 * u * p * _pc.x + p * p * tgt.x,
          u * u * _p0.y + 2 * u * p * _pc.y + p * p * tgt.y,
          u * u * _p0.z + 2 * u * p * _pc.z + p * p * tgt.z,
        )
        b.rotation.x -= 0.28
      }
    }

    // Net flash on goals; water splash for the wide one. One reusable mesh
    // each — shots are spaced wider than the effects live.
    if (flash.current) {
      const live = reducedMotion ? undefined : GOALS.find((s) => e >= s.land && e < s.land + 0.45)
      flash.current.visible = !!live
      if (live) {
        const p = (e - live.land) / 0.45
        flash.current.position.set(live.target.x, live.target.y, 0.04)
        flash.current.scale.setScalar(0.3 + p * 1.6)
        ;(flash.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - p)
      }
    }
    if (splash.current) {
      const wide = SHOTS.find((s) => s.kind === 'wide')!
      const p = reducedMotion ? 0 : (e - wide.land) / 0.7
      const active = p > 0 && p < 1
      splash.current.visible = active
      if (active) {
        splash.current.scale.setScalar(0.3 + p * 2.4)
        ;(splash.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - p)
      }
    }
  })

  const wideTarget = useMemo(() => SHOTS.find((s) => s.kind === 'wide')!.target, [])

  return (
    <group>
      {/* The floating goal itself — same build as the hero's. */}
      <Goal position={[0, 0.01, 0]} width={GOAL_W} height={GOAL_H} />

      {/* Scored shots — emissive, pulsing */}
      <Instances limit={GOALS.length} range={GOALS.length}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshStandardMaterial
          ref={goalMat}
          color={palette.brandLight}
          emissive={palette.brand}
          emissiveIntensity={0.5}
          roughness={0.35}
        />
        {GOALS.map((s, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (goalRefs.current[i] = el)}
            position={s.target.toArray()}
            scale={reducedMotion ? 1 : 0.0001}
          />
        ))}
      </Instances>

      {/* Missed / saved shots — muted silver, smaller */}
      <Instances limit={MISSES.length} range={MISSES.length}>
        <sphereGeometry args={[0.062, 16, 16]} />
        <meshStandardMaterial color={palette.silver} roughness={0.6} transparent opacity={0.75} />
        {MISSES.map((s, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (missRefs.current[i] = el)}
            position={s.target.toArray()}
            scale={reducedMotion ? 1 : 0.0001}
          />
        ))}
      </Instances>

      {/* The flying ball (hero ball, penalty-sized). */}
      <group ref={ball} visible={false}>
        <Ball radius={0.075} />
      </group>

      {/* Impact FX */}
      <mesh ref={flash} visible={false}>
        <ringGeometry args={[0.12, 0.19, 32]} />
        <meshBasicMaterial
          color={palette.brandLight}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        ref={splash}
        visible={false}
        position={[wideTarget.x, 0.022, wideTarget.z]}
        rotation-x={-Math.PI / 2}
      >
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial
          color={palette.silver}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <Hotspot
        position={[-2.1, 1.38, 0.3]}
        align="start"
        label="Shot placement"
        detail="Every penalty mapped: goal or miss, first attempt or repeat, bounce or not."
      />
    </group>
  )
}
