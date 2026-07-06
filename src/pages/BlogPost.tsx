import { Link, useParams } from 'react-router-dom'
import { getPost, formatDate } from '../lib/blog'
import { Seo } from '../components/Seo'
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl } from '../lib/site'
import { NotFound } from './NotFound'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined

  if (!post) return <NotFound />

  const url = absoluteUrl(`/blog/${post.slug}`)
  const image = absoluteUrl(post.cover || DEFAULT_OG_IMAGE)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image,
      datePublished: post.date,
      dateModified: post.date,
      author: { '@type': 'Organization', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/og-image.jpg') },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: post.tags.join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ]

  return (
    <main id="main" className="container-content pb-24 pt-32 md:pt-40">
      <Seo
        title={`${post.title} | ${SITE_NAME}`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.cover || DEFAULT_OG_IMAGE}
        type="article"
        publishedTime={post.date}
        author={post.author}
        tags={post.tags}
        jsonLd={jsonLd}
      />

      <article className="mx-auto max-w-2xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-brand-light transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> All posts
        </Link>

        <header className="mt-8">
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-light"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-ink md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-silver/70">
            <span>{post.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        {post.cover && (
          <img
            src={post.cover}
            alt=""
            className="mt-10 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
            loading="eager"
          />
        )}

        {/* Body is rendered from trusted, repo-committed Markdown (see lib/blog.ts). */}
        <div
          className="prose prose-kouci mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <footer className="mt-16 border-t border-white/5 pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-brand-light transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span> Back to all posts
          </Link>
        </footer>
      </article>
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = BlogPost
