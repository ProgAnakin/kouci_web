import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kouci brand palette. Mirrored as CSS variables in src/index.css.
        bg: '#131512', // Fundo / background
        surface: '#1F221B', // Superfícies / cards
        brand: {
          DEFAULT: '#7E8B63', // Oliva · brand
          light: '#9FAC82', // Oliva claro · highlights
        },
        silver: '#C5C9C0', // Prata · secondary details
        ink: '#E6E8E2', // Texto / text
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Sora Variable"', 'Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 6s ease-in-out infinite',
      },
      // Blog body typography ("prose prose-kouci"), themed to the brand palette.
      typography: ({ theme }) => ({
        kouci: {
          css: {
            '--tw-prose-body': theme('colors.silver'),
            '--tw-prose-headings': theme('colors.ink'),
            '--tw-prose-lead': theme('colors.silver'),
            '--tw-prose-links': theme('colors.brand.light'),
            '--tw-prose-bold': theme('colors.ink'),
            '--tw-prose-counters': theme('colors.brand.light'),
            '--tw-prose-bullets': theme('colors.brand.light'),
            '--tw-prose-hr': 'rgba(255,255,255,0.08)',
            '--tw-prose-quotes': theme('colors.ink'),
            '--tw-prose-quote-borders': theme('colors.brand.DEFAULT'),
            '--tw-prose-captions': theme('colors.silver'),
            '--tw-prose-code': theme('colors.ink'),
            '--tw-prose-pre-code': theme('colors.ink'),
            '--tw-prose-pre-bg': theme('colors.surface'),
            '--tw-prose-th-borders': 'rgba(255,255,255,0.15)',
            '--tw-prose-td-borders': 'rgba(255,255,255,0.08)',
            maxWidth: 'none',
            a: { textDecoration: 'none', fontWeight: '500' },
            'a:hover': { textDecoration: 'underline' },
            'h2, h3': { fontFamily: theme('fontFamily.display').join(', ') },
          },
        },
      }),
    },
  },
  plugins: [typography],
}
