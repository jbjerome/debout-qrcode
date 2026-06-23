import markRaw from "../../assets/icon.svg?raw";
import dRaw from "../../assets/icon-d.svg?raw";

export type IconKey = "none" | "mark" | "d";

export const ICONS: { value: IconKey; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "mark", label: "Symbole !" },
  { value: "d", label: "Logo D!" },
];

const RAW: Record<Exclude<IconKey, "none">, string> = { mark: markRaw, d: dRaw };

// Les icônes n'utilisent qu'une couleur (#f05059) : on la remplace par la couleur choisie.
function recolor(svg: string, color: string): string {
  return svg.replace(/#f05059/gi, color);
}

function parseViewBox(svg: string): [number, number, number, number] {
  const raw = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 1 1";
  const [a, b, c, d] = raw.split(/\s+/).map(Number);
  return [a, b, c, d];
}

// Contour externe sans `paint-order` (non supporté par Illustrator) : on superpose
// deux tracés. Dessous, une copie « grossie » couleur du contour (fill + stroke) ;
// dessus, l'icône d'origine. Seule la partie externe du stroke reste visible.
export function outline(inner: string, color: string, width: number): string {
  const bottom = inner
    .replace(/style="fill:[^"]*"/i, `style="fill:${color};"`)
    .replace(
      /<path /g,
      `<path stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" `,
    );
  return bottom + inner;
}

// SVG complet recoloré → data URL (utilisé pour le logo du titre via <img>).
// Si `outline` est fourni, on épaissit le viewBox pour ne pas rogner le contour.
export function iconDataUrl(
  key: IconKey,
  color: string,
  outlineColor?: string,
): string | undefined {
  if (key === "none") return undefined;
  const raw = recolor(RAW[key], color);
  if (!outlineColor) return `data:image/svg+xml,${encodeURIComponent(raw)}`;

  // viewBox élargi pour ne pas rogner le halo, contour via deux tracés superposés.
  const [minX, minY, w, h] = parseViewBox(raw);
  const stroke = Math.min(w, h) * 0.22;
  const pad = stroke / 2;
  const vb = `${minX - pad} ${minY - pad} ${w + stroke} ${h + stroke}`;
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">` +
    outline(inner, outlineColor, stroke) +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// viewBox + dimensions + contenu interne recoloré (pour inliner dans le SVG « propre »).
export function iconParts(
  key: IconKey,
  color: string,
): { viewBox: string; inner: string; vbMax: number } | null {
  if (key === "none") return null;
  const raw = recolor(RAW[key], color);
  const [, , w, h] = parseViewBox(raw);
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 1 1";
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { viewBox, inner, vbMax: Math.max(w, h) };
}
