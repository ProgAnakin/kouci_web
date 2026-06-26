# Kouci — Master Every Play

The public landing page for **Kouci**, a water polo tactical & statistical
analysis app for coaches and analysts. Dark, sporty, and built around an
interactive 3D water scene.

> Players · Penalty shot maps · Animated tactics · Live match stats.

## Stack

- **Vite + React + TypeScript**
- **Three.js** via **React Three Fiber** + **@react-three/drei**
- **GSAP** (with ScrollTrigger) for scroll → camera + reveal animations
- **Tailwind CSS** for all 2D UI

The 3D layer uses the standard WebGL renderer (WebGL 2 with automatic fallback
to WebGL 1). WebGPU is intentionally **not** assumed.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build locally
```

Node 18+ recommended.

## Project structure

```
src/
├─ App.tsx                 # page shell, skip link, scroll wiring
├─ index.css               # Tailwind layers + palette CSS variables
├─ lib/
│  ├─ theme.ts             # palette as TS values (for Three.js)
│  └─ scrollStore.ts       # GSAP ↔ R3F scroll bridge (no re-renders)
├─ hooks/
│  ├─ usePrefersReducedMotion.ts
│  ├─ usePageScroll.ts     # ScrollTrigger → scrollStore
│  └─ useInView.ts         # defer-mount heavy canvases
├─ data/
│  └─ features.ts          # the four product pillars (copy)
├─ components/
│  ├─ layout/              # Navbar, Footer
│  ├─ sections/            # Hero, Promise, Features, Showcase, Audience, EarlyAccess
│  └─ ui/                  # Button, Field, Reveal, SectionHeading
└─ three/                  # all the WebGL
   ├─ HeroCanvas.tsx       # pool: water + players + lane ropes + goal (lazy)
   ├─ WaterSurface.tsx     # shader water plane
   ├─ shaders/water.ts     # GLSL for the water (caustics, foam, fresnel)
   ├─ wave.ts              # JS mirror of the wave fn (floating objects)
   ├─ WaterPoloPlay.tsx    # two swimmers passing the ball (the hero scene)
   ├─ Swimmer.tsx          # capped, numbered player with reaching arms
   ├─ PoloBall.tsx         # recognizable water polo ball (seams + dimples)
   ├─ LaneRopes.tsx        # instanced lane-rope floats riding the swell
   ├─ WaterPoloGoal.tsx    # reusable floating goal (posts + net)
   ├─ Particles.tsx        # instanced atmospheric spray
   ├─ CausticGlow.tsx      # additive light pool under the ball
   ├─ CameraRig.tsx        # scroll-driven cinematic camera (maath damping)
   ├─ TacticsCanvas.tsx    # field + caps + animated 3D arrows (lazy)
   ├─ Cap.tsx              # numbered water polo cap marker
   ├─ PenaltyCanvas.tsx    # goal + plotted shots (lazy)
   ├─ PenaltyMap.tsx       # instanced scored/missed shots
   ├─ Arrow.tsx            # reusable self-drawing 3D arrow
   ├─ netTexture.ts        # shared procedural goal-net texture
   ├─ Hotspot.tsx          # accessible in-scene hotspot
   └─ Loader.tsx           # in-canvas + DOM loaders
```

## Theming / palette

The brand palette is defined in **three** mirrored places — keep them in sync:

| Token | Hex | Tailwind | CSS var |
| --- | --- | --- | --- |
| Background | `#131512` | `bg` | `--color-bg` |
| Surface | `#1F221B` | `surface` | `--color-surface` |
| Brand (olive) | `#7E8B63` | `brand` | `--color-brand` |
| Brand light | `#9FAC82` | `brand-light` | `--color-brand-light` |
| Silver | `#C5C9C0` | `silver` | `--color-silver` |
| Text | `#E6E8E2` | `ink` | `--color-ink` |

- Tailwind tokens: `tailwind.config.js`
- CSS variables: `src/index.css`
- TypeScript values (used in Three.js): `src/lib/theme.ts`

## Where to plug things in

- **Email capture** → `src/components/sections/EarlyAccess.tsx` has a clearly
  marked `TODO` in `handleSubmit`. Swap the simulated delay for a real request
  (Mailchimp / ConvertKit / Resend / your own API). Validation is already done.
- **Real assets** (logo, 3D ball, field, share image) → see
  [`public/assets/README.md`](./public/assets/README.md). Search the codebase
  for `TODO` to find every insertion point.
- **Social links** → placeholders in `src/components/layout/Footer.tsx`.

## Performance notes

- Heavy 3D scenes are **code-split** (`React.lazy`) and the two showcase
  canvases only mount once they scroll near the viewport (`useInView`).
- Repeated 3D elements (pins, shot markers) use **instancing** — one draw call
  each.
- The water is a single shader-displaced plane; mobile drops the subdivision
  count and the device pixel ratio is capped.
- The custom water material and generated net texture are **explicitly
  disposed** on unmount.

## Accessibility

- A parallel, screen-reader-only description accompanies each 3D scene, and
  decorative canvases are hidden from assistive tech.
- `aria-label` / `role="img"` on interactive canvas regions; hotspots are
  keyboard-focusable.
- `prefers-reduced-motion` freezes the water, camera, arrows and DOM reveals.
- Skip link, semantic landmarks, on-brand focus rings, and a fully validated,
  keyboard-operable signup form.

## Deploy

Static output — deploy `dist/` anywhere. For **Vercel** or **Netlify**, the
defaults work out of the box:

- Build command: `npm run build`
- Output directory: `dist`
