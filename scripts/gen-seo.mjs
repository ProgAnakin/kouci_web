// Generates public/sitemap.xml and public/llms.txt from the static routes + every
// blog post. Runs before the build (see package.json "build") so both files stay
// in sync with the committed posts and the configured domain.
//
// SITE_URL comes from VITE_SITE_URL (same var the client uses via import.meta.env)
// so the whole site has one source of truth for the canonical origin.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = process.env.VITE_SITE_URL || 'https://kouci-web.vercel.app'
const BLOG_DIR = join(root, 'src/content/blog')

function field(raw, name) {
  const m = new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(raw)
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
}

const posts = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(BLOG_DIR, f), 'utf8')
    return {
      slug: f.replace(/\.md$/, ''),
      date: field(raw, 'date'),
      title: field(raw, 'title'),
      excerpt: field(raw, 'excerpt'),
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

/* ---------------------------------------------------------------- sitemap.xml */
const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.2' },
  ...posts.map((p) => ({
    loc: `/blog/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: p.date,
  })),
]

const sitemapBody = routes
  .map((u) => {
    const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>${lastmod}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  })
  .join('\n')

writeFileSync(
  join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapBody}\n</urlset>\n`,
)

/* ------------------------------------------------------------------- llms.txt */
// Machine-readable overview for AI systems / answer engines (llmstxt.org).
const postLines = posts
  .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`)
  .join('\n')

const llms = `# Kouci

> Water polo tactical & statistical analysis app for coaches and analysts. Turns raw match data into a tactical edge — player stats, penalty and exclusion maps, animated set plays, and live game tracking. In development; early access opening soon. Coming to iOS & Android.

Kouci is built exclusively for water polo — not adapted from a generic field-sport tool. Clubs own their data entirely and can export it at any time.

## Core features
- Players: season-long roster with cap numbers tied to per-game stats.
- Penalty shot stats: every penalty mapped on the goal (placement, goal/miss, first attempt vs. repeat, bounce off the water).
- Tactics with animation: lay out set plays on a real water polo field and export to MP4/GIF.
- Live match statistics: log every player's stats in real time; numbers ready at the final whistle.

## Key pages
- [Home](${SITE_URL}/): product overview, features, early access
- [Blog](${SITE_URL}/blog): water polo tactics & statistical analysis
- [Privacy Policy](${SITE_URL}/privacy)
- [Terms of Use](${SITE_URL}/terms)

## Blog
${postLines}

## Early access
- Coaches and clubs can request access and a guided demo at ${SITE_URL}/#early-access
`

writeFileSync(join(root, 'public/llms.txt'), llms)

console.log(
  `[gen-seo] sitemap.xml (${routes.length} URLs) + llms.txt (${posts.length} posts) written`,
)
