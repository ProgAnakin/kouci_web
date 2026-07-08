import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../lib/theme'
import { Arrow } from './Arrow'
import { Hotspot } from './Hotspot'
import { Cap } from './Cap'
import { Ball } from './hero/Ball'
import { Goal } from './hero/Goal'

const FIELD_W = 6
const FIELD_D = 4

/** One choreographed possession, looped. All times in seconds. */
const T = 9
const SWIM = [0.8, 2.6] as const
const PASS1 = [2.9, 3.5] as const
const PASS2 = [3.8, 4.4] as const
const SHOT = [4.7, 5.05] as const
const RESET = [6.6, 8.3] as const

/** Where the shot lands in the right goal's mouth. */
const GOAL_POINT = new THREE.Vector3(2.95, 0.2, 0.18)
/** Where the ball settles (floating) after the goal. */
const BALL_REST = new THREE.Vector3(2.86, 0.05, 0.18)
const BALL_R = 0.11

// Attackers swim; defenders and the pivot hold water and drift.
// [startX, startZ, endX, endZ]
const ATTACKERS: { path: [number, number, number, number]; color: string; number: number }[] = [
  { path: [-1.9, -1.15, -0.55, -1.25], color: palette.brandLight, number: 4 },
  { path: [-2.15, 0.05, -0.95, 0.4], color: palette.brandLight, number: 6 },
  { path: [-1.9, 1.2, -0.5, 1.15], color: palette.brandLight, number: 7 },
]
const HOLDERS: { x: number; z: number; color: string; number: number }[] = [
  { x: 0.55, z: -0.65, color: palette.brand, number: 5 },
  { x: 0.7, z: 0.8, color: palette.brand, number: 8 },
  { x: 2.3, z: 0.0, color: palette.silver, number: 2 },
]

const smooth = (p: number) => p * p * (3 - 2 * p)
const win = (e: number, [a, b]: readonly [number, number]) =>
  THREE.MathUtils.clamp((e - a) / (b - a), 0, 1)

/** Floating marking line, slightly emissive so it reads over the dark water. */
function Line({
  size,
  position,
  color = palette.silver,
  opacity = 0.55,
}: {
  size: [number, number, number]
  position: [number, number, number]
  color?: string
  opacity?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.22}
        transparent
        opacity={opacity}
        roughness={0.7}
      />
    </mesh>
  )
}

/**
 * The tactics board as a real pool: markings and numbered caps floating on the
 * hero's water, framed by two floating goals. A full possession plays on loop —
 * three attackers swim their lanes (arrows drawing with them), the ball is
 * worked 6 → 4 → pivot 2, and the pivot finishes into the right goal.
 */
