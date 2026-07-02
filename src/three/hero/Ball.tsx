import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { HERO_COLORS } from './constants'

/**
 * Water polo ball texture matching the reference render: muted yellow with a
 * dotted grip pattern and four dark meridian seams. Doubles as a bump map.
 */
function makeBallTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = HERO_COLORS.ballYellow
  ctx.fillRect(0, 0, w, h)

  // Dotted grip: offset rows of slightly darker dots.
  const gap = 26
  ctx.fillStyle = 'rgba(120, 98, 40, 0.4)'
  for (let y = gap / 2, row = 0; y < h; y += gap, row++) {
    const off = (row % 2) * (gap / 2)
    for (let x = gap / 2; x < w; x += gap) {
      ctx.beginPath()
      ctx.arc(x + off, y, 6.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Four meridian seams (u wraps → vertical bands).
  ctx.fillStyle = HERO_COLORS.ballSeam
  for (const u of [0, 0.25, 0.5, 0.75]) {
    ctx.fillRect(u * w - 6, 0, 12, h)
  }
  // Faint equator.
  ctx.fillStyle = 'rgba(46, 42, 28, 0.5)'
  ctx.fillRect(0, h / 2 - 4, w, 8)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

interface BallProps {
  radius?: number
}

/** The match ball; forwards a group ref so the scene can move and spin it. */
export const Ball = forwardRef<THREE.Group, BallProps>(function Ball({ radius = 0.26 }, ref) {
  const tex = useMemo(makeBallTexture, [])
  useEffect(() => () => tex.dispose(), [tex])

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 48, 40]} />
        <meshPhysicalMaterial
          map={tex}
          bumpMap={tex}
          bumpScale={0.012}
          roughness={0.52}
          clearcoat={0.18}
          clearcoatRoughness={0.5}
          envMapIntensity={0.7}
        />
      </mesh>
    </group>
  )
})
