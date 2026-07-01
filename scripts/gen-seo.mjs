// Generates public/sitemap.xml from the static routes + every blog post.
// Runs before the build so the sitemap always matches the committed posts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = 'https://kouci-web.vercel.app'
const BLOG_DIR = join(root, 'src/content/blog')

function frontmatterDate(raw) {
  const m = /^date:\s*(.+)$/m.exec(raw)
  return m ? m[1].trim().replace(/['"]/g, '') : ''
}

const posts = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({
    slug: f.replace(/\.md$/, ''),
    date: frontmatterDate(readFileSync(join(BLOG_DIR, f), 'utf8')),
  }))

const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
  ...posts.map((p) => ({
    loc: `/blog/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: p.date,
  })),
]

const body = routes
  .map((u) => {
    const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>${lastmod}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`[gen-seo] sitemap.xml written with ${routes.length} URLs`)
