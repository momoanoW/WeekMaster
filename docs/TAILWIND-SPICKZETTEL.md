# Tailwind CSS - Der ultimative Spickzettel
*Optimiert für 2-seitige A4-Ausdrucke*

---

## 📏 Abstände (Box-Modell)

### Padding (Innenabstand)
```css
p-4     /* padding auf allen Seiten */
px-4    /* padding auf der x-Achse (links/rechts) */
py-4    /* padding auf der y-Achse (oben/unten) */
pt-4    /* padding-top */
pr-4    /* padding-right */
pb-4    /* padding-bottom */
pl-4    /* padding-left */
```

### Margin (Außenabstand)
```css
m-4     /* margin auf allen Seiten */
mx-auto /* margin auf der x-Achse auf auto (zentriert horizontal) */
mb-4    /* margin-bottom */
mt-6    /* margin-top */
-m-2    /* negativer Margin (Design-Effekte) */
```

### Spezial-Features
```css
space-x-4   /* horizontaler Abstand zwischen Flexbox-Items */
space-y-2   /* vertikaler Abstand zwischen Flexbox-Items */
gap-4       /* Abstand zwischen Flex- oder Grid-Items */
```

**💡 Merkhilfe Box-Modell:**
- **Padding** = Passepartout (Raum um den Inhalt)
- **Border** = Bilderrahmen (sichtbare Linie)
- **Margin** = Wandabstand (Raum zu anderen Elementen)

---

## 🔲 Layout (Flexbox & Grid)

### Flexbox Grundlagen
```css
flex            /* Aktiviert Flexbox */
flex-col        /* Vertikale Richtung (Spalte) */
flex-row        /* Horizontale Richtung (Standard) */
flex-wrap       /* Items können umbrechen */
```

### Flexbox Ausrichtung
```css
justify-center      /* Items horizontal zentrieren */
justify-between     /* Items an entgegengesetzte Enden */
justify-end         /* Items rechts ausrichten */
items-center        /* Items vertikal zentrieren */
items-start         /* Items oben ausrichten */
```

### Grid Layout
```css
grid            /* Aktiviert Grid-Layout */
grid-cols-3     /* 3 Spalten gleicher Breite */
grid-cols-2     /* 2 Spalten gleicher Breite */
col-span-2      /* Item erstreckt sich über 2 Spalten */
```

### Positionierung
```css
relative        /* Relative Positionierung */
absolute        /* Absolute Positionierung */
fixed           /* Fixierte Position (bleibt beim Scrollen) */
sticky          /* Klebt an Position beim Scrollen */
inset-0         /* top:0, right:0, bottom:0, left:0 */
```

---

## 📝 Schrift & Text

### Schriftgröße
```css
text-xs     /* Extra klein */
text-sm     /* Klein */
text-base   /* Standard (16px) */
text-lg     /* Groß */
text-xl     /* Extra groß */
text-2xl    /* 2x groß */
text-3xl    /* 3x groß */
```

### Schriftstil
```css
font-light      /* Dünne Schrift */
font-normal     /* Normale Schrift */
font-medium     /* Mittlere Schrift */
font-semibold   /* Halbfett */
font-bold       /* Fett */
italic          /* Kursiv */
```

### Textausrichtung & Styling
```css
text-left       /* Links ausrichten */
text-center     /* Zentrieren */
text-right      /* Rechts ausrichten */
text-justify    /* Blocksatz */
truncate        /* Text mit "..." abschneiden */
```

### Textfarben (Häufige)
```css
text-white      /* Weißer Text */
text-black      /* Schwarzer Text */
text-gray-700   /* Dunkelgrauer Text */
text-blue-600   /* Blauer Text */
text-red-500    /* Roter Text */
```

### Spezial-Features
```css
tracking-wider      /* Vergrößerter Buchstabenabstand */
leading-relaxed     /* Vergrößerter Zeilenabstand */
uppercase           /* GROSSBUCHSTABEN */
lowercase           /* kleinbuchstaben */
```

---

## 🎨 Hintergrund & Styling

### Hintergrundfarben
```css
bg-white        /* Weißer Hintergrund */
bg-gray-100     /* Hellgrauer Hintergrund */
bg-blue-600     /* Blauer Hintergrund */
bg-red-500      /* Roter Hintergrund */
bg-green-500    /* Grüner Hintergrund */
```

### Farbverläufe
```css
bg-gradient-to-r from-blue-500 to-purple-600   /* Verlauf von links nach rechts */
bg-gradient-to-b from-red-400 to-yellow-500    /* Verlauf von oben nach unten */
```

