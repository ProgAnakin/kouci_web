import { Environment, Lightformer } from '@react-three/drei'
import { palette } from '../lib/theme'

/**
 * Cinematic lighting rig for the hero pool, tuned to the reference render:
 * a soft cool "moon" key from high left-of-camera, a warm kicker from the
 * right, a low bounce off the water, and a baked-once Lightformer environment
 * (offline, no HDRI fetch) that gives the glossy water and clay speculars
 * something real to reflect.
 */
export function Lighting() {
  return (
    <>
      <hemisphereLight args={['#8b9678', palette.bg, 0.45]} />

      {/* Moon key — cool, high, slightly camera-left */}
      <directionalLight position={[-3, 8, 5]} intensity={1.5} color="#e8eedd" />
      {/* Warm kicker from camera-right, models the clay */}
      <directionalLight position={[6, 4, 3]} intensity={0.9} color="#ffe6bd" />
      {/* Rim / back — separates silhouettes from the dark water */}
      <directionalLight position={[-2, 2.5, -7]} intensity={1.6} color={palette.brandLight} />
      {/* Bounce off the water up into chins and arms — kept gentle so the PBR
          water doesn't draw a hot specular column under it. */}
      <pointLight
        position={[5, 0.5, 2]}
        intensity={2}
        distance={8}
        decay={2}
        color={palette.brand}
      />

      <Environment resolution={128} frames={1}>
        {/* Big soft sky card overhead */}
        <Lightformer
          intensity={1.9}
          position={[0, 6, -2]}
          rotation-x={Math.PI / 2}
          scale={[14, 14, 1]}
          color="#dbe2ca"
        />
        {/* Warm side card, camera-right */}
        <Lightformer intensity={1.1} position={[7, 2.5, 4]} scale={[4, 3, 1]} color="#f0dcb4" />
        {/* Dim olive horizon fill */}
        <Lightformer
          intensity={0.6}
          position={[-7, 1, 3]}
          scale={[6, 2.5, 1]}
          color={palette.brand}
        />
      </Environment>
    </>
  )
}
