/**
 * Drop-in slot for real player models.
 *
 * The hero currently shows a floating ball + goal (no players), so both entries
 * are `null`. To bring players back, drop a `.glb` in `public/assets/players/`
 * and fill in a def below — the loader (ModelPlayer) handles rigged models
 * (head look-at) and static busts (whole-model bob/sway) alike.
 */
export interface PlayerModelDef {
  /** Path under /public, e.g. '/assets/players/player-4.glb'. */
  url: string
  /** Uniform scale to match the scene (≈ head 0.33 radius). */
  scale?: number
  /** Y rotation (radians) to face the model the right way. */
  rotationY?: number
  /** Vertical offset (world units) to lift a bust so the head clears the water. */
  offsetY?: number
  /** Name of the head bone/object to drive look-at (optional). */
  headBone?: string
  /** Animation clip name to loop (defaults to the model's first clip). */
  idleClip?: string
}

// Both players use the player-4 bust until the player-7 model lands; they are
// rotated to face each other across the pass (the bust faces +z at rotY 0).
const player4: PlayerModelDef = {
  url: '/assets/players/player-4.glb',
  scale: 1.5,
  // Lift the bust so head + shoulders ride above the waterline (the model is
  // centred on its origin, spanning ±0.75 at this scale).
  offsetY: 0.5,
}

export const PLAYER_MODELS: { a: PlayerModelDef | null; b: PlayerModelDef | null } = {
  a: { ...player4, rotationY: 0.35 },
  b: { ...player4, rotationY: -0.7 },
}
