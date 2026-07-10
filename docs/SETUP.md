# Kouci Web — Developer Setup

Quickstart for anyone editing the site by hand. Ten minutes from clone to
running locally.

## 1 · Prerequisites

- **Node.js 20+** (check with `node -v`)
- **Git**

## 2 · Run it locally

```bash
git clone https://github.com/ProgAnakin/kouci_web.git
cd kouci_web
npm install

# Environment: ask for the team .env file (do NOT invent values),
# drop it in the project root, or copy the template and fill it in:
cp .env.example .env

npm run dev        # → http://localhost:5173
```

`.env` is **gitignored on purpose — never commit it.** Only `.env.example`
(with placeholder values) lives in the repo.

## 3 · Scripts

| Command             | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                                 |
| `npm run build`     | Full production build (sitemap/llms.txt → typecheck → SSG) |
| `npm run preview`   | Serve the production build locally                         |
| `npm run lint`      | ESLint                                                     |
| `npm run format`    | Prettier (write)                                           |
| `npm run typecheck` | TypeScript only                                            |

A pre-commit hook (Husky + lint-staged) auto-formats and lints whatever you
commit — if a commit is rejected, read its output. CI runs lint, format-check
and build on every push.

## 4 · Where to edit what

| You want to change…                  | Edit this                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Hero headline / subline / CTAs       | `src/components/sections/Hero.tsx`                                                                               |
| Feature cards (titles, bullets)      | `src/data/features.ts`                                                                                           |
| Audience cards                       | `src/components/sections/Audience.tsx`                                                                           |
| FAQ questions & answers              | `src/components/sections/Faq.tsx` (`FAQ_ITEMS`)                                                                  |
| Early-access / demo form copy        | `src/components/sections/EarlyAccess.tsx`                                                                        |
| Blog posts                           | `src/content/blog/*.md` (see below)                                                                              |
| Blog images                          | `public/assets/blog/` (see its README)                                                                           |
| Brand colors                         | `tailwind.config.js` + `src/index.css` + `src/lib/theme.ts` — keep all three in sync                             |
| Legal identity (privacy/terms)       | `src/lib/site.ts` → `LEGAL_ENTITY`, `CONTACT_EMAIL`                                                              |
| Canonical domain                     | `VITE_SITE_URL` in `.env` / Vercel env                                                                           |
| Social links                         | `src/lib/site.ts` (`SOCIAL_LINKS`) + `src/components/layout/Footer.tsx`                                          |
| Logo / favicon / share card          | `public/brand/` + `public/favicon*`; share card: edit `scripts/og-template.html`, then `node scripts/gen-og.mjs` |
| License price & what's included      | `src/lib/commerce.ts` (billing branch only)                                                                      |
| 3D scenes (hero / tactics / penalty) | `src/three/` — ask before touching; they're tuned                                                                |

**New blog post:** copy an existing file in `src/content/blog/`, rename it
(the filename becomes the URL slug), edit the frontmatter (`title`, `date`,
`excerpt`, `tags`, optional `cover`) and write Markdown below it. Commit +
push → it's live, in the sitemap and in llms.txt automatically.

## 5 · Branches

| Branch                    | What it is                                                                     |
| ------------------------- | ------------------------------------------------------------------------------ |
| `main`                    | The pre-launch site (early-access, no public pricing)                          |
| `feat/versao-faturamento` | The billing version: Stripe checkout, public pricing, sales-remastered landing |

Work on a branch, push, and Vercel builds a preview URL for it automatically.
Don't push straight to `main` — open a PR (CI must pass).

## 6 · Environment variables

| Variable                  | Used by                | Notes                                                                |
| ------------------------- | ---------------------- | -------------------------------------------------------------------- |
| `VITE_FORMSPREE_ENDPOINT` | Early-access/demo form | Public (bundled into the client)                                     |
| `VITE_SITE_URL`           | SEO/canonicals/sitemap | Set to the custom domain when it exists                              |
| `STRIPE_SECRET_KEY`       | `api/checkout.ts`      | **Secret.** Billing branch only. Never in git, never in a screenshot |
| `STRIPE_PRICE_ID`         | `api/checkout.ts`      | The Stripe Price for the club license                                |
| `STRIPE_AMOUNT_EUR`       | `api/checkout.ts`      | Fallback amount if no price id                                       |

Production values live in **Vercel → Project → Settings → Environment
Variables** — the local `.env` only affects your machine.
