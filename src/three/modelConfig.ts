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

export const PLAYER_MODELS: { a: PlayerModelDef | null; b: PlayerModelDef | null } = {
  a: null,
  b: null,
}
