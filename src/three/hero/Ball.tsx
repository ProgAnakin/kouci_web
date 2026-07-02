import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Color texture modelled on a real FINA match ball (Mikasa-style): warm yellow
 * rubber split into vertical panels by four recessed seams, panels alternating
 * a subtle shade, dense pebbled grip grain, pole caps where the seams meet,
 * a faint equator join and a small brand print. 1024×512, equirectangular.
 */
function makeColorTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Panels: 8 vertical bands (4 seams × 2 hemispheres), alternating tone.
  const panel = w / 8
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#e3bc4e' : '#d8b143'
    ctx.fillRect(i * panel, 0, panel, h)
  }

  // Pebbled grip: dense random grain, darker and lighter speckles.
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 1 + Math.random() * 2.2
    const light = Math.random() > 0.5
    ctx.fillStyle = light ? 'rgba(255, 232, 150, 0.16)' : 'rgba(105, 82, 30, 0.18)'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Recessed seams: dark groove + light catch-edge on each side.
  for (const u of [0, 0.25, 0.5, 0.75]) {
    const x = u * w
    ctx.fillStyle = 'rgba(70, 56, 22, 0.85)'
    ctx.fillRect(x - 4, 0, 8, h)
    ctx.fillStyle = 'rgba(255, 235, 170, 0.25)'
    ctx.fillRect(x - 7, 0, 3, h)
    ctx.fillRect(x + 4, 0, 3, h)
  }
  // Equator join — much subtler than the meridians.
  ctx.fillStyle = 'rgba(96, 78, 34, 0.4)'
  ctx.fillRect(0, h / 2 - 2, w, 4)

  // Pole caps (texture poles pinch, so wide flat bands read as neat discs).
  ctx.fillStyle = '#c9a53c'
  ctx.fillRect(0, 0, w, 14)
  ctx.fillRect(0, h - 14, w, 14)
  ctx.fillStyle = 'rgba(70, 56, 22, 0.8)'
  ctx.fillRect(0, 14, w, 3)
  ctx.fillRect(0, h - 17, w, 3)

  // Brand print on one panel, like the maker's mark on a match ball.
  ctx.save()
  ctx.translate(w * 0.315, h * 0.4)
  ctx.font = '700 30px "Sora", "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(60, 48, 20, 0.75)'
  ctx.fillText('KOUCI', 0, 0)
  ctx.font = '600 15px "Inter", sans-serif'
  ctx.fillText('WATER POLO', 0, 24)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Bump texture: strong pebble grain everywhere + deep grooves at the seams.
 * Kept separate from the color map so the relief can be tuned independently.
 */
function makeBumpTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 1 + Math.random() * 2
    const up = Math.random() > 0.45
    ctx.fillStyle = up ? 'rgba(210, 210, 210, 0.5)' : 'rgba(70, 70, 70, 0.45)'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#1a1a1a'
  for (const u of [0, 0.25, 0.5, 0.75]) {
    ctx.fillRect(u * w - 4, 0, 8, h)
  }
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(0, h / 2 - 2, w, 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  return tex
}

interface BallProps {
  radius?: number
}

/**
 * A match-quality water polo ball: pebbled rubber with panel seams, pole caps
 * and a brand print, under a soft rubber-sheen material. Forwards a group ref
 * so the scene can float and spin it.
 */
export const Ball = forwardRef<THREE.Group, BallProps>(function Ball({ radius = 0.27 }, ref) {
  const colorTex = useMemo(makeColorTexture, [])
  const bumpTex = useMemo(makeBumpTexture, [])
  useEffect(
    () => () => {
      colorTex.dispose()
      bumpTex.dispose()
    },
    [colorTex, bumpTex],
  )

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 64, 48]} />
        <meshPhysicalMaterial
          map={colorTex}
          bumpMap={bumpTex}
          bumpScale={0.35}
          roughness={0.58}
          sheen={0.4}
          sheenRoughness={0.6}
          sheenColor={new THREE.Color('#f5df8a')}
          clearcoat={0.12}
          clearcoatRoughness={0.6}
          envMapIntensity={0.75}
        />
      </mesh>
    </group>
  )
})
