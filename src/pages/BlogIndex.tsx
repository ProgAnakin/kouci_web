import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts, formatDate } from '../lib/blog'
import { Reveal } from '../components/ui/Reveal'

export function BlogIndex() {
  const posts = getAllPosts()

  useEffect(() => {
    document.title = 'Blog — Kouci'
    return () => {
      document.title = 'Kouci — Master Every Play'
    }
  }, [])

  return (
    <main id="main" className="container-content pb-24 pt-32 md:pt-40">
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
                className="card group flex h-full flex-col p-6 md:p-8"
              >
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
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  )
}
