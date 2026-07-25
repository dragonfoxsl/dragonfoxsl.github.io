/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E14',
        surface: '#10151E',
        'surface-alt': '#161D28',
        border: 'rgba(255,255,255,.07)',
        'border-subtle': 'rgba(255,255,255,.05)',
        'border-hover': 'rgba(255,255,255,.16)',
        text: '#E6EAF0',
        muted: '#7D8799',
        accent: '#38BDF8',
        'accent-hover': '#7DD3FC',
        'accent-wash': 'rgba(56,189,248,.08)',
        'accent-border': 'rgba(56,189,248,.35)',
        'accent-border-hover': 'rgba(56,189,248,.6)',
        'accent-card-hover': 'rgba(56,189,248,.32)',
        signal: '#4ADE80',
        'signal-border': 'rgba(74,222,128,.32)',
        'row-hover': 'rgba(255,255,255,.018)',
        selection: 'rgba(56,189,248,.25)',
        'header-fill': 'rgba(10,14,20,.82)',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'monospace'],
      },
    },
  },
};
