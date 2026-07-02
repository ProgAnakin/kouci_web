import { Html, useProgress } from '@react-three/drei'

/**
 * DOM loader used as the React.lazy / Suspense fallback *around* a canvas
 * (before the 3D bundle has loaded). Plain HTML, on-brand palette.
 */
export function CanvasFallback() {
  return (
    <div className="grid h-full w-full place-items-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-silver/25 border-t-brand-light" />
        <span className="text-[11px] uppercase tracking-[0.25em] text-silver">Loading scene</span>
      </div>
    </div>
  )
}

/**
 * In-canvas loader for Suspense boundaries that wrap async 3D resources
 * (e.g. GLTF models once real assets are wired in). Uses drei's <Html>.
 */
export function SceneLoader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-silver/25 border-t-brand-light" />
        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-silver">
          Loading {Math.round(progress)}%
        </span>
      </div>
    </Html>
  )
}
