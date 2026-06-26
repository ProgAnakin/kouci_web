import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scrollStore'

// Reused across frames to keep the render loop allocation-free.
const targetPos = new THREE.Vector3()
const lookTarget = new THREE.Vector3(0, 0.2, 0)

/**
 * Drives a slow, cinematic camera move synced to page scroll (via the global
 * scroll store that GSAP ScrollTrigger feeds) plus a subtle pointer parallax.
 * Renders nothing — it just animates the active camera each frame.
 */
export function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { camera } = useThree()

  useFrame((state, delta) => {
    const hero = scrollState.hero // 0 at top of hero → 1 as it scrolls away
    const time = state.clock.elapsedTime

    // Slow idle sway keeps the shot alive even before the user scrolls.
    const idleX = reducedMotion ? 0 : Math.sin(time * 0.25) * 0.22
    const idleY = reducedMotion ? 0 : Math.cos(time * 0.2) * 0.1
    const px = reducedMotion ? 0 : state.pointer.x * 0.5
    const py = reducedMotion ? 0 : state.pointer.y * 0.3

    // The camera also eases back and rises a touch as the hero scrolls past.
    targetPos.set(idleX + px, 1.55 + hero * 1.4 + idleY + py, 6.4 + hero * 2.2)

    // Frame-rate independent smoothing.
    const smooth = 1 - Math.pow(0.0015, delta)
    camera.position.lerp(targetPos, smooth)
    camera.lookAt(lookTarget)
  })

  return null
}
