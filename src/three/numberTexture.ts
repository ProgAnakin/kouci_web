import * as THREE from 'three'

/**
 * Draws a cap number on a transparent canvas → texture. Shared by the tactics
 * caps and the hero swimmers so a player's number reads the same everywhere.
 */
export function makeNumberTexture(n: number, color = '#131512'): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = color
  ctx.font = 'bold 42px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(n), size / 2, size / 2 + 3)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}
