# Contributing to Kouci Web

Thanks for helping improve the Kouci landing site.

## Setup

```bash
npm install      # also installs the Husky pre-commit hook
npm run dev      # dev server (http://localhost:5173)
```

Node 18+ recommended.

## Scripts

| Script                            | What it does                                                             |
| --------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                     | Vite dev server                                                          |
| `npm run build`                   | Generate the sitemap, type-check, and static-generate the site (`dist/`) |
| `npm run preview`                 | Preview the production build                                             |
| `npm run lint` / `lint:fix`       | ESLint                                                                   |
| `npm run format` / `format:check` | Prettier                                                                 |
| `npm run check`                   | Type-check + lint + format check (what CI runs)                          |

## Before you open a PR

- Run `npm run check` and `npm run build` — both must pass. A Husky pre-commit
  hook runs lint-staged (ESLint + Prettier) on staged files, and CI runs the
  same checks.
- Keep the brand palette in sync across its three homes (`tailwind.config.js`,
  `src/index.css`, `src/lib/theme.ts`).
- Respect `prefers-reduced-motion` in any animation or 3D change.
- Include before/after screenshots for visual changes.

## Conventions

- **TypeScript** everywhere; no `any`.
- **2D UI** is Tailwind; **3D** lives under `src/three/`.
- Heavy canvases are code-split (`React.lazy`) and deferred to browser-idle —
  don't import them eagerly into the initial bundle.
- **Blog posts** are Markdown files in `src/content/blog/` with frontmatter;
  add a file and deploy to publish (see `public/assets/blog/README.md`).

## Commit messages

Short imperative subject (e.g. "Wrap the WebGL canvases in an ErrorBoundary"),
with a body explaining the _why_ when it isn't obvious.
