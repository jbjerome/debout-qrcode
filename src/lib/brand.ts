// Palette officielle Debout! (charte graphique).
export const BRAND = {
  fuchsia: "#ff4d56", // Hot Fuchsia — principale
  beige: "#f9f7e4", // Antique White — principale
  noir: "#000000", // Noir — principale
  turquoise: "#5fccb7", // secondaire
  mauve: "#de6ef9", // secondaire
  crimson: "#3a0a23", // Crimson violet — tertiaire (plum foncé)
  blanc: "#ffffff", // remplacement de l'Antique White
} as const;

export type Gradient = { from: string; to: string };

export type Preset = {
  name: string;
  dotsColor: string;
  bgColor: string;
  gradient: Gradient | null;
};

// Combinaisons biton conformes à la charte.
// Les premières privilégient le contraste (meilleure lecture du QR) ;
// les dégradés deux tons ferment la liste.
export const PRESETS: Preset[] = [
  { name: "Fuchsia / Beige", dotsColor: BRAND.fuchsia, bgColor: BRAND.beige, gradient: null },
  { name: "Noir / Beige", dotsColor: BRAND.noir, bgColor: BRAND.beige, gradient: null },
  { name: "Beige / Noir", dotsColor: BRAND.beige, bgColor: BRAND.noir, gradient: null },
  { name: "Beige / Fuchsia", dotsColor: BRAND.beige, bgColor: BRAND.fuchsia, gradient: null },
  { name: "Turquoise / Noir", dotsColor: BRAND.turquoise, bgColor: BRAND.noir, gradient: null },
  { name: "Mauve / Noir", dotsColor: BRAND.mauve, bgColor: BRAND.noir, gradient: null },
  { name: "Beige / Crimson", dotsColor: BRAND.beige, bgColor: BRAND.crimson, gradient: null },
  {
    name: "Dégradé Fuchsia→Mauve",
    dotsColor: BRAND.fuchsia,
    bgColor: BRAND.beige,
    gradient: { from: BRAND.fuchsia, to: BRAND.mauve },
  },
  {
    name: "Dégradé Fuchsia→Turquoise",
    dotsColor: BRAND.fuchsia,
    bgColor: BRAND.noir,
    gradient: { from: BRAND.fuchsia, to: BRAND.turquoise },
  },
];

// Pastilles de palette pour le réglage manuel des couleurs.
export const SWATCHES: { name: string; value: string }[] = [
  { name: "Fuchsia", value: BRAND.fuchsia },
  { name: "Beige", value: BRAND.beige },
  { name: "Noir", value: BRAND.noir },
  { name: "Turquoise", value: BRAND.turquoise },
  { name: "Mauve", value: BRAND.mauve },
  { name: "Crimson", value: BRAND.crimson },
  { name: "Blanc", value: BRAND.blanc },
];
