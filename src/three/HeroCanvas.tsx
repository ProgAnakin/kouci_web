import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { WaterSurface } from './WaterSurface'
import { WaterPoloPlay } from './WaterPoloPlay'
import { Particles } from './Particles'
import { WaterPoloGoal } from './WaterPoloGoal'
import { WATER_Y } from './wave'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { PostFX } from './PostFX'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'

/**
 * Hero pool scene — two players passing a water polo ball under a starry sky,
 * with cinematic lighting and post-processing. Default-exported for React.lazy.
 *
 * Renderer note: stock R3F <Canvas> (three's WebGLRenderer → WebGL 2 with a
 * WebGL 1 fallback). On desktop we render `flat` (no renderer tone mapping) and
 * let the post stack own color via an ACES pass; on mobile we drop the post
 * stack for performance and keep the renderer's default ACES tone mapping.
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
      flat={!isMobile}
      gl={{ antialias: isMobile, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0.6, 0.82, 6.0], fov: 50, near: 0.1, far: 100 }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(palette.bg), 1)
        scene.fog = new THREE.Fog(palette.bg, 14, 45)
      }}
    >
      <Suspense fallback={<SceneLoader />}>
        <Lighting />

        {/* Night sky */}
        <Stars radius={22} depth={10} count={isMobile ? 250 : 650} factor={2.4} saturation={0} fade speed={reduced ? 0 : 0.4} />

        <WaterSurface reducedMotion={reduced} segments={isMobile ? 48 : 96} />

        {/* Two players passing a water polo ball — the hero centrepiece. */}
        <WaterPoloPlay reducedMotion={reduced} />

        {/* A goal at the far end of the pool. */}
        <WaterPoloGoal position={[0, WATER_Y, -5.5]} width={3} height={0.95} emissiveIntensity={0.2} />

        {/* Atmosphere: drifting spray + fine glints over the water. */}
        <Particles count={isMobile ? 14 : 26} reducedMotion={reduced} />
        <Sparkles count={isMobile ? 14 : 30} scale={[12, 3, 6]} position={[1.5, 0.6, 0.5]} size={2} speed={reduced ? 0 : 0.3} opacity={0.45} color={palette.silver} />

        <CameraRig reducedMotion={reduced} />
        <AdaptiveDpr pixelated />

        {!isMobile && <PostFX />}
      </Suspense>
    </Canvas>
  )
}
