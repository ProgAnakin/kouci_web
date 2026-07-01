import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { makeSpriteTexture } from './proceduralTextures'

/**
 * Procedural water polo ball texture: the classic FINA yellow, the dimpled
 * grip surface, and dark panel seams (an equator + meridians that map to great
 * circles on the sphere). Used as both color map and bump map.
 */
function makeBallTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base yellow.
  ctx.fillStyle = '#E8C24A'
  ctx.fillRect(0, 0, size, size)

  // Dimples — the grippy water polo texture.
  const gap = 18
  const r = 5
  ctx.fillStyle = 'rgba(150, 120, 35, 0.32)'
  for (let y = gap / 2; y < size; y += gap) {
    const off = ((Math.round(y / gap)) % 2) * (gap / 2)
    for (let x = gap / 2; x < size; x += gap) {
      ctx.beginPath()
      ctx.arc(x + off, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Panel seams: equator + two meridians (→ the recognizable cross of panels).
  ctx.strokeStyle = '#2C2E1C'
  ctx.lineWidth = 11
  ctx.beginPath()
  ctx.moveTo(0, size / 2)
  ctx.lineTo(size, size / 2)
  ctx.stroke()
  for (const x of [size * 0.25, size * 0.75]) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

interface PoloBallProps {
  radius?: number
}

/**
 * The water polo ball mesh, forwarding a group ref so the play controller can
 * position and spin it each frame.
 */
export const PoloBall = forwardRef<THREE.Group, PoloBallProps>(function PoloBall(
  { radius = 0.3 },
  ref,
) {
  const tex = useMemo(makeBallTexture, [])
  const glowTex = useMemo(makeSpriteTexture, [])
  useEffect(
    () => () => {
      tex.dispose()
      glowTex.dispose()
    },
    [tex, glowTex],
  )

  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial
          map={tex}
          bumpMap={tex}
          bumpScale={0.02}
          roughness={0.46}
          metalness={0.02}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          envMapIntensity={0.6}
        />
      </mesh>
      {/* Cheap additive halo — fakes a soft bloom without a post pass. */}
      <sprite scale={[radius * 4.2, radius * 4.2, 1]}>
        <spriteMaterial map={glowTex} color="#f3d873" opacity={0.38} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  )
})
