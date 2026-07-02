# Kouci — Master Every Play

The public landing page for **Kouci**, a water polo tactical & statistical
analysis app for coaches and analysts. Dark, sporty, and built around an
interactive 3D water scene.

> Players · Penalty shot maps · Animated tactics · Live match stats.

## Stack

- **Vite + React + TypeScript**
- **Three.js** via **React Three Fiber** + **@react-three/drei**
- **GSAP** (with ScrollTrigger) + **Lenis** smooth scroll; **maath** easing for camera damping
- **Tailwind CSS** for all 2D UI

The hero's cinematic grade is done **without a post-processing library** (to keep
the bundle light and hold 60fps): the renderer's ACES Filmic tone mapping grades
the frame, MSAA handles edges, the ball carries a cheap additive glow sprite
(faux bloom), and a CSS radial gradient supplies the vignette.

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
   ├─ HeroCanvas.tsx       # pool scene: sky + lighting + pass loop (lazy)
   ├─ Lighting.tsx         # cinematic rig (Lightformer env + key/rim/bounce)
   ├─ hero/                # the hero scene, built from scratch
   │  ├─ constants.ts      # water level + scene palette
   │  ├─ choreography.ts   # the pass timeline (beats, poses, flight path)
   │  ├─ armRig.ts         # smooth skinned two-bone arm (IK-driven)
   │  ├─ ClayPlayer.tsx    # stylized clay player (torso, cap, skinned arms)
   │  ├─ PassScene.tsx     # two players passing the ball in a loop
   │  ├─ Water.tsx         # PBR water (vertex waves + analytic normals)
   │  ├─ Ball.tsx          # dotted water polo ball (canvas texture)
   │  ├─ Goal.tsx          # floating goal (posts, net, pontoons)
   │  └─ effects.tsx       # ripples + droplet spray
   ├─ CameraRig.tsx        # low cinematic camera (maath damping + ball follow)
   ├─ heroState.ts         # ball position hand-off (play → camera)
   ├─ numberTexture.ts     # shared cap-number texture
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

- Heavy 3D scenes are **code-split** (`React.lazy`). `useCanvasActivation`
  defers each canvas's mount to **browser-idle** (it never competes with first
  paint) and **pauses its render loop when scrolled off-screen**
  (`frameloop="never"`), so idle canvases don't fight the scroll.
- The hero shows a **static poster instantly** and crossfades the 3D in once
  the renderer is ready.
- **No post-processing library** — the cinematic grade is renderer ACES + MSAA
  + a faux-bloom sprite + a CSS vignette (keeps the bundle light and runtime
  cheap; see HeroCanvas).
- Smooth scroll (Lenis) uses a light frame-based `lerp` and leaves touch
  devices on native scrolling.
- Repeated 3D elements (pins, shot markers, droplets, spray) use **instancing**
  — one draw call each.
- The water is a single shader-displaced plane; mobile drops the subdivision
  count and the device pixel ratio is capped (`AdaptiveDpr`).
- Custom materials and generated textures are **explicitly disposed** on
  unmount.

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
