import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WaterMaterial, type WaterMaterialImpl } from './waterMaterial'

interface WaterSurfaceProps {
  reducedMotion?: boolean
  /** Plane subdivisions per side. Lower this on mobile for performance. */
  segments?: number
}

/**
 * The animated water plane that fills the hero. A single draw call; the wave
 * motion lives entirely in the vertex shader.
 */
export function WaterSurface({ reducedMotion = false, segments = 96 }: WaterSurfaceProps) {
  const material = useMemo<WaterMaterialImpl>(() => {
    const mat = new WaterMaterial() as unknown as WaterMaterialImpl
    mat.side = THREE.DoubleSide
    return mat
  }, [])

  // Explicitly free the GPU program/uniforms when this component unmounts.
  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    // When reduced motion is requested we simply never advance time, leaving
    // a calm, static ripple.
    if (!reducedMotion) material.uTime += delta * 0.6
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.6}>
      <planeGeometry args={[40, 40, segments, segments]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
