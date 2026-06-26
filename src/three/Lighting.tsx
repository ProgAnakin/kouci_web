import { Environment, Lightformer } from '@react-three/drei'
import { palette } from '../lib/theme'

/**
 * Cinematic lighting rig for the hero pool: a baked-once Lightformer
 * environment (offline, no HDRI fetch) for soft reflections, a warm key, a
 * cool rim/back light to separate the players from the dark water, a low
 * bounce from the surface, and a soft fill over the action.
 */
export function Lighting() {
  return (
    <>
      <hemisphereLight args={[palette.brandLight, palette.bg, 0.4]} />

      {/* Key */}
      <directionalLight position={[5, 7, 4]} intensity={1.7} color="#fff1df" />
      {/* Rim / back — kicks the silhouettes */}
      <directionalLight position={[-4, 3, -6]} intensity={1.2} color={palette.brandLight} />
      {/* Bounce off the water */}
      <pointLight position={[3, 0.1, 2.6]} intensity={5} distance={9} decay={2} color={palette.brand} />
      {/* Warm fill over the players so the skin reads warm and the caps pop */}
      <pointLight position={[3, 2.6, 3]} intensity={24} distance={13} decay={2} color="#ffdcb0" />

      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.2} position={[0, 4, -3]} scale={[10, 10, 1]} color={palette.brandLight} />
        <Lightformer intensity={1.2} position={[-6, 3, 2]} scale={[4, 4, 1]} color={palette.silver} />
        <Lightformer intensity={0.8} position={[6, 1, 3]} scale={[4, 4, 1]} color={palette.brand} />
        <Lightformer form="ring" intensity={1.0} position={[3, 2, 5]} scale={2.5} color={palette.silver} />
      </Environment>
    </>
  )
}
