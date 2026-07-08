import { Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import * as THREE from 'three'
import { TacticsField } from './TacticsField'
import { Lighting } from './Lighting'
import { Water } from './hero/Water'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

/**
 * Gentle presentation camera: a slow lissajous drift + pointer parallax, always
 * aimed at the middle of the field so the board stays perfectly framed.
 */
function Rig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const k = reduced ? 0 : 1
    damp3(
      camera.position,
      [
        0.1 + k * (Math.sin(t * 0.16) * 0.16 + state.pointer.x * 0.25),
        2.3 + k * (Math.cos(t * 0.13) * 0.1 - state.pointer.y * 0.15),
        6.8 + k * Math.sin(t * 0.09) * 0.18,
      ],
      0.6,
      delta,
    )
    camera.lookAt(0.05, -0.05, 0)
  })
  return null
}

/**
 * Tactics board scene: a full possession played out on real water — numbered
 * caps, synced swim arrows, passes and a finish, framed by two floating goals.
 * Default-exported for React.lazy; only mounted once it scrolls near the
 * viewport (see Showcase).
 */
export default function TacticsCanvas({ active = true }: { active?: boolean }) {
  const reduced = usePrefersReducedMotion()
  const fallback = <div className="h-full w-full bg-surface" aria-hidden="true" />

  if (!isWebGLAvailable()) return fallback

  return (
    <ErrorBoundary label="TacticsCanvas" fallback={fallback}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0.1, 2.3, 6.8], fov: 37, near: 0.1, far: 60 }}
        frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color(palette.bg), 0)
          // Fades the pool's edges into the card background for a seamless frame.
          scene.fog = new THREE.Fog(palette.bg, 6.5, 13.5)
        }}
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Same cinematic rig as the hero, so the pools match across scenes. */}
          <Lighting />

          {/* The pool itself — same living water as the hero. */}
          <Water reducedMotion={reduced} segments={72} size={[24, 15]} position={[0, 0, -1]} />

          <TacticsField reducedMotion={reduced} />
          <Rig reduced={reduced} />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  )
}
