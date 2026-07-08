import { Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { damp3 } from 'maath/easing'
import * as THREE from 'three'
import { PenaltyMap, GOAL_H } from './PenaltyMap'
import { Lighting } from './Lighting'
import { Water } from './hero/Water'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

/** Slow drift + pointer parallax, aimed at the middle of the goal mouth. */
function Rig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const k = reduced ? 0 : 1
    damp3(
      camera.position,
      [
        0.35 + k * (Math.sin(t * 0.15) * 0.2 + state.pointer.x * 0.28),
        0.62 + k * (Math.cos(t * 0.12) * 0.07 - state.pointer.y * 0.12),
        4.35 + k * Math.sin(t * 0.09) * 0.15,
      ],
      0.6,
      delta,
    )
    camera.lookAt(0, GOAL_H * 0.42, -0.1)
  })
  return null
}

/**
 * Penalty shot map scene: a floating goal on real water with the season's
 * penalties replayed onto it shot by shot. Default-exported for React.lazy;
 * mounted on scroll-in.
 */
export default function PenaltyCanvas({ active = true }: { active?: boolean }) {
  const reduced = usePrefersReducedMotion()
  const fallback = <div className="h-full w-full bg-surface" aria-hidden="true" />

  if (!isWebGLAvailable()) return fallback

  return (
    <ErrorBoundary label="PenaltyCanvas" fallback={fallback}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0.35, 0.62, 4.35], fov: 37, near: 0.1, far: 60 }}
        frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color(palette.bg), 0)
          // Fade the pool into the card background beyond the goal.
          scene.fog = new THREE.Fog(palette.bg, 7, 13.5)
        }}
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Same cinematic rig as the hero, so the pools match across scenes. */}
          <Lighting />

          {/* Night sky above the far water — same texture as the hero. */}
          <Stars
            radius={18}
            depth={8}
            count={170}
            factor={1.9}
            saturation={0}
            fade
            speed={reduced ? 0 : 0.3}
          />

          {/* The pool the goal floats in — same living water as the hero. */}
          <Water reducedMotion={reduced} segments={64} size={[20, 14]} position={[0, 0, -1]} />

          <PenaltyMap reducedMotion={reduced} />
          <Rig reduced={reduced} />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  )
}
