import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { TacticsField } from './TacticsField'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

/**
 * Tactics board scene: a water polo field with instanced pins and animated
 * 3D arrows. Default-exported for React.lazy; only mounted once it scrolls
 * near the viewport (see Showcase).
 */
export default function TacticsCanvas({ active = true }: { active?: boolean }) {
  const reduced = usePrefersReducedMotion()
  const fallback = <div className="h-full w-full bg-surface" aria-hidden="true" />

  if (!isWebGLAvailable()) return fallback

  return (
    <ErrorBoundary label="TacticsCanvas" fallback={fallback}>
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 3.6, 6.4], fov: 40, near: 0.1, far: 100 }}
        frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(palette.bg), 0)}
      >
        <Suspense fallback={<SceneLoader />}>
          <hemisphereLight args={[palette.brandLight, palette.bg, 0.55]} />
          <directionalLight position={[3, 6, 4]} intensity={1.1} color={palette.ink} castShadow />
          <Environment resolution={48} frames={1}>
            <Lightformer
              intensity={1.8}
              position={[2, 5, 3]}
              scale={[6, 6, 1]}
              color={palette.brandLight}
            />
            <Lightformer
              intensity={0.8}
              position={[-4, 2, -2]}
              scale={[3, 3, 1]}
              color={palette.silver}
            />
          </Environment>
          <TacticsField reducedMotion={reduced} />
          <ContactShadows
            position={[0, -0.11, 0]}
            opacity={0.4}
            scale={12}
            blur={2.4}
            far={4}
            color="#000000"
            frames={reduced ? 1 : Infinity}
          />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  )
}
