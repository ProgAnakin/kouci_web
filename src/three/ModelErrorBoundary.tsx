import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rendered if the model fails to load (e.g. file missing or invalid). */
  fallback: ReactNode
}

/**
 * Keeps the scene alive if a player `.glb` is configured but can't be loaded —
 * it falls back to the procedural placeholder instead of crashing the canvas.
 */
export class ModelErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn('[Kouci] player model failed to load — using placeholder.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