### Rahmen (Border)
```css
border          /* Dünner Rahmen */
border-2        /* Dicker Rahmen */
border-dashed   /* Gestrichelter Rahmen */
border-gray-300 /* Grauer Rahmen */
border-blue-500 /* Blauer Rahmen */
```

### Rundungen
```css
rounded-none    /* Keine Rundung */
rounded-sm      /* Kleine Rundung */
rounded-md      /* Mittlere Rundung */
rounded-lg      /* Große Rundung */
rounded-full    /* Vollständig rund */
```

### Schatten
```css
shadow-sm       /* Kleiner Schatten */
shadow-md       /* Mittlerer Schatten */
shadow-lg       /* Großer Schatten */
shadow-xl       /* Extra großer Schatten */
```

### Sichtbarkeit & Effekte
```css
opacity-0       /* Vollständig durchsichtig */
opacity-50      /* Halbtransparent */
opacity-100     /* Vollständig sichtbar */
hidden          /* Element verstecken */
block           /* Als Blockelement anzeigen */
```

---

## 📐 Größe & Abmessungen

### Breite (Width)
```css
w-auto      /* Automatische Breite */
w-full      /* Volle Breite (100%) */
w-1/2       /* Halbe Breite (50%) */
w-1/3       /* Ein Drittel (33.33%) */
w-2/3       /* Zwei Drittel (66.66%) */
w-1/4       /* Ein Viertel (25%) */
w-fit       /* Nur so breit wie der Inhalt */
```

### Höhe (Height)
```css
h-auto      /* Automatische Höhe */
h-full      /* Volle Höhe (100%) */
h-screen    /* Volle Bildschirmhöhe */
h-1/2       /* Halbe Höhe */
```

### Maximale/Minimale Größen
```css
max-w-sm        /* Maximale Breite: small */
max-w-md        /* Maximale Breite: medium */
max-w-lg        /* Maximale Breite: large */
max-w-xl        /* Maximale Breite: extra large */
min-h-screen    /* Minimale Höhe: Bildschirmhöhe */
```

---

## 🎭 Zustände & Interaktionen

### Hover-Effekte
```css
hover:bg-blue-700       /* Hintergrund bei Hover */
hover:text-white        /* Textfarbe bei Hover */
hover:shadow-lg         /* Schatten bei Hover */
hover:scale-105         /* Leichte Vergrößerung bei Hover */
```

### Focus-Zustände (für Formulare)
```css
focus:outline-none      /* Standard-Fokus entfernen */
focus:ring-2            /* Ring um fokussiertes Element */
focus:ring-blue-500     /* Blauer Fokus-Ring */
focus:border-blue-500   /* Blaue Umrandung bei Fokus */
```

### Disabled-Zustände
```css
disabled:opacity-50             /* Halbtransparent wenn deaktiviert */
disabled:cursor-not-allowed     /* "Verboten"-Cursor */
```

### Gruppierte Hover-Effekte
```css
/* Auf Eltern-Container: */
group

/* Auf Kind-Element: */
group-hover:text-white      /* Ändert sich bei Hover über Eltern */
group-hover:bg-blue-600     /* Hintergrund bei Eltern-Hover */
```

### Übergänge & Animationen
```css
transition                      /* Aktiviert Übergänge */
duration-300                    /* Übergang dauert 300ms */
ease-in-out                     /* Sanfter Übergang */
transform                       /* Aktiviert Transformationen */
scale-105                       /* 5% Vergrößerung */
rotate-45                       /* 45° Drehung */
```

---

## 📱 Responsive Design (Mobile First)

### Breakpoints
```css
/* Ohne Präfix = alle Größen (Mobile First) */
p-4             /* Padding 4 auf allen Geräten */

/* sm: = Small (≥640px) - Kleine Tablets */
sm:p-6          /* Padding 6 ab 640px */

/* md: = Medium (≥768px) - Tablets */
md:p-8          /* Padding 8 ab 768px */

/* lg: = Large (≥1024px) - Laptops */
lg:p-12         /* Padding 12 ab 1024px */

/* xl: = Extra Large (≥1280px) - Desktop */
xl:p-16         /* Padding 16 ab 1280px */
```

### Typische Responsive Patterns
```css
/* Verstecken/Zeigen nach Gerätegröße */
hidden lg:block             /* Versteckt auf Mobile, sichtbar ab Laptop */
block lg:hidden             /* Sichtbar auf Mobile, versteckt ab Laptop */

/* Layout-Änderungen */
flex-col lg:flex-row        /* Vertikal auf Mobile, horizontal ab Laptop */
w-full lg:w-1/2            /* Volle Breite auf Mobile, halbe ab Laptop */
text-center lg:text-left    /* Zentriert auf Mobile, links ab Laptop */

/* Grid-Änderungen */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
/* 1 Spalte Mobile, 2 Spalten Tablet, 3 Spalten Laptop */
```

