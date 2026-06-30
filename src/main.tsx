import { ViteReactSSG } from 'vite-react-ssg'
// Self-hosted variable fonts — no external request, no FOUT.
import '@fontsource-variable/inter'
import '@fontsource-variable/sora'
import 'lenis/dist/lenis.css'
import { routes } from './App'
import './index.css'

// Static-site-generation entry. vite-react-ssg pre-renders every route to HTML
// at build time and hydrates on the client.
export const createRoot = ViteReactSSG({ routes })
