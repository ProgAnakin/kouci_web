import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader, DRACOLoader, type GLTF } from 'three-stdlib'
import * as THREE from 'three'
import { WATER_Y } from './constants'
import { heroState } from '../heroState'
import { Ripples } from './effects'

// Self-hosted Draco decoder (copied from three's examples into /public/draco)
// — fetched only when a compressed player model actually loads.
const DRACO_PATH = '/draco/'

let sharedLoader: GLTFLoader | null = null
function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
    const draco = new DRACOLoader()
    draco.setDecoderPath(DRACO_PATH)
    sharedLoader.setDRACOLoader(draco)
  }
  return sharedLoader
}

// Minimal Suspense cache: one fetch serves both players (the scene is cloned
// per instance), and a load failure surfaces to the boundary below.
interface Entry {
  promise?: Promise<void>
  gltf?: GLTF
  error?: unknown
}
const cache = new Map<string, Entry>()

function useGLB(url: string): GLTF {
  let entry = cache.get(url)
  if (!entry) {
    entry = {}
    cache.set(url, entry)
    entry.promise = getLoader()
      .loadAsync(url)
      .then((gltf) => {
        entry!.gltf = gltf
      })
      .catch((err) => {
        entry!.error = err
      })
  }
  if (entry.error) throw entry.error
  if (!entry.gltf) throw entry.promise
  return entry.gltf
}

/** Smallest signed angle from a to b, in radians. */
function angleDelta(a: number, b: number): number {
  return THREE.MathUtils.euclideanModulo(b - a + Math.PI, Math.PI * 2) - Math.PI
}

export interface PlayerDef {
  /** GLB under /public, e.g. '/assets/players/player-4.glb'. */
  url: string
  /** x/z on the water. */
  position: [number, number]
  /** Base facing; positive turns the front (+Z) toward +X (screen right). */
  rotationY?: number
  /** Uniform scale (the bust is ~1 unit tall at scale 1). */
  scale?: number
  /** Lift (+) / sink (−) of the bust's centre relative to the waterline. */
  offsetY?: number
  /** Desynchronises the idle so the two players never bob in unison. */
  phase?: number
}

/**
 * One clay player bust riding the swell. The model is static (no rig), so all
 * life is procedural: a bob and gentle roll on the water, plus a subtle
 * whole-bust turn that follows the ball (heroState) and leans with the cursor.
 */
function PlayerBust({ def, reducedMotion = false }: { def: PlayerDef; reducedMotion?: boolean }) {
  const gltf = useGLB(def.url)
  const group = useRef<THREE.Group>(null)
  const model = useMemo(() => gltf.scene.clone(true), [gltf])

  const [x, z] = def.position
  const baseY = WATER_Y + (def.offsetY ?? 0.5)
  const baseYaw = def.rotationY ?? 0
  const phase = def.phase ?? 0
  const center = useMemo(() => new THREE.Vector3(x, WATER_Y, z), [x, z])

  useEffect(() => {
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true
    })
  }, [model])

  useFrame((state) => {
    const g = group.current
    if (!g || reducedMotion) return
    const t = state.clock.elapsedTime
    // Ride the swell + a light roll, out of sync with the other player.
    g.position.y = baseY + Math.sin(t * 1.05 + phase * 2.3) * 0.04
    g.rotation.z = Math.sin(t * 0.65 + phase) * 0.045
    // Follow the ball with the whole bust (clamped), plus a cursor lean.
    const seek = Math.atan2(heroState.ball.x - x, heroState.ball.z - z)
    const follow = THREE.MathUtils.clamp(angleDelta(baseYaw, seek) * 0.14, -0.24, 0.24)
    g.rotation.y = baseYaw + follow + state.pointer.x * 0.08
  })

  return (
    <>
      <group ref={group} position={[x, baseY, z]} rotation-y={baseYaw} scale={def.scale ?? 2}>
        <primitive object={model} />
      </group>
      <Ripples center={center} phase={phase} reducedMotion={reducedMotion} />
    </>
  )
}

/** Renders nothing if a model fails to load — the scene stays ball + goal. */
class PlayerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The two clay players treading water in the hero. Suspends independently of
 * the rest of the scene (water/ball/goal appear first, the busts pop in), and
 * degrades to no players if the asset is missing.
 */
export function Players({ defs, reducedMotion = false }: { defs: PlayerDef[]; reducedMotion?: boolean }) {
  return (
    <PlayerBoundary>
      <Suspense fallback={null}>
        {defs.map((def, i) => (
          <PlayerBust key={i} def={def} reducedMotion={reducedMotion} />
        ))}
      </Suspense>
    </PlayerBoundary>
  )
}
