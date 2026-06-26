import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Environment, Lightformer, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { WaterSurface } from './WaterSurface'
import { WaterPoloBall } from './WaterPoloBall'
import { CausticGlow } from './CausticGlow'
import { Particles } from './Particles'
import { LaneRopes } from './LaneRopes'
import { WaterPoloGoal } from './WaterPoloGoal'
import { WATER_Y } from './wave'
import { CameraRig } from './CameraRig'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'

/**
 * Hero water scene. Default-exported so it can be `React.lazy`-loaded — the
 * Three.js bundle never blocks first paint.
 *
 * Renderer note: we use the stock R3F <Canvas>, i.e. three's WebGLRenderer,
 * which selects WebGL 2 where available and transparently falls back to
 * WebGL 1. We deliberately do NOT assume WebGPU. If WebGL is missing
 * entirely we render a calm static backdrop instead of crashing.
 */
export default function HeroCanvas() {
  const reduced = usePrefersReducedMotion()

  if (!isWebGLAvailable()) {
    return (
      <div
        className="h-full w-full"
        style={{
          background: `radial-gradient(120% 80% at 70% 10%, ${palette.brand}22, transparent 60%), ${palette.bg}`,
        }}
        aria-hidden="true"
      />
    )
  }

  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

  return (
    <Canvas
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.6, 6.5], fov: 42, near: 0.1, far: 100 }}
      // Reduced motion → render on demand (a single static frame) instead of
      // an animation loop.
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(palette.bg), 0)
        scene.fog = new THREE.Fog(palette.bg, 9, 24)
      }}
    >
      <Suspense fallback={<SceneLoader />}>
        <hemisphereLight args={[palette.brandLight, palette.bg, 0.4]} />
        <directionalLight position={[4, 8, 3]} intensity={1.0} color={palette.silver} />

        {/* Baked-once studio environment (no network fetch) so the wet ball
            picks up soft olive/silver reflections. */}
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={2.2} position={[0, 4, -3]} scale={[8, 8, 1]} color={palette.brandLight} />
          <Lightformer intensity={1.1} position={[-5, 2, 2]} scale={[3, 3, 1]} color={palette.silver} />
          <Lightformer intensity={0.7} position={[5, 1, 3]} scale={[3, 3, 1]} color={palette.brand} />
        </Environment>

        <WaterSurface reducedMotion={reduced} segments={isMobile ? 48 : 96} />
        <CausticGlow position={[2.6, -0.55, 0.4]} reducedMotion={reduced} />
        <WaterPoloBall reducedMotion={reduced} />

        {/* Water polo context: floating lane ropes + a goal at the far end. */}
        <LaneRopes reducedMotion={reduced} />
        <WaterPoloGoal position={[0, WATER_Y, -5.5]} width={3} height={0.95} emissiveIntensity={0.25} />

        {/* Atmosphere: drifting spray + fine glints on the air above the water. */}
        <Particles count={isMobile ? 16 : 30} reducedMotion={reduced} />
        <Sparkles
          count={isMobile ? 18 : 36}
          scale={[12, 3, 6]}
          position={[0, 0.4, 0]}
          size={2}
          speed={reduced ? 0 : 0.3}
          opacity={0.5}
          color={palette.silver}
        />

        <CameraRig reducedMotion={reduced} />
        <AdaptiveDpr pixelated />
      </Suspense>
    </Canvas>
  )
}
