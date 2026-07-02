import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Water } from './hero/Water'
import { PassScene } from './hero/PassScene'
import { Goal } from './hero/Goal'
import { WATER_Y } from './hero/constants'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'

/**
 * Hero pool scene — two clay players passing a water polo ball across calm
 * night water, a floating goal in the distance, under a starry sky.
 * Default-exported for React.lazy.
 *
 * The cinematic look comes from ACES Filmic tone mapping, MSAA, a procedural
 * environment map (drei <Environment> with Lightformers — no network fetch)
 * feeding the glossy water/clay speculars, and a CSS vignette — no
 * post-processing pass, so the bundle stays light and the frame cheap.
 */
interface HeroCanvasProps {
  /** When false the canvas stops rendering (off-screen) to free the scroll. */
  active?: boolean
  /** Called once the renderer is created (used to fade the canvas in). */
  onReady?: () => void
}

export default function HeroCanvas({ active = true, onReady }: HeroCanvasProps) {
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
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0.2, 0.85, 6.5], fov: 50, near: 0.1, far: 100 }}
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(palette.bg), 1)
        scene.fog = new THREE.Fog(palette.bg, 13, 42)
        onReady?.()
      }}
    >
      <Suspense fallback={<SceneLoader />}>
        {/* Lights + the baked Lightformer environment the speculars reflect. */}
        <Lighting />

        {/* Night sky */}
        <Stars
          radius={22}
          depth={10}
          count={isMobile ? 220 : 550}
          factor={2.2}
          saturation={0}
          fade
          speed={reduced ? 0 : 0.35}
        />

        <Water reducedMotion={reduced} segments={isMobile ? 72 : 140} />

        {/* Distant floating goal, far right where it can't collide with the
            headline. Skipped on phones — too little width for it to read. */}
        {!isMobile && (
          <Goal position={[16, WATER_Y, -4]} rotationY={-0.5} width={2.8} height={0.9} />
        )}

        {/* The pass loop — the centrepiece. */}
        <PassScene reducedMotion={reduced} offsetX={isMobile ? -0.4 : 0} />

        <CameraRig reducedMotion={reduced} />
        <AdaptiveDpr pixelated />
      </Suspense>
    </Canvas>
  )
}
