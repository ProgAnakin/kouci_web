import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { PenaltyMap } from './PenaltyMap'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'

/**
 * Penalty shot map scene: the goal mouth with scored vs. missed shots plotted
 * across it. Default-exported for React.lazy; mounted on scroll-in.
 */
export default function PenaltyCanvas() {
  const reduced = usePrefersReducedMotion()

  if (!isWebGLAvailable()) {
    return <div className="h-full w-full bg-surface" aria-hidden="true" />
  }

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.2], fov: 44, near: 0.1, far: 100 }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(palette.bg), 0)}
    >
      <Suspense fallback={<SceneLoader />}>
        <hemisphereLight args={[palette.brandLight, palette.bg, 0.8]} />
        <directionalLight position={[2, 3, 5]} intensity={1.1} color={palette.ink} />
        <PenaltyMap reducedMotion={reduced} />
      </Suspense>
    </Canvas>
  )
}
