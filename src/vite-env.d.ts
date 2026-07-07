/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Formspree form endpoint for the early-access form, e.g. https://formspree.io/f/xxxxxxx */
  readonly VITE_FORMSPREE_ENDPOINT?: string
  /** Canonical site origin (no trailing slash). Set when the custom domain lands. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
