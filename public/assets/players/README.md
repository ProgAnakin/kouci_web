# Player models (drop-in)

The hero uses **procedural placeholder players** until you drop real models here.
The loading pipeline (Draco decompression, animation playback, head tracking,
mouse/scroll interaction) is already wired — you only provide the `.glb`.

## How to get the models

1. **Adobe Firefly** → generate a clean A-pose, front-facing reference image of
   the character (white background, symmetrical). One for cap **#4** (dark
   olive), one for **#7** (lighter olive).
2. **Image-to-3D** (Meshy / Tripo / Hunyuan3D / TRELLIS) → turn each image into a
   mesh with PBR textures.
3. **Mixamo** → auto-rig the humanoid + add a looping clip (e.g. *Treading
   Water* / *Idle*). Export **FBX**.
4. Convert FBX → **GLB** (e.g. Blender export, or `fbx2gltf`). Optionally
   compress: `npx gltf-transform optimize in.glb player-4.glb --texture-compress webp`
   (or KTX2). Target **< 4–5 MB** each.

## Install

1. Put the files here, e.g. `player-4.glb` and `player-7.glb`.
2. Fill in `src/three/modelConfig.ts`:

```ts
export const PLAYER_MODELS = {
  a: { url: '/assets/players/player-4.glb', scale: 1, headBone: 'Head', idleClip: 'Idle' },
  b: { url: '/assets/players/player-7.glb', scale: 1, headBone: 'Head', idleClip: 'Idle' },
}
```

- `scale` — tune so the head ≈ the rest of the scene (camera/water).
- `rotationY` — rotate if the model faces the wrong way.
- `headBone` — the head bone name (from Mixamo it's usually `mixamorigHead` or
  `Head`); enables look-at toward the ball + cursor. Omit if not rigged.
- `idleClip` — the clip to loop; defaults to the model's first clip.

That's it — the model replaces the placeholder automatically. If a file is
missing or invalid, it falls back to the procedural player (no crash).

## Specs that integrate cleanly

- glTF 2.0 **binary (.glb)**, **Y-up**, real-ish scale (head ≈ 0.33 units or set
  `scale`).
- **PBR** textures embedded (baseColor / normal / roughness / AO; + a thickness
  map if you want faux subsurface skin).
- Rigged + 1 looping clip ideal. ≤ ~80k triangles, textures ≤ 2K.
- Draco mesh compression is supported out of the box.
