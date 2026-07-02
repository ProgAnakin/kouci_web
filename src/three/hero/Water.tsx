import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WATER_Y, HERO_COLORS } from './constants'

// Three gentle directional sine waves: one long swell + two ripples.
// (dirX, dirY, frequency, amplitude, speed) — in the plane's local XY space.
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
 * The hero pool: a single large plane displaced by a few directional sine
 * waves in the vertex shader (with analytic normals, so the glossy
 * MeshPhysicalMaterial + environment reflections stay correct). Reads as calm,
 * oily night water — the look of the reference render — for one draw call.
 */
export function Water({
  reducedMotion = false,
  segments = 128,
}: {
  reducedMotion?: boolean
  segments?: number
}) {
  const uTime = useRef({ value: 0 })

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: HERO_COLORS.waterDeep,
      roughness: 0.17,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      envMapIntensity: 0.9,
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
            // Plane is XY with +Z up (rotated flat in the scene).
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
    }
    return mat
  }, [])

  useEffect(() => () => material.dispose(), [material])

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
