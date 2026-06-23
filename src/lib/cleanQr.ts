import qrcode from "qrcode-generator";
import type { QrSettings } from "./qr";
import { iconParts, outline } from "./icons";

// Le typage @types/qrcode-generator n'expose pas ces méthodes : on les déclare.
interface QrModel {
  addData(data: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

const QUIET = 4; // zone calme en nombre de modules (recommandé pour la lecture)

// Un module appartient-il à l'un des 3 motifs de repérage (7×7 aux coins) ?
// Ces motifs doivent rester pleins/carrés pour une lecture fiable.
function isFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

// Cellule 1×1 dont seuls les coins « convexes » (deux voisins absents) sont
// arrondis : les modules adjacents fusionnent en blocs aux coins arrondis.
function roundedCell(
  x: number,
  y: number,
  tl: boolean,
  tr: boolean,
  br: boolean,
  bl: boolean,
): string {
  const a = 0.5;
  const x1 = x + 1;
  const y1 = y + 1;
  let p = `M${x + (tl ? a : 0)} ${y}`;
  p += `H${x1 - (tr ? a : 0)}`;
  if (tr) p += `A${a} ${a} 0 0 1 ${x1} ${y + a}`;
  p += `V${y1 - (br ? a : 0)}`;
  if (br) p += `A${a} ${a} 0 0 1 ${x1 - a} ${y1}`;
  p += `H${x + (bl ? a : 0)}`;
  if (bl) p += `A${a} ${a} 0 0 1 ${x} ${y1 - a}`;
  p += `V${y + (tl ? a : 0)}`;
  if (tl) p += `A${a} ${a} 0 0 1 ${x + a} ${y}`;
  return p + "Z";
}

// Génère un SVG 100% vectoriel (aucun <image>, aucun <svg> imbriqué) :
// - modules carrés fusionnés en runs (un seul <path>) ;
// - modules arrondis / points en <rect rx>/<circle> pour les données, motifs de
//   repérage toujours pleins ;
// - icône inline en <g> de tracés (éditable / visible dans Illustrator).
export function buildCleanSvg(settings: QrSettings): string {
  const { url, size, dotsColor, gradient, transparentBg, bgColor, dotsType } = settings;

  const qr = qrcode(0, "Q") as unknown as QrModel;
  qr.addData(url || " ");
  qr.make();
  const n = qr.getModuleCount();
  const dim = n + QUIET * 2;

  // Zone centrale réservée à l'icône (modules « creusés » pour la lisibilité).
  // La zone épouse les dimensions réelles de l'icône (rectangle au ratio du viewBox),
  // pas un carré. Séparation icône/modules : contour couleur du fond, sauf fond
  // transparent où l'on retombe sur une marge d'1 module.
  const parts = iconParts(settings.icon, settings.iconColor);
  const useOutline = parts !== null && !settings.transparentBg;
  const margin = parts && !useOutline ? 1 : 0;

  let reserved = (_r: number, _c: number) => false;
  let iconEl = "";
  if (parts) {
    const [vbMinX, vbMinY, vbW, vbH] = parts.viewBox.split(/\s+/).map(Number);
    const iconMain = Math.round(n * 0.32); // taille le long du plus grand côté
    const s = iconMain / parts.vbMax;
    const iconWm = vbW * s;
    const iconHm = vbH * s;
    const boxW = Math.round(iconWm) + margin * 2;
    const boxH = Math.round(iconHm) + margin * 2;
    const fromC = Math.floor((n - boxW) / 2);
    const fromR = Math.floor((n - boxH) / 2);
    const toC = fromC + boxW;
    const toR = fromR + boxH;
    reserved = (r, c) => r >= fromR && r < toR && c >= fromC && c < toC;

    const ox = fromC + QUIET + (boxW - iconWm) / 2 - vbMinX * s;
    const oy = fromR + QUIET + (boxH - iconHm) / 2 - vbMinY * s;
    let inner = parts.inner;
    if (useOutline) {
      // ~0,55 module de contour externe visible.
      const strokeVb = (2 * 0.55 * parts.vbMax) / iconMain;
      inner = outline(inner, settings.bgColor, strokeVb);
    }
    iconEl = `<g transform="translate(${ox} ${oy}) scale(${s})">${inner}</g>`;
  }

  const dark = (r: number, c: number) =>
    r >= 0 && r < n && c >= 0 && c < n && qr.isDark(r, c) && !reserved(r, c);

  // Un module est rendu en « plein » (path fusionné) s'il est carré, ou s'il
  // appartient à un motif de repérage. Sinon en forme (rond/arrondi).
  const asSquare = (r: number, c: number) => dotsType === "square" || isFinder(r, c, n);

  let d = "";
  let shapes = "";
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!dark(r, c)) {
        c++;
        continue;
      }
      if (asSquare(r, c)) {
        let len = 1;
        while (dark(r, c + len) && asSquare(r, c + len)) len++;
        d += `M${c + QUIET} ${r + QUIET}h${len}v1h-${len}z`;
        c += len;
      } else if (dotsType === "dots") {
        shapes += `<circle cx="${c + QUIET + 0.5}" cy="${r + QUIET + 0.5}" r="0.45"/>`;
        c++;
      } else {
        // Arrondi : coins extérieurs (deux voisins absents) seulement.
        const up = dark(r - 1, c);
        const dn = dark(r + 1, c);
        const le = dark(r, c - 1);
        const ri = dark(r, c + 1);
        d += roundedCell(c + QUIET, r + QUIET, !up && !le, !up && !ri, !dn && !ri, !dn && !le);
        c++;
      }
    }
  }

  const gradId = "qr-grad";
  const fill = gradient ? `url(#${gradId})` : dotsColor;
  const defs = gradient
    ? `<defs><linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${dim}" y2="${dim}">` +
      `<stop offset="0" stop-color="${gradient.from}"/>` +
      `<stop offset="1" stop-color="${gradient.to}"/>` +
      `</linearGradient></defs>`
    : "";
  const bg = transparentBg ? "" : `<rect width="${dim}" height="${dim}" fill="${bgColor}"/>`;
  const modules =
    (d ? `<path d="${d}" fill="${fill}"/>` : "") +
    (shapes ? `<g fill="${fill}">${shapes}</g>` : "");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${dim} ${dim}">` +
    defs +
    bg +
    modules +
    iconEl +
    `</svg>`
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadCleanSvg(settings: QrSettings, name: string) {
  const blob = new Blob([buildCleanSvg(settings)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${name}.svg`);
  URL.revokeObjectURL(url);
}

export function downloadCleanPng(settings: QrSettings, name: string) {
  const blob = new Blob([buildCleanSvg(settings)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = settings.size;
    canvas.height = settings.size;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(img, 0, 0, settings.size, settings.size);
    URL.revokeObjectURL(url);
    canvas.toBlob((png) => {
      if (!png) return;
      const pngUrl = URL.createObjectURL(png);
      triggerDownload(pngUrl, `${name}.png`);
      URL.revokeObjectURL(pngUrl);
    });
  };
  img.src = url;
}
