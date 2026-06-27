/**
 * Drop-in slot for the real player models.
 *
 * Pipeline: Adobe Firefly (reference image) → image-to-3D (Meshy/Tripo/…) →
 * Mixamo (auto-rig + animation) → export `.glb` → place it in
 * `public/assets/players/` and fill in the config below. While these stay
 * `null`, the hero uses the procedural placeholder players, so the site keeps
 * working until the real assets land.
 *
 * Tip: export one model per player (so the cap number/colour is baked in) — a
 * "4" (dark olive cap) and a "7" (lighter olive cap).
 */
export interface PlayerModelDef {
  /** Path under /public, e.g. '/assets/players/player-4.glb'. */
  url: string
  /** Uniform scale to match the scene (≈ head 0.33 radius). */
  scale?: number
  /** Y rotation (radians) to face the model the right way. */
  rotationY?: number
  /** Name of the head bone/object to drive look-at (optional). */
  headBone?: string
  /** Animation clip name to loop (defaults to the model's first clip). */
  idleClip?: string
}

export const PLAYER_MODELS: { a: PlayerModelDef | null; b: PlayerModelDef | null } = {
  // a: { url: '/assets/players/player-4.glb', scale: 1, headBone: 'Head', idleClip: 'Idle' },
  a: null,
  b: null,
}
