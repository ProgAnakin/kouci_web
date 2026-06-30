import { marked } from 'marked'

/**
 * Static, code-managed blog. Every post is a Markdown file in
 * `src/content/blog/` with YAML-style frontmatter. Posts are bundled at build
 * time via `import.meta.glob` — there is no CMS, database, or runtime fetch, so
 * the only way to publish is to commit a file and deploy. That is the whole
 * security model: nothing dynamic to exploit.
 */

export interface PostMeta {
  slug: string
  title: string
  /** ISO date string, e.g. 2026-06-30. */
  date: string
  excerpt: string
  author: string
  tags: string[]
  /** Estimated minutes to read. */
  readingTime: number
  /** Optional absolute/rooted cover image path, e.g. /assets/blog/x.png. */
  cover?: string
}

export interface Post extends PostMeta {
  /** Rendered HTML body (from trusted, repo-committed Markdown). */
  html: string
}

marked.setOptions({ gfm: true, breaks: false })

// Eagerly import every post's raw Markdown source at build time.
const modules = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, body: raw }

  const [, frontmatter, body] = match
  const data: Record<string, string> = {}
  for (const line of frontmatter.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key) data[key] = value
  }
  return { data, body }
}

function parseTags(value?: string): string[] {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function buildPost(path: string, raw: string): Post {
  const slug = (path.split('/').pop() ?? path).replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    author: data.author ?? 'Kouci',
    tags: parseTags(data.tags),
    readingTime: data.readingTime ? Number(data.readingTime) : estimateReadingTime(body),
    cover: data.cover || undefined,
    html: marked.parse(body) as string,
  }
}

// Newest first.
const posts: Post[] = Object.entries(modules)
  .map(([path, raw]) => buildPost(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))

export function getAllPosts(): Post[] {
  return posts
}

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Human date, e.g. "30 Jun 2026". Formatted in UTC with no locale lookup, so it
 * is byte-for-byte identical between the Node build (SSG) and the browser —
 * avoiding hydration mismatches. Returns '' for an empty/invalid date.
 */
export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
