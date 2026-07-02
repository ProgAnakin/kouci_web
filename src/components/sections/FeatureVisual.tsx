import type { FeatureId } from '../../data/features'

/**
 * Compact, dependency-free SVG vignette for each feature card. These keep the
 * Features grid lightweight (no extra WebGL contexts) — the heavy 3D demos live
 * in the Showcase section. Colors are the Kouci palette.
 */
export function FeatureVisual({ id }: { id: FeatureId }) {
  const common = 'h-full w-full'
  switch (id) {
    case 'players':
      return (
        <svg viewBox="0 0 240 150" className={common} role="presentation" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(20 ${24 + i * 38})`}>
              <rect width="200" height="28" rx="8" fill="#1F221B" stroke="#2c2f27" />
              <circle cx="22" cy="14" r="11" fill="#7E8B63" />
              <text x="22" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#131512">
                {i + 4}
              </text>
              <rect x="44" y="9" width="90" height="6" rx="3" fill="#C5C9C0" opacity="0.6" />
              <rect x="150" y="9" width="36" height="10" rx="3" fill="#9FAC82" opacity="0.5" />
            </g>
          ))}
        </svg>
      )
    case 'penalty':
      return (
        <svg viewBox="0 0 240 150" className={common} role="presentation" aria-hidden="true">
          <rect
            x="34"
            y="28"
            width="172"
            height="86"
            rx="3"
            fill="none"
            stroke="#C5C9C0"
            strokeWidth="3"
          />
          {/* net hint */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={`v${i}`}
              x1={34 + (i + 1) * 34.4}
              y1="28"
              x2={34 + (i + 1) * 34.4}
              y2="114"
              stroke="#2c2f27"
            />
          ))}
          {[0, 1].map((i) => (
            <line
              key={`h${i}`}
              x1="34"
              y1={28 + (i + 1) * 28.6}
              x2="206"
              y2={28 + (i + 1) * 28.6}
              stroke="#2c2f27"
            />
          ))}
          {/* goals */}
          {[
            [58, 48],
            [188, 52],
            [64, 96],
            [180, 92],
            [120, 40],
          ].map(([x, y], i) => (
            <circle key={`g${i}`} cx={x} cy={y} r="7" fill="#9FAC82" />
          ))}
          {/* misses */}
          {[
            [120, 72],
            [120, 20],
          ].map(([x, y], i) => (
            <circle key={`m${i}`} cx={x} cy={y} r="5" fill="#C5C9C0" opacity="0.65" />
          ))}
        </svg>
      )
    case 'tactics':
      return (
        <svg viewBox="0 0 240 150" className={common} role="presentation" aria-hidden="true">
          <rect x="20" y="20" width="200" height="110" rx="8" fill="#1F221B" stroke="#2c2f27" />
          <line x1="120" y1="20" x2="120" y2="130" stroke="#7E8B63" strokeWidth="2" opacity="0.5" />
          <defs>
            <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="#9FAC82" />
            </marker>
          </defs>
          <path
            d="M60 100 C 90 70, 120 70, 150 50"
            fill="none"
            stroke="#9FAC82"
            strokeWidth="3"
            markerEnd="url(#ah)"
          />
          <circle cx="60" cy="100" r="9" fill="#7E8B63" />
          <circle cx="150" cy="50" r="9" fill="#C5C9C0" />
          <circle cx="95" cy="95" r="9" fill="#9FAC82" />
        </svg>
      )
    case 'live':
      return (
        <svg viewBox="0 0 240 150" className={common} role="presentation" aria-hidden="true">
          <g transform="translate(20 18)">
            <circle cx="6" cy="6" r="5" fill="#9FAC82">
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>
            <text x="20" y="10" fontSize="10" fontWeight="700" fill="#C5C9C0" letterSpacing="2">
              LIVE
            </text>
          </g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(20 ${44 + i * 24})`}>
              <circle cx="8" cy="8" r="8" fill="#7E8B63" />
              <text x="8" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="#131512">
                {i + 2}
              </text>
              <rect
                x="26"
                y="4"
                width={140 - i * 22}
                height="8"
                rx="4"
                fill="#9FAC82"
                opacity={0.8 - i * 0.15}
              />
              <rect x={190} y="2" width="22" height="12" rx="3" fill="#1F221B" stroke="#2c2f27" />
            </g>
          ))}
        </svg>
      )
  }
}
