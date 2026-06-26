import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { palette } from '../lib/theme'
import { waterVertexShader, waterFragmentShader } from './shaders/water'

/**
 * Custom water ShaderMaterial built with drei's `shaderMaterial` helper.
 * We instantiate it imperatively (`new WaterMaterial()`) and dispose it on
 * unmount rather than registering a JSX element — fewer moving parts and an
 * explicit lifecycle for the GPU resource.
 */
export const WaterMaterial = shaderMaterial(
  {
    uTime: 0,
    uWaveAmp: 1,
    uDeep: new THREE.Color(palette.bg),
    uBrand: new THREE.Color(palette.brand),
    uHighlight: new THREE.Color(palette.brandLight),
    uSilver: new THREE.Color(palette.silver),
    uLightDir: new THREE.Vector3(0.4, 0.9, 0.35),
    uOpacity: 1,
  },
  waterVertexShader,
  waterFragmentShader,
)

/**
 * drei's `shaderMaterial` doesn't surface the uniform keys on the instance
 * type, so we describe the ones we mutate at runtime here.
 */
export type WaterMaterialImpl = THREE.ShaderMaterial & {
  uTime: number
  uWaveAmp: number
  uOpacity: number
}
