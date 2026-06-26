/**
 * Shared art-direction constants for the water polo players. A warm skin tone
 * with a subtle sheen, and the two team cap colors (dark vs. light olive).
 */
export const SKIN = '#C98A63'

/** Spread onto a <meshPhysicalMaterial> for skin (soft, slightly wet). */
export const SKIN_PROPS = {
  roughness: 0.42,
  clearcoat: 0.35,
  clearcoatRoughness: 0.3,
  sheen: 0.6,
  sheenColor: '#ffd6a8',
  sheenRoughness: 0.55,
  metalness: 0,
} as const

export const CAP_DARK = '#54633E'
export const CAP_LIGHT = '#A8B488'

/** Spread onto a <meshPhysicalMaterial> for the rubber cap. */
export const CAP_PROPS = {
  roughness: 0.55,
  clearcoat: 0.3,
  clearcoatRoughness: 0.45,
  metalness: 0,
} as const
