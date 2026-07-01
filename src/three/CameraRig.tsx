import { useFrame, useThree } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import * as THREE from 'three'
import { scrollState } from '../lib/scrollStore'
import { heroState } from './heroState'

const _look = new THREE.Vector3()
// Aimed right, so the ball + goal sit in the right of the frame, clear of the
// headline on the left.
const baseLook = new THREE.Vector3(3.9, 0.5, 0.2)

/**
 * Low, cinematic camera. Eases its position with maath damping (idle sway +
 * pointer parallax + a slow pull-back on scroll) and lets its aim gently follow
 * the ball, so the shot is never fully static. Renders nothing.
 */
export function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { camera } = useThree()

  useFrame((state, delta) => {
    const hero = scrollState.hero
    const time = state.clock.elapsedTime

    const idleX = reducedMotion ? 0 : Math.sin(time * 0.22) * 0.18
    const idleY = reducedMotion ? 0 : Math.cos(time * 0.18) * 0.08
    const px = reducedMotion ? 0 : state.pointer.x * 0.55
    const py = reducedMotion ? 0 : state.pointer.y * 0.3

    damp3(
      camera.position,
      [0.2 + idleX + px, 0.85 + hero * 1.3 + idleY + py, 6.5 + hero * 2.0],
      0.45,
      delta,
    )

    // Aim mostly at a fixed point; a gentle drift toward the ball keeps it alive
    // without sweeping the players across the headline.
    if (reducedMotion) {
      _look.copy(baseLook)
    } else {
      _look.copy(baseLook).lerp(heroState.ball, 0.06)
    }
    camera.lookAt(_look)
  })

  return null
}
