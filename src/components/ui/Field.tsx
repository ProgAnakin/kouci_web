import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
}

/** Labeled text input with accessible error wiring (aria-invalid / describedby). */
export function Field({ label, id, error, ...rest }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 w-full rounded-xl border bg-bg/60 px-4 py-3 text-sm text-ink placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-brand-light ${
          error ? 'border-red-400/60' : 'border-white/10'
        }`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