export function TacticsField({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const attackerRefs = useRef<(THREE.Group | null)[]>([])
  const holderRefs = useRef<(THREE.Group | null)[]>([])
  const haloRefs = useRef<(THREE.Object3D | null)[]>([])
  const arrowProgress = [useRef(0), useRef(0), useRef(0)]
  const ball = useRef<THREE.Group>(null)
  const flash = useRef<THREE.Mesh>(null)
  const splash = useRef<THREE.Mesh>(null)

  const capPos = useMemo(() => Array.from({ length: 6 }, () => new THREE.Vector3()), [])
  const from = useMemo(() => new THREE.Vector3(), [])
  const to = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const e = reducedMotion ? 0 : t % T

    // --- Caps -----------------------------------------------------------
    const swimP = smooth(win(e, SWIM))
    const backP = smooth(win(e, RESET))
    const travel = reducedMotion ? 0 : swimP * (1 - backP)

    ATTACKERS.forEach((a, i) => {
      const [sx, sz, ex, ez] = a.path
      const x = THREE.MathUtils.lerp(sx, ex, travel)
      const z = THREE.MathUtils.lerp(sz, ez, travel)
      capPos[i].set(x, 0, z)
      const g = attackerRefs.current[i]
      if (g) g.position.set(x, 0, z)
      arrowProgress[i].current = travel
    })
    HOLDERS.forEach((h, i) => {
      const dx = reducedMotion ? 0 : Math.sin(t * 0.55 + i * 2.1) * 0.05
      const dz = reducedMotion ? 0 : Math.cos(t * 0.48 + i * 1.7) * 0.05
      capPos[3 + i].set(h.x + dx, 0, h.z + dz)
      const g = holderRefs.current[i]
      if (g) g.position.set(h.x + dx, 0, h.z + dz)
    })

    // Halos track their caps.
    for (let i = 0; i < 6; i++) {
      const halo = haloRefs.current[i]
      if (!halo) continue
      halo.position.set(capPos[i].x, 0.018, capPos[i].z)
      if (!reducedMotion) {
        const pulse = 1 + Math.sin(t * 1.6 + i) * 0.1
        halo.scale.setScalar(pulse)
      }
    }

    // --- Ball ------------------------------------------------------------
    const b = ball.current
    if (b) {
      const bob = reducedMotion ? 0 : Math.sin(t * 1.4) * 0.012
      const carryOffset = 0.26

      const passes: {
        w: readonly [number, number]
        from: number
        to: number
        arc: number
      }[] = [
        { w: PASS1, from: 1, to: 0, arc: 0.42 }, // 6 → 4
        { w: PASS2, from: 0, to: 5, arc: 0.46 }, // 4 → pivot 2
      ]

      let placed = false
      for (const pass of passes) {
        const p = win(e, pass.w)
        if (p > 0 && p < 1) {
          const ep = smooth(p)
          from.copy(capPos[pass.from]).add(new THREE.Vector3(carryOffset, 0.05, 0))
          to.copy(capPos[pass.to]).add(new THREE.Vector3(carryOffset, 0.05, 0))
          b.position.lerpVectors(from, to, ep)
          b.position.y = 0.05 + Math.sin(Math.PI * ep) * pass.arc
          placed = true
          break
        }
      }

      if (!placed) {
        const shotP = win(e, SHOT)
        if (shotP > 0 && shotP < 1) {
          from.copy(capPos[5]).add(new THREE.Vector3(carryOffset, 0.06, 0))
          b.position.lerpVectors(from, GOAL_POINT, shotP)
          b.position.y += Math.sin(Math.PI * shotP) * 0.1
          placed = true
        } else if (e >= SHOT[1] && e < RESET[0]) {
          // In the net → drops and floats just inside the goal mouth.
          const drop = THREE.MathUtils.clamp((e - SHOT[1]) / 0.35, 0, 1)
          b.position.lerpVectors(GOAL_POINT, BALL_REST, smooth(drop))
          if (drop >= 1) b.position.y = BALL_REST.y + bob
          placed = true
        }
      }

      if (!placed) {
        // Carried by 6 before the play; fades out/in around the reset.
        const carrier = e < PASS1[0] || e >= RESET[0] ? 1 : 0
        b.position.copy(capPos[carrier]).add(new THREE.Vector3(carryOffset, 0.05 + bob, 0))
      }

      // Scale in/out around the reset so the "teleport" back is invisible.
      let s = 1
      if (!reducedMotion) {
        if (e >= RESET[0] && e < RESET[0] + 0.4) s = 1 - win(e, [RESET[0], RESET[0] + 0.4])
        else if (e >= RESET[0] + 0.4 && e < RESET[1]) s = 0
        else if (e >= RESET[1] && e < RESET[1] + 0.4) s = win(e, [RESET[1], RESET[1] + 0.4])
      }
      b.scale.setScalar(Math.max(0.0001, s))
      if (!reducedMotion && placed) b.rotation.x -= 0.12
    }

    // --- Impact FX ---------------------------------------------------------
    if (flash.current) {
      const p = reducedMotion ? 0 : win(e, [SHOT[1], SHOT[1] + 0.5])
      const active = p > 0 && p < 1
      flash.current.visible = active
      if (active) {
        flash.current.scale.setScalar(0.25 + p * 1.5)
        ;(flash.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - p)
      }
    }
    if (splash.current) {
      const p = reducedMotion ? 0 : win(e, [SHOT[1] + 0.3, SHOT[1] + 0.95])
      const active = p > 0 && p < 1
      splash.current.visible = active
      if (active) {
        splash.current.scale.setScalar(0.3 + p * 2.2)
        ;(splash.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - p)
      }
    }
  })

  return (
    <group>
      {/* Field markings floating on the water: goal lines, halfway, 5m, 2m. */}
      <Line size={[0.05, 0.014, FIELD_D]} position={[-FIELD_W / 2, 0.02, 0]} opacity={0.75} />
      <Line size={[0.05, 0.014, FIELD_D]} position={[FIELD_W / 2, 0.02, 0]} opacity={0.75} />
      <Line size={[FIELD_W, 0.014, 0.05]} position={[0, 0.02, -FIELD_D / 2]} opacity={0.4} />
      <Line size={[FIELD_W, 0.014, 0.05]} position={[0, 0.02, FIELD_D / 2]} opacity={0.4} />
      <Line
        size={[0.05, 0.014, FIELD_D]}
        position={[0, 0.02, 0]}
        color={palette.brandLight}
        opacity={0.75}
      />
      {[-1.8, 1.8].map((x) => (
        <Line
          key={`m5-${x}`}
          size={[0.04, 0.014, FIELD_D]}
          position={[x, 0.02, 0]}
          color={palette.brandLight}
          opacity={0.35}
        />
      ))}
      {[-2.5, 2.5].map((x) => (
        <Line
          key={`m2-${x}`}
          size={[0.04, 0.014, FIELD_D]}
          position={[x, 0.02, 0]}
          color={palette.brand}
          opacity={0.55}
        />
      ))}

      {/* Floating goals at both ends (the hero's goal, scaled to the board). */}
      <Goal
        position={[-FIELD_W / 2 - 0.1, 0.01, 0]}
        rotationY={Math.PI / 2}
        width={1.7}
        height={0.52}
      />
      <Goal
        position={[FIELD_W / 2 + 0.1, 0.01, 0]}
        rotationY={-Math.PI / 2}
        width={1.7}
        height={0.52}
      />

      {/* Halos under the caps — one instanced draw call, additive. */}
      <Instances limit={6} range={6}>
        <ringGeometry args={[0.24, 0.33, 32]} />
        <meshBasicMaterial
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
        {[...ATTACKERS.map((a) => a.color), ...HOLDERS.map((h) => h.color)].map((color, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => (haloRefs.current[i] = el)}
            position={[0, 0.018, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            color={color}
          />
        ))}
      </Instances>

      {/* Attackers (choreographed) */}
      {ATTACKERS.map((a, i) => (
        <group
          key={a.number}
          ref={(el) => (attackerRefs.current[i] = el)}
          position={[a.path[0], 0, a.path[1]]}
        >
          <Cap
            position={[0, 0.1, 0]}
            color={a.color}
            number={a.number}
            delay={i * 0.09}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}
      {/* Defenders + pivot (holding water) */}
      {HOLDERS.map((h, i) => (
        <group key={h.number} ref={(el) => (holderRefs.current[i] = el)} position={[h.x, 0, h.z]}>
          <Cap
            position={[0, 0.1, 0]}
            color={h.color}
            number={h.number}
            delay={0.3 + i * 0.09}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}

      {/* Swim arrows, drawn in sync with the swimmers. Trimmed at both ends so
          the stroke starts clear of the departing cap and never pokes the
          arriving one. */}
      {ATTACKERS.map((a, i) => {
        const [sx, sz, ex, ez] = a.path
        const len = Math.hypot(ex - sx, ez - sz)
        const ux = (ex - sx) / len
        const uz = (ez - sz) / len
        return (
          <Arrow
            key={`arrow-${a.number}`}
            from={[sx + ux * 0.34, 0.16, sz + uz * 0.34]}
            to={[ex - ux * 0.3, 0.16, ez - uz * 0.3]}
            color={a.color}
            reducedMotion={reducedMotion}
            progressRef={arrowProgress[i]}
          />
        )
      })}

      {/* The match ball being worked around (hero ball, scaled down). */}
      <group ref={ball} position={[-1.9, 0.05, 0.05]}>
        <Ball radius={BALL_R} />
      </group>

      {/* Goal flash (vertical, in the right goal mouth) + landing splash. */}
      <mesh ref={flash} visible={false} position={GOAL_POINT} rotation-y={Math.PI / 2}>
        <ringGeometry args={[0.16, 0.24, 32]} />
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
        position={[BALL_REST.x, 0.022, BALL_REST.z]}
        rotation-x={-Math.PI / 2}
      >
        <ringGeometry args={[0.14, 0.2, 32]} />
        <meshBasicMaterial
          color={palette.silver}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Fine glints drifting over the pool. */}
      <Sparkles
        count={14}
        scale={[FIELD_W + 1, 1.2, FIELD_D + 0.5]}
        position={[0, 0.55, 0]}
        size={1.5}
        speed={reducedMotion ? 0 : 0.22}
        opacity={0.35}
        color={palette.brandLight}
      />

      <Hotspot
        position={[0.9, 0.35, 2.45]}
        direction="up"
        label="Caps & animated arrows"
        detail="Set the play by cap number, animate it, export to MP4 or GIF for your players."
      />
    </group>
  )
}
