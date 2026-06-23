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

// Ajoute un contour (stroke) au(x) path(s). paint-order="stroke" → le remplissage
// recouvre la moitié interne, ne laissant visible que la moitié externe du trait.
export function addStroke(inner: string, color: string, width: number): string {
  return inner.replace(
    /<path /g,
    `<path stroke="${color}" stroke-width="${width}" paint-order="stroke" ` +
      `stroke-linejoin="round" stroke-linecap="round" `,
  );
}

// SVG complet recoloré → data URL (pour l'option `image` de qr-code-styling).
// Si `outline` est fourni, on épaissit le viewBox pour ne pas rogner le contour.
export function iconDataUrl(
  key: IconKey,
  color: string,
  outline?: string,
): string | undefined {
  if (key === "none") return undefined;
  let svg = recolor(RAW[key], color);
  if (outline) {
    const [minX, minY, w, h] = parseViewBox(svg);
    const stroke = Math.min(w, h) * 0.22;
    const pad = stroke / 2;
    const vb = `${minX - pad} ${minY - pad} ${w + stroke} ${h + stroke}`;
    svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${vb}"`);
    svg = addStroke(svg, outline, stroke);
  }
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
