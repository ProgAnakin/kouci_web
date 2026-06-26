import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function makeRadialTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(159, 172, 130, 0.85)')
  g.addColorStop(0.45, 'rgba(159, 172, 130, 0.28)')
  g.addColorStop(1, 'rgba(159, 172, 130, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * A soft additive disc on the water surface beneath the ball — the light
 * pooling you'd see under a floating object. Pulses gently with the swell.
 */
export function CausticGlow({
  position,
  reducedMotion = false,
}: {
  position: [number, number, number]
  reducedMotion?: boolean
}) {
  const texture = useMemo(makeRadialTexture, [])
  const ref = useRef<THREE.Mesh>(null)

  useEffect(() => () => texture.dispose(), [texture])

  useFrame((state) => {
    if (reducedMotion || !ref.current) return
    const pulse = Math.sin(state.clock.elapsedTime * 1.2)
    const s = 1.7 + pulse * 0.14
    ref.current.scale.set(s, s, 1)
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + pulse * 0.12
  })

  return (
    <mesh ref={ref} position={position} rotation-x={-Math.PI / 2} scale={[1.7, 1.7, 1]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
