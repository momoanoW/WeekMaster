/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Mein Farbsystem
      colors: {
        // Grüntöne (Primärfarben für Aktionen)
        'primary': '#82AF91',        // Pastell-Dunkelgrün (Haupt-Aktionsfarbe)
        'primary-light': '#ABC99B',   // Hell-Grün (für Hover-Effekte)
        'primary-subtle': '#AECAB4',  // Pastell-Grün (für dezente Hintergründe)

        // Warme Akzentfarben
        'accent': '#E5AF73',         // Grau-Orange (für sekundäre Buttons)
        'accent-light': '#ECC582',   // Pastell-Gelb (für Highlights oder Hinweise)
        
        // Sanfte Rot-/Rosatöne (für Warnungen oder spezielle UI-Elemente)
        'warning': '#E19576',        // Pastell-Rot
        'warning-light': '#EBB8B3',  // Pastell-Rosa
        'skin': '#FAD9CA',           // Hautfarbe (für sehr subtile Hintergründe)

        // Neutrale Farben für Text und Rahmen (essentiell für Lesbarkeit)
        'text-dark': '#1a1a1a',      // Fast schwarz für Titel
        'text-default': '#2d2d2d',   // Standard-Textfarbe
        'background': '#ffffff',     // Weißer Hintergrund
        'border': '#e5e7eb',         // Standard-Rahmenfarbe
      },
      // Meine Schriftart
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Meine Rundungsgrößen
      borderRadius: {
        's': '0.25rem',
        'm': '0.5rem',
        'l': '0.75rem',
      }
    },
  },
  plugins: [],
}