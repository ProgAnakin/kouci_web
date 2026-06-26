import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { TacticsField } from './TacticsField'
import { SceneLoader } from './Loader'
import { palette } from '../lib/theme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './webgl'

/**
 * Tactics board scene: a water polo field with instanced pins and animated
 * 3D arrows. Default-exported for React.lazy; only mounted once it scrolls
 * near the viewport (see Showcase).
 */
export default function TacticsCanvas() {
  const reduced = usePrefersReducedMotion()

  if (!isWebGLAvailable()) {
    return <div className="h-full w-full bg-surface" aria-hidden="true" />
  }

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 3.6, 6.4], fov: 40, near: 0.1, far: 100 }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(palette.bg), 0)}
    >
      <Suspense fallback={<SceneLoader />}>
        <hemisphereLight args={[palette.brandLight, palette.bg, 0.7]} />
        <directionalLight position={[3, 6, 4]} intensity={1.2} color={palette.ink} castShadow />
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
  )
}
