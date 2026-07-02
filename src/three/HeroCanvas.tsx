import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Water } from './hero/Water'
import { BallScene, GOAL_WIDTH, GOAL_HEIGHT } from './hero/BallScene'
import { Goal } from './hero/Goal'
import { Players, type PlayerDef } from './hero/Players'
import { WATER_Y } from './hero/constants'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'

/**
 * Hero pool scene — two clay players passing the match ball on realistic night
 * water, with a floating goal behind them at true FINA proportions (the goal
 * mouth is ~13.6 ball diameters wide). Default-exported for React.lazy.
 *
 * The cinematic look comes from ACES Filmic tone mapping, MSAA, a procedural
 * environment map (drei <Environment> with Lightformers — no network fetch)
 * feeding the glossy water speculars, and a CSS vignette — no post-processing
 * pass, so the bundle stays light and the frame cheap.
 */

// The two busts flank the pass, right of the headline. Positive rotationY
// turns a model's front (+Z) toward +X (screen right); kept shallow so both
// faces read from the camera's low-left vantage.
function playerDefs(isMobile: boolean): { defs: PlayerDef[]; hands: { a: [number, number, number]; b: [number, number, number] } } {
  const shift = isMobile ? -0.7 : 0
  const ax = 3.3 + shift
  const bx = 5.9 + shift
  const az = 2.3
  const bz = 1.5
  return {
    defs: [
      { url: '/assets/players/player-4.glb', position: [ax, az], rotationY: -0.15, scale: 1.9, offsetY: 0.48, phase: 0 },
      { url: '/assets/players/player-4.glb', position: [bx, bz], rotationY: -0.65, scale: 1.9, offsetY: 0.48, phase: 1.4 },
    ],
    hands: {
      a: [ax + 0.52, 0.3, az - 0.18],
      b: [bx - 0.52, 0.27, bz + 0.15],
    },
  }
}
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
  const { defs, hands } = playerDefs(isMobile)

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

        {/* Floating goal behind the ball, at true scale relative to it —
            deep and right, so it never reaches the headline. */}
        <Goal
          position={[17.5, WATER_Y, -9]}
          rotationY={-0.45}
          width={GOAL_WIDTH}
          height={GOAL_HEIGHT}
        />

        {/* The two clay players and the ball arcing between their hands. */}
        <Players defs={defs} reducedMotion={reduced} />
        <BallScene
          position={isMobile ? [3.7, 2.2] : [4.5, 2.2]}
          pass={hands}
          reducedMotion={reduced}
        />

        <CameraRig reducedMotion={reduced} />
        <AdaptiveDpr pixelated />
      </Suspense>
    </Canvas>
  )
}
