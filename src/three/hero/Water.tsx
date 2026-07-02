import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WATER_Y, HERO_COLORS } from './constants'

// Large-scale swell: gentle directional sine waves displaced in the vertex
// shader. (dirX, dirY, frequency, amplitude, speed) in the plane's local XY.
const WAVES = [
  [1.0, 0.35, 0.45, 0.07, 0.5],
  [-0.55, 1.0, 1.15, 0.028, 0.8],
  [0.8, -0.7, 2.4, 0.011, 1.25],
] as const

const WAVE_GLSL = WAVES.map(
  ([dx, dy, f, a, s], i) => `
  {
    float ph${i} = dot(pos.xy, vec2(${dx.toFixed(3)}, ${dy.toFixed(3)})) * ${f.toFixed(3)} + uTime * ${s.toFixed(3)};
    h += ${a.toFixed(4)} * sin(ph${i});
    float c${i} = ${a.toFixed(4)} * cos(ph${i}) * ${f.toFixed(3)};
    dhdx += c${i} * ${dx.toFixed(3)};
    dhdy += c${i} * ${dy.toFixed(3)};
  }`,
).join('\n')

/**
 * Procedural water normal map: layered value-noise blobs converted to normals
 * with a Sobel pass. Tiles (RepeatWrapping) and is sampled twice at different
 * scales/directions in the fragment shader for capillary detail.
 */
function makeWaterNormalMap(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Height field: soft random blobs, drawn wrapped so the tile is seamless.
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 6 + Math.random() * 26
    const a = 0.028 + Math.random() * 0.05
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    // Draw at all 9 wrapped positions so edges tile.
    for (const ox of [-size, 0, size])
      for (const oy of [-size, 0, size]) {
        ctx.save()
        ctx.translate(x + ox, y + oy)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
  }
  ctx.globalCompositeOperation = 'source-over'

  // Sobel: height → tangent-space normal.
  const img = ctx.getImageData(0, 0, size, size)
  const out = ctx.createImageData(size, size)
  const hAt = (x: number, y: number) =>
    img.data[(((y + size) % size) * size + ((x + size) % size)) * 4]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (hAt(x + 1, y) - hAt(x - 1, y)) / 255
      const dy = (hAt(x, y + 1) - hAt(x, y - 1)) / 255
      const i = (y * size + x) * 4
      out.data[i] = (0.5 - dx * 1.6) * 255
      out.data[i + 1] = (0.5 - dy * 1.6) * 255
      out.data[i + 2] = 255
      out.data[i + 3] = 255
    }
  }
  ctx.putImageData(out, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

/**
 * The hero pool, tuned for realism on a budget of one draw call:
 * - large swell displaced in the vertex shader with analytic normals,
 * - two counter-scrolling samples of a procedural normal map layered on top
 *   (capillary ripples that break the reflections up),
 * - a glossy MeshPhysicalMaterial reflecting the baked Lightformer sky.
 */
export function Water({
  reducedMotion = false,
  segments = 128,
}: {
  reducedMotion?: boolean
  segments?: number
}) {
  const uTime = useRef({ value: 0 })
  const normalMap = useMemo(makeWaterNormalMap, [])

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: HERO_COLORS.waterDeep,
      roughness: 0.11,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.0,
      normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
    })
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uTime.current
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          void kouciWave(in vec3 pos, out float h, out float dhdx, out float dhdy) {
            h = 0.0; dhdx = 0.0; dhdy = 0.0;
            ${WAVE_GLSL}
          }`,
        )
        .replace(
          '#include <beginnormal_vertex>',
          `#include <beginnormal_vertex>
          {
            float h, dhdx, dhdy;
            vec3 pos = position;
            kouciWave(pos, h, dhdx, dhdy);
            objectNormal = normalize(vec3(-dhdx, -dhdy, 1.0));
          }`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          {
            float h, dhdx, dhdy;
            vec3 pos = position;
            kouciWave(pos, h, dhdx, dhdy);
            transformed.z += h;
          }`,
        )
      // Capillary detail: blend two scrolling samples of the normal map over
      // the swell normal — fine ripples that make the speculars sparkle.
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;`,
        )
        .replace(
          '#include <normal_fragment_maps>',
          `{
            vec2 uvA = vNormalMapUv * 55.0 + vec2(uTime * 0.014, uTime * 0.010);
            vec2 uvB = vNormalMapUv * 122.0 + vec2(-uTime * 0.019, uTime * 0.015);
            vec3 n1 = texture2D( normalMap, uvA ).xyz * 2.0 - 1.0;
            vec3 n2 = texture2D( normalMap, uvB ).xyz * 2.0 - 1.0;
            vec3 mapN = normalize( vec3( n1.xy + n2.xy * 0.65, n1.z ) );
            mapN.xy *= normalScale;
            normal = normalize( tbn * mapN );
          }`,
        )
    }
    return mat
  }, [normalMap])

  useEffect(
    () => () => {
      material.dispose()
      normalMap.dispose()
    },
    [material, normalMap],
  )

  useFrame((state) => {
    if (!reducedMotion) uTime.current.value = state.clock.elapsedTime
  })

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[2.5, WATER_Y, -6]}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[80, 50, segments, Math.round(segments * 0.7)]} />
    </mesh>
  )
}
