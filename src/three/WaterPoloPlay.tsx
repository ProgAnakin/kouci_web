import { lazy, Suspense, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from './Player'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { PLAYER_MODELS, type PlayerModelDef } from './modelConfig'
import { PoloBall } from './PoloBall'
import { Droplets } from './Droplets'
import { CausticGlow } from './CausticGlow'
import { CAP_DARK, CAP_LIGHT } from './playerLook'
import { WATER_Y } from './wave'
import { heroState } from './heroState'

// The GLTF loader (Draco, animation, skinning) is its own chunk — it only
// downloads once a real model is configured, so the default build stays light.
const ModelPlayer = lazy(() => import('./ModelPlayer').then((m) => ({ default: m.ModelPlayer })))

// Two players at the water line, pushed to the right so the headline (left) is
// never covered.
const A = new THREE.Vector3(3.2, WATER_Y, 0.6)
const B = new THREE.Vector3(5.3, WATER_Y, 0.0)

// Hand height the ball is thrown from / caught at (world Y). Kept low so the
// pass arc stays in the players' zone, below the headline.
const HAND_Y = 0.42
const HAND_A = new THREE.Vector3(A.x + 0.35, HAND_Y, A.z)
const HAND_B = new THREE.Vector3(B.x - 0.35, HAND_Y, B.z)

const ARC_HEIGHT = 0.55
const SPEED = 0.4 // one leg of the pass per ~2.5s

const smooth = (p: number) => p * p * (3 - 2 * p)

interface HeroPlayerProps {
  model: PlayerModelDef | null
  position: [number, number, number]
  capColor: string
  number: number
  aim: MutableRefObject<THREE.Vector3>
  reducedMotion?: boolean
  phase?: number
  reachSide?: 'left' | 'right'
}

/** Renders the real model if one is configured, else the procedural player. */
function HeroPlayer({ model, position, capColor, number, aim, reducedMotion, phase, reachSide }: HeroPlayerProps) {
  const placeholder = (
    <Player
      position={position}
      capColor={capColor}
      number={number}
      aim={aim}
      reducedMotion={reducedMotion}
      phase={phase}
      reachSide={reachSide}
    />
  )
  if (!model) return placeholder
  return (
    <ModelErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <ModelPlayer def={model} position={position} aim={aim} reducedMotion={reducedMotion} phase={phase} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

/**
 * The hero centrepiece: two water polo players passing the ball back and forth.
 * The ball arcs between their hands (with spin, shedding droplets), and both
 * players' reach-arms track it via a shared aim vector. Under reduced motion
 * the ball simply rests in a player's hands.
 */
export function WaterPoloPlay({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ball = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Group>(null)
  const aim = useRef(new THREE.Vector3().copy(HAND_A))

  const from = useMemo(() => new THREE.Vector3(), [])
  const to = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    let p = 0
    if (reducedMotion) {
      from.copy(HAND_A)
      to.copy(HAND_A)
    } else {
      const phase = (t * SPEED) % 2
      if (phase < 1) {
        from.copy(HAND_A)
        to.copy(HAND_B)
        p = phase
      } else {
        from.copy(HAND_B)
        to.copy(HAND_A)
        p = phase - 1
      }
    }

    const e = smooth(p)
    const x = THREE.MathUtils.lerp(from.x, to.x, e)
    const z = THREE.MathUtils.lerp(from.z, to.z, e)
    const y = THREE.MathUtils.lerp(from.y, to.y, e) + Math.sin(Math.PI * p) * ARC_HEIGHT

    aim.current.set(x, y, z)
    heroState.ball.copy(aim.current)

    if (ball.current) {
      ball.current.position.set(x, y, z)
      if (!reducedMotion) {
        ball.current.rotation.x += delta * 4.5
        ball.current.rotation.z += delta * 2.5
      }
    }
    if (glow.current) glow.current.position.set(x, WATER_Y + 0.02, z)
  })

  return (
    <group>
      <HeroPlayer
        model={PLAYER_MODELS.a}
        position={A.toArray()}
        capColor={CAP_DARK}
        number={4}
        aim={aim}
        reducedMotion={reducedMotion}
        phase={0}
        reachSide="right"
      />
      <HeroPlayer
        model={PLAYER_MODELS.b}
        position={B.toArray()}
        capColor={CAP_LIGHT}
        number={7}
        aim={aim}
        reducedMotion={reducedMotion}
        phase={1.4}
        reachSide="left"
      />

      <PoloBall ref={ball} radius={0.3} />
      <Droplets source={aim} reducedMotion={reducedMotion} />

      {/* Light pool that follows the ball across the surface. */}
      <group ref={glow}>
        <CausticGlow position={[0, 0, 0]} reducedMotion={reducedMotion} />
      </group>
    </group>
  )
}
