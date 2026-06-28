/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Formspree form endpoint for the early-access form, e.g. https://formspree.io/f/xxxxxxx */
  readonly VITE_FORMSPREE_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
