import type { RouteRecord } from 'vite-react-ssg'
import { RootLayout } from './RootLayout'
import { LandingPage } from './pages/LandingPage'

// Routes are declared as data so vite-react-ssg can statically generate each
// one. The blog pages are code-split (lazy) — the landing never ships the
// markdown renderer or posts, and getStaticPaths enumerates every post to
// pre-render at build time.
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    entry: 'src/RootLayout.tsx',
    children: [
      { index: true, element: <LandingPage />, entry: 'src/pages/LandingPage.tsx' },
      { path: 'privacy', lazy: () => import('./pages/Privacy') },
      { path: 'terms', lazy: () => import('./pages/Terms') },
      { path: 'blog', lazy: () => import('./pages/BlogIndex') },
      {
        path: 'blog/:slug',
        lazy: () => import('./pages/BlogPost'),
        getStaticPaths: async () => {
          const { getAllPosts } = await import('./lib/blog')
          return getAllPosts().map((post) => `blog/${post.slug}`)
        },
      },
      { path: '*', lazy: () => import('./pages/NotFound') },
    ],
  },
]
