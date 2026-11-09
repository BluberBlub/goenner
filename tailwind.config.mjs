// @LOCKED v3 – Tailwind-Config mit Alpha-fähigen CSS-Variablen.
// NIEMALS auf var(--color-x)-Strings zurückbauen: dann werden ALLE
// Abstufungen (bg-primary/5, bg-background/90, border-accent/60 …)
// stillschweigend NICHT generiert – Header transparent, Tints weiß.
// v2: on-primary / on-secondary / on-accent = Schriftfarbe AUF der jeweiligen
// Fläche, automatisch nach Kontrast berechnet (BaseLayout). Also immer
// "bg-accent text-on-accent", nie "bg-accent text-white" von Hand.
// v3: rounded-knopf / rounded-karte = einheitlicher Radius aus design.radius (BaseLayout).
// Buttons immer rounded-knopf, Karten/Boxen/Bilder immer rounded-karte. Keine festen Radien
// (rounded-xl, rounded-3xl …) für sichtbare Flächen, qa-craft prüft die Einheitlichkeit.
// v3: Große Schriftgrößen (text-4xl bis text-9xl) mit Zeilenabstand 1.15 statt Tailwinds 1.0:
//     mehrzeilige Überschriften überlappen sonst (Spöri: g und f berührten sich). Einzeilige
//     Riesenzeilen dürfen bewusst leading-none bekommen.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        primary:        'rgb(var(--color-primary-rgb) / <alpha-value>)',
        secondary:      'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        accent:         'rgb(var(--color-accent-rgb) / <alpha-value>)',
        background:     'rgb(var(--color-background-rgb) / <alpha-value>)',
        text:           'rgb(var(--color-text-rgb) / <alpha-value>)',
        'on-primary':   'rgb(var(--color-on-primary-rgb) / <alpha-value>)',
        'on-secondary': 'rgb(var(--color-on-secondary-rgb) / <alpha-value>)',
        'on-accent':    'rgb(var(--color-on-accent-rgb) / <alpha-value>)',
      },
      borderRadius: {
        knopf: 'var(--radius-knopf, 9999px)',
        karte: 'var(--radius-karte, 1.5rem)',
      },
      fontSize: {
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.75rem', { lineHeight: '1.15' }],
        '7xl': ['4.5rem', { lineHeight: '1.15' }],
        '8xl': ['6rem', { lineHeight: '1.15' }],
        '9xl': ['8rem', { lineHeight: '1.15' }],
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
    },
  },
};
