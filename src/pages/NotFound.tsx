import { Link } from 'react-router-dom'

const linkBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200'

export function NotFound() {
  return (
    <main
      id="main"
      className="container-content flex min-h-[70vh] flex-col items-center justify-center py-32 text-center"
    >
      <span className="eyebrow justify-center">404</span>
      <h1 className="mt-4 text-4xl font-semibold text-ink md:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-silver">
        That page doesn’t exist or may have moved. Let’s get you back on deck.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link to="/" className={`${linkBase} bg-brand text-bg hover:bg-brand-light`}>
          Back home
        </Link>
        <Link
          to="/blog"
          className={`${linkBase} border border-silver/25 text-ink hover:border-brand-light/70 hover:text-brand-light`}
        >
          Read the blog
        </Link>
      </div>
    </main>
  )
}

// Route entry for vite-react-ssg's lazy loader.
export const Component = NotFound
