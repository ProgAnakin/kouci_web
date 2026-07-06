/**
 * Canonical site origin used for absolute URLs in SEO tags, sitemap, and
 * structured data. Update this to the final custom domain when it lands
 * (and the same value in scripts/gen-seo.mjs).
 */
export const SITE_URL = 'https://kouci-web.vercel.app'
export const SITE_NAME = 'Kouci'
export const DEFAULT_OG_IMAGE = '/og-image.jpg'

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