---

## 🏗️ Formulare & Eingabefelder

### Input-Styling
```css
/* Basis-Styling für Eingabefelder */
block w-full px-3 py-2 border border-gray-300 rounded-md

/* Fokus-Styling */
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500

/* Platzhalter */
placeholder:text-gray-400

/* Verschiedene Input-Typen */
appearance-none             /* Entfernt Browser-Standard-Styling */
```

### Button-Styling
```css
/* Primärer Button */
bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700

/* Sekundärer Button */
bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300

/* Button-Zustände */
disabled:opacity-50 disabled:cursor-not-allowed
```

### Select/Dropdown
```css
/* Select-Styling */
block w-full px-3 py-2 border border-gray-300 bg-white rounded-md
```

---

## 🧹 @apply - Code aufräumen

### Problem: Wiederholender Code
```html
<!-- Schlecht: Viel Wiederholung -->
<button class="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
  Speichern
</button>
<button class="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
  Löschen
</button>
```

### Lösung: Eigene Klassen definieren
```css
/* In styles.css */
.btn-primary {
  @apply py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md;
}
```

```html
<!-- Gut: Sauberer Code -->
<button class="btn-primary">Speichern</button>
<button class="btn-primary">Löschen</button>
<input class="form-input" type="text">
```

---

## 🔧 Praktische Code-Schnipsel

### Modal/Dialog Overlay
```css
fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center
```

### Karten-Design
```css
bg-white rounded-lg shadow-md p-6 border border-gray-200
```

### Zentrierte Container
```css
max-w-4xl mx-auto px-4
```

### Flex-Layout für Header
```css
flex justify-between items-center py-4
```

### Grid für Cards
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

---

## 🚨 Debug & Entwicklung

### Layout-Debugging
```css
border-2 border-red-500     /* Rote Umrandung zum Testen */
bg-red-100                  /* Heller roter Hintergrund */
bg-blue-100                 /* Heller blauer Hintergrund */
```

### Overflow-Kontrolle
```css
overflow-hidden             /* Versteckt überlaufenden Inhalt */
overflow-scroll             /* Fügt Scrollbalken hinzu */
overflow-x-auto             /* Horizontaler Scroll bei Bedarf */
```

### Z-Index für Layering
```css
z-0, z-10, z-20, z-30, z-40, z-50     /* Verschiedene Ebenen */
```

---

## 📋 Klassische CSS-Eigenschaften Übersetzung

| CSS | Tailwind | Beschreibung |
|-----|----------|-------------|
| `display: flex` | `flex` | Flexbox aktivieren |
| `display: block` | `block` | Blockelement |
| `display: none` | `hidden` | Element verstecken |
| `text-align: center` | `text-center` | Text zentrieren |
| `background-color: blue` | `bg-blue-500` | Blauer Hintergrund |
| `color: white` | `text-white` | Weißer Text |
| `border-radius: 8px` | `rounded-lg` | Abgerundete Ecken |
| `padding: 16px` | `p-4` | Innenabstand |
| `margin: 16px` | `m-4` | Außenabstand |
| `width: 100%` | `w-full` | Volle Breite |
| `height: 100vh` | `h-screen` | Volle Bildschirmhöhe |
| `box-shadow: ...` | `shadow-md` | Schatten |
| `font-weight: bold` | `font-bold` | Fette Schrift |

---

## 🎯 Best Practices

### 1. Reihenfolge der Klassen
```css
/* Empfohlene Reihenfolge für bessere Lesbarkeit: */
/* Layout → Box-Modell → Hintergrund → Text → Zustände */
<div class="flex p-4 bg-white rounded-lg font-bold text-gray-800 hover:bg-gray-100">
```

### 2. Mobile First denken
```css
/* Immer zuerst für Mobile designen, dann erweitern */
<div class="w-full lg:w-1/2">   /* Volle Breite Mobile, halbe ab Laptop */
```

### 3. Semantische Klassen mit @apply
```css
/* Wiederverwendbare Komponenten erstellen */
.card { @apply bg-white rounded-lg shadow-md p-6; }
.btn { @apply px-4 py-2 rounded-md font-medium; }
```

### 4. Konsistente Farbpalette
```css
/* Bleibe bei einer begrenzten Farbpalette */
/* Primär: blue-600, Sekundär: gray-600, Erfolg: green-500, Fehler: red-500 */
```

---

*💡 Tipp: Für PDF-Konvertierung nutze Markdown-to-PDF Tools wie Pandoc oder Online-Konverter. Setze Seitenumbrüche vor wichtigen Überschriften für optimalen Ausdruck.*
