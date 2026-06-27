import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader, DRACOLoader, SkeletonUtils, type GLTF } from 'three-stdlib'
import * as THREE from 'three'
import type { PlayerModelDef } from './modelConfig'

// Draco decoder from Google's CDN — only fetched once a real (possibly
// Draco-compressed) model is actually loaded. For a fully self-hosted build,
// copy three's decoder into /public and point setDecoderPath there instead.
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

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

// Minimal Suspense resource cache so the procedural placeholder shows while the
// model streams in, and a load failure surfaces to the ErrorBoundary.
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

interface ModelPlayerProps {
  def: PlayerModelDef
  /** Base position at the water line. */
  position: [number, number, number]
  /** Shared world-space ball position the head looks toward. */
  aim: MutableRefObject<THREE.Vector3>
  reducedMotion?: boolean
  phase?: number
}

const _target = new THREE.Vector3()

/**
 * Renders a real, rigged player model: loads the GLB (Draco-aware), clones it
 * (so one source can serve both players), loops its idle clip via an
 * AnimationMixer, and lets the head track the ball + cursor. Lazy-loaded and
 * mounted only when a model is configured (see modelConfig.ts).
 */
export function ModelPlayer({ def, position, aim, reducedMotion = false, phase = 0 }: ModelPlayerProps) {
  const gltf = useGLB(def.url)
  const model = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf])
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  const head = useMemo(
    () => (def.headBone ? model.getObjectByName(def.headBone) : null),
    [model, def.headBone],
  )

  useEffect(() => {
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true
    })
  }, [model])

  useEffect(() => {
    const clips = gltf.animations
    const clip = (def.idleClip && clips.find((c) => c.name === def.idleClip)) || clips[0]
    const action = clip ? mixer.clipAction(clip) : undefined
    action?.reset().fadeIn(0.4).play()
    return () => {
      mixer.stopAllAction()
    }
  }, [mixer, gltf, def.idleClip])

  useFrame((state, delta) => {
    if (!reducedMotion) mixer.update(delta)
    if (head) {
      _target.copy(aim.current)
      if (!reducedMotion) {
        _target.x += state.pointer.x * 0.6
        _target.y += state.pointer.y * 0.4 + Math.sin(state.clock.elapsedTime + phase) * 0.02
      }
      head.lookAt(_target)
    }
  })

  return (
    <group position={position} rotation-y={def.rotationY ?? 0} scale={def.scale ?? 1}>
      <primitive object={model} />
    </group>
  )
}
