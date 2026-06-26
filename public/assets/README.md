# Assets

Drop real production assets here and wire them up where the TODOs point.

## What to add

| Asset | Suggested file | Used by | Notes |
| --- | --- | --- | --- |
| Logo / wordmark | `logo.svg` | `src/components/layout/Navbar.tsx`, `Footer.tsx`, `public/favicon.svg` | Replace the placeholder "K" badge. |
| Water polo ball | `ball.glb` | `src/three/WaterPoloBall.tsx` | Export from Blender as **GLB + Draco**. Load with drei's `useGLTF` (wrap in `<Suspense>`). |
| Tactics field model | `field.glb` | `src/three/TacticsField.tsx` | Optional — the field is currently procedural. |
| Social share image | `og.jpg` (1200×630) | `index.html` (`og:image`) | For link previews. |

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
