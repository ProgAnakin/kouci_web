import { Link } from 'react-router-dom'
import { getAllPosts, formatDate } from '../lib/blog'
import { Reveal } from '../components/ui/Reveal'
import { Seo } from '../components/Seo'
import { SITE_NAME, SITE_URL, absoluteUrl } from '../lib/site'

const DESCRIPTION =
  'Water polo tactical breakdowns, statistical analysis, and product updates from Kouci — power plays, penalty maps, set plays, and more for coaches and analysts.'

export function BlogIndex() {
  const posts = getAllPosts()

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${SITE_NAME} Blog`,
      description: DESCRIPTION,
      url: absoluteUrl('/blog'),
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: absoluteUrl(`/blog/${post.slug}`),
        datePublished: post.date,
        description: post.excerpt,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
      ],
    },
  ]

  return (
    <main id="main" className="container-content pb-24 pt-32 md:pt-40">
      <Seo
        title="Blog — Water Polo Tactics & Analysis | Kouci"
        description={DESCRIPTION}
        path="/blog"
        jsonLd={jsonLd}
      />
      <header className="max-w-2xl">
        <span className="eyebrow">Blog</span>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink md:text-5xl">
          Field notes
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-silver">
          Tactical breakdowns, product updates, and what we learn building Kouci.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-16 text-silver">No posts yet — check back soon.</p>
      ) : (
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.05} from="up">
              <Link
                to={`/blog/${post.slug}`}
                className="card card-lift group flex h-full flex-col overflow-hidden"
              >
                {post.cover && (
                  <div className="aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={post.cover}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  {post.tags[0] && (
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-brand-light">
                      {post.tags[0]}
                    </span>
                  )}
                  <h2 className="mt-3 text-xl font-semibold text-ink transition-colors group-hover:text-brand-light md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 leading-relaxed text-silver">{post.excerpt}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-silver/70">
                    <span>{formatDate(post.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = BlogIndex
