import qrcode from "qrcode-generator";
import type { QrSettings } from "./qr";
import { iconParts, outline } from "./icons";

// Rectangle à coins arrondis (tracé fermé).
function rrect(x: number, y: number, w: number, h: number, r: number): string {
  return (
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}` +
    `v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}` +
    `a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
  );
}

// Motif de repérage style « carré arrondi Debout », conforme au ratio 1:1:3:1:1 :
// cadre arrondi 7×7 (bord 1 module, troué) + point central arrondi 3×3.
function finderEye(x: number, y: number): string {
  const ring = `<path fill-rule="evenodd" d="${rrect(x, y, 7, 7, 2)}${rrect(x + 1, y + 1, 5, 5, 1.3)}"/>`;
  const dot = `<path d="${rrect(x + 2, y + 2, 3, 3, 0.85)}"/>`;
  return ring + dot;
}

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

// État d'un coin de cellule : true = arrondi (convexe), false = carré.
const A = 0.5; // rayon (= moitié d'un module → arrondi maximal)

// Tracé d'une cellule 1×1 ; seuls les coins convexes (deux voisins absents) sont arrondis.
// in/out = points de raccord sur les arêtes ; pour un coin carré, in = out = sommet.
function cellPath(x: number, y: number, tl: boolean, tr: boolean, br: boolean, bl: boolean): string {
  const x1 = x + 1;
  const y1 = y + 1;
  const corners = [
    { st: tl, vx: x, vy: y, inx: x, iny: y + A, outx: x + A, outy: y },
    { st: tr, vx: x1, vy: y, inx: x1 - A, iny: y, outx: x1, outy: y + A },
    { st: br, vx: x1, vy: y1, inx: x1, iny: y1 - A, outx: x1 - A, outy: y1 },
    { st: bl, vx: x, vy: y1, inx: x + A, iny: y1, outx: x, outy: y1 - A },
  ].map((k) =>
    k.st ? { in: [k.inx, k.iny], out: [k.outx, k.outy], st: k.st } : { in: [k.vx, k.vy], out: [k.vx, k.vy], st: k.st },
  );

  const arc = (k: (typeof corners)[number]) =>
    k.st ? `A${A} ${A} 0 0 1 ${k.out[0]} ${k.out[1]}` : "";

  const [TL, TR, BR, BL] = corners;
  let p = `M${TL.out[0]} ${TL.out[1]}`;
  p += `L${TR.in[0]} ${TR.in[1]}${arc(TR)}`;
  p += `L${BR.in[0]} ${BR.in[1]}${arc(BR)}`;
  p += `L${BL.in[0]} ${BL.in[1]}${arc(BL)}`;
  p += `L${TL.in[0]} ${TL.in[1]}${arc(TL)}`;
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

  // Les motifs de repérage (gros carrés) ont leur propre tracé → couleur dédiée.
  // En mode carré ils restent carrés ; sinon ils sont arrondis comme les modules.
  const cell = (r: number, c: number) => {
    const up = dark(r - 1, c);
    const dn = dark(r + 1, c);
    const le = dark(r, c - 1);
    const ri = dark(r, c + 1);
    return cellPath(c + QUIET, r + QUIET, !up && !le, !up && !ri, !dn && !ri, !dn && !le);
  };

  const logoFinder = settings.cornerStyle === "square";

  let finderPath = "";
  let dataPath = "";
  let dataShapes = "";
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!dark(r, c)) {
        c++;
        continue;
      }
      const fin = isFinder(r, c, n);
      if (fin && logoFinder) {
        c++;
        continue;
      }
      if (dotsType === "square") {
        // Runs fusionnés, sans franchir la frontière repère/données.
        let len = 1;
        while (dark(r, c + len) && isFinder(r, c + len, n) === fin) len++;
        const run = `M${c + QUIET} ${r + QUIET}h${len}v1h-${len}z`;
        if (fin) finderPath += run;
        else dataPath += run;
        c += len;
      } else if (fin) {
        // Repères : arrondis pour rester lisibles.
        finderPath += cell(r, c);
        c++;
      } else if (dotsType === "dots") {
        dataShapes += `<circle cx="${c + QUIET + 0.5}" cy="${r + QUIET + 0.5}" r="0.45"/>`;
        c++;
      } else {
        // Arrondi : cellule aux coins extérieurs arrondis.
        dataPath += cell(r, c);
        c++;
      }
    }
  }

  // Repères « carré arrondi » aux 3 emplacements (7×7 modules chacun).
  let finderShapes = "";
  if (logoFinder) {
    for (const [fr, fc] of [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ]) {
      finderShapes += finderEye(fc + QUIET, fr + QUIET);
    }
  }

  const gradId = "qr-grad";
  const dataFill = gradient ? `url(#${gradId})` : dotsColor;
  const defs = gradient
    ? `<defs><linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${dim}" y2="${dim}">` +
      `<stop offset="0" stop-color="${gradient.from}"/>` +
      `<stop offset="1" stop-color="${gradient.to}"/>` +
      `</linearGradient></defs>`
    : "";
  const bg = transparentBg ? "" : `<rect width="${dim}" height="${dim}" fill="${bgColor}"/>`;
  const modules =
    (finderPath ? `<path d="${finderPath}" fill="${settings.cornerColor}"/>` : "") +
    (finderShapes ? `<g fill="${settings.cornerColor}">${finderShapes}</g>` : "") +
    (dataPath ? `<path d="${dataPath}" fill="${dataFill}"/>` : "") +
    (dataShapes ? `<g fill="${dataFill}">${dataShapes}</g>` : "");

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
