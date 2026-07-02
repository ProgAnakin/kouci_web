import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { PenaltyMap } from './PenaltyMap'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

/**
 * Penalty shot map scene: the goal mouth with scored vs. missed shots plotted
 * across it. Default-exported for React.lazy; mounted on scroll-in.
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
        camera={{ position: [0, 0, 4.2], fov: 44, near: 0.1, far: 100 }}
        frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(palette.bg), 0)}
      >
        <Suspense fallback={<SceneLoader />}>
          <hemisphereLight args={[palette.brandLight, palette.bg, 0.65]} />
          <directionalLight position={[2, 3, 5]} intensity={1.1} color={palette.ink} />
          <Environment resolution={48} frames={1}>
            <Lightformer
              intensity={1.6}
              position={[0, 2, 5]}
              scale={[8, 5, 1]}
              color={palette.silver}
            />
            <Lightformer
              intensity={0.7}
              position={[-3, 1, 3]}
              scale={[3, 3, 1]}
              color={palette.brandLight}
            />
          </Environment>
          <PenaltyMap reducedMotion={reduced} />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  )
}
