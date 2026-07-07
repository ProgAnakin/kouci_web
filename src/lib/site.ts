/**
 * Canonical site origin used for absolute URLs in SEO tags, sitemap, structured
 * data and llms.txt. Single source of truth: set `VITE_SITE_URL` when the real
 * domain lands (locally in .env, and in the Vercel project env) and everything —
 * client + the build-time sitemap/llms.txt generator — picks it up. Falls back
 * to the current Vercel URL.
 */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://kouci-web.vercel.app'
export const SITE_NAME = 'Kouci'
export const DEFAULT_OG_IMAGE = '/og-image.jpg'

/**
 * Legal identity shown on the Privacy Policy and Terms pages. FILL THESE before
 * launch — until then the live pages display the placeholders below, which is a
 * trust/compliance gap. This is the only place to edit them.
 */
export const LEGAL_ENTITY = '[Your legal entity / name]'
export const CONTACT_EMAIL = '[your contact email]'

/** The social profiles, surfaced to search/AI via Organization structured data. */
export const SOCIAL_LINKS = [
  'https://www.instagram.com/kouci.wp',
  'https://x.com/KouciWP',
  'https://www.linkedin.com/company/kouciwp/',
  'https://www.youtube.com/@KouciWP',
]

/** Absolute URL helper. Passes through values that are already absolute. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  return SITE_URL + (pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`)
}
