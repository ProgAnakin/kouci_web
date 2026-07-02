import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rendered in place of the children when they throw. Defaults to nothing. */
  fallback?: ReactNode
  /** Label to identify which boundary tripped in dev logs. */
  label?: string
}

interface State {
  hasError: boolean
}

/**
 * Catches render/runtime errors in a subtree so one failure never white-screens
 * the page. Wrapped around the WebGL canvases in particular: if a shader fails
 * to compile or the GL context is lost, the section falls back to its static
 * poster instead of taking the whole app down.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      const tag = this.props.label ? `ErrorBoundary: ${this.props.label}` : 'ErrorBoundary'
      // eslint-disable-next-line no-console
      console.error(`[${tag}]`, error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
