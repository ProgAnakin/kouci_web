# Assets

Drop real production assets here and wire them up where the TODOs point.

## What to add

| Asset | Suggested file | Used by | Notes |
| --- | --- | --- | --- |
| Logo / wordmark | ✅ done | `public/brand/` + `src/components/ui/Logo.tsx`, favicons in `public/` | Cut from the master KC logo. To swap: replace the files in `public/brand/` and re-run `node scripts/gen-og.mjs`. |
| Water polo ball | `ball.glb` | `src/three/WaterPoloBall.tsx` | Export from Blender as **GLB + Draco**. Load with drei's `useGLTF` (wrap in `<Suspense>`). |
| Tactics field model | `field.glb` | `src/three/TacticsField.tsx` | Optional — the field is currently procedural. |
| Social share image | ✅ done | `public/og-image.jpg`, rendered from `scripts/og-template.html` | Edit the template, then `node scripts/gen-og.mjs`. |

## Texture guidance

- Prefer **WebP** for UI imagery and **KTX2 / Basis Universal** for 3D textures.
- Compress meshes with **Draco** (`gltf-transform optimize input.glb output.glb --draco`).
- Keep individual textures ≤ 1024² unless you genuinely need more.

## Loading a GLB with Draco (reference)

```tsx
import { useGLTF } from '@react-three/drei'
useGLTF.preload('/assets/ball.glb')

function Ball() {
  const { scene } = useGLTF('/assets/ball.glb') // drei wires the Draco decoder
  return <primitive object={scene} />
}
```
