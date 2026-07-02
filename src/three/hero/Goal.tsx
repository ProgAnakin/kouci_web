import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { HERO_COLORS } from './constants'

/** Fine net texture: a light grid on transparent, drawn once to a canvas. */
function makeNet(cols: number, rows: number): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(238, 240, 232, 0.85)'
  ctx.lineWidth = 1.6
  const cw = size / cols
  const rh = size / rows
  ctx.beginPath()
  for (let i = 0; i <= cols; i++) {
    ctx.moveTo(i * cw, 0)
    ctx.lineTo(i * cw, size)
  }
  for (let j = 0; j <= rows; j++) {
    ctx.moveTo(0, j * rh)
    ctx.lineTo(size, j * rh)
  }
  ctx.stroke()
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

interface GoalProps {
  position?: [number, number, number]
  rotationY?: number
  width?: number
  height?: number
}

/**
 * A floating water polo goal: white posts + crossbar on pontoon floats, with a
 * fine net (back panel + sloped roof). Sized to FINA-ish 3:0.9 proportions and
 * meant to sit small in the background, half-lost in the night, as in the
 * reference render.
 */
export function Goal({ position = [0, 0, 0], rotationY = 0, width = 3, height = 0.9 }: GoalProps) {
  const net = useMemo(() => makeNet(Math.round(width * 9), Math.round(height * 9)), [width, height])
  const frameMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: HERO_COLORS.goalWhite,
        roughness: 0.32,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        envMapIntensity: 0.7,
      }),
    [],
  )
  const netMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: net,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        roughness: 0.9,
        color: HERO_COLORS.goalWhite,
      }),
    [net],
  )

  useEffect(
    () => () => {
      net.dispose()
      frameMat.dispose()
      netMat.dispose()
    },
    [net, frameMat, netMat],
  )

  // Post radius follows the goal's size (FINA: ~8 cm posts on a 3 m mouth).
  const r = width * 0.014
  const half = width / 2
  const depth = width * 0.25
  const floatR = r * 2.1

  return (
    <group position={position} rotation-y={rotationY}>
      {/* Posts + crossbar */}
      {[-half, half].map((x) => (
        <mesh key={x} position={[x, height / 2, 0]} material={frameMat}>
          <cylinderGeometry args={[r, r, height, 14]} />
        </mesh>
      ))}
      <mesh position={[0, height, 0]} rotation-z={Math.PI / 2} material={frameMat}>
        <cylinderGeometry args={[r, r, width + r * 2, 14]} />
      </mesh>

      {/* Net: back panel + sloped roof */}
      <mesh position={[0, height / 2, -depth]} material={netMat}>
        <planeGeometry args={[width, height]} />
      </mesh>
      <mesh position={[0, height - 0.01, -depth / 2]} rotation-x={Math.PI / 2.55} material={netMat}>
        <planeGeometry args={[width, depth * 1.1]} />
      </mesh>

      {/* Pontoon floats at the waterline */}
      <mesh position={[0, 0.02, 0.02]} rotation-z={Math.PI / 2} material={frameMat}>
        <cylinderGeometry args={[floatR, floatR, width + floatR * 2, 14]} />
      </mesh>
      {[-half, half].map((x) => (
        <mesh key={`f${x}`} position={[x, 0.02, -depth / 2]} rotation-x={Math.PI / 2} material={frameMat}>
          <cylinderGeometry args={[floatR, floatR, depth, 14]} />
        </mesh>
      ))}
    </group>
  )
}
