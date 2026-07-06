import { Head } from 'vite-react-ssg'
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from '../lib/site'

interface SeoProps {
  /** Full <title>. */
  title: string
  description: string
  /** Rooted path of this page, e.g. "/blog/welcome-to-kouci". */
  path: string
  /** Rooted or absolute image; falls back to the default OG image. */
  image?: string
  type?: 'website' | 'article'
  /** Article metadata (only used when type === 'article'). */
  publishedTime?: string
  author?: string
  tags?: string[]
  /** One or more JSON-LD objects describing this page for search engines / AI. */
  jsonLd?: object | object[]
  /** Ask crawlers not to index this page (e.g. the 404). */
  noindex?: boolean
}

/**
 * Per-page document head: title, description, canonical, Open Graph, Twitter
 * cards, and JSON-LD structured data. Rendered into the static HTML by
 * vite-react-ssg (via react-helmet), so crawlers and link unfurlers — and JS-
 * less AI crawlers — see correct metadata for every route.
 */
export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  author,
  tags,
  jsonLd,
  noindex = false,
}: SeoProps) {
  const url = absoluteUrl(path)
  const img = absoluteUrl(image || DEFAULT_OG_IMAGE)
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@KouciWP" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && <meta property="article:author" content={author} />}
      {type === 'article' &&
        tags?.map((tag) => <meta property="article:tag" content={tag} key={tag} />)}

      {blocks.map((block, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(block)}
        </script>
      ))}
    </Head>
  )
}
