/**
 * Single source of truth for the Kouci palette in TypeScript land.
 * The same values live as CSS variables (src/index.css) and Tailwind
 * tokens (tailwind.config.js). Use these in Three.js / canvas code where
 * we need real color values rather than CSS classes.
 */
export const palette = {
  bg: '#131512',
  surface: '#1F221B',
  brand: '#7E8B63',
  brandLight: '#9FAC82',
  silver: '#C5C9C0',
  ink: '#E6E8E2',
} as const

export type PaletteKey = keyof typeof palette

/** Convenience array used to color repeated 3D elements (pins, points). */
export const pinColors = [palette.brandLight, palette.silver, palette.brand, palette.ink] as const
