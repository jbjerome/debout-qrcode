import qrcode from "qrcode-generator";
import type { QrSettings } from "./qr";
import { addStroke, iconParts } from "./icons";

// Le typage @types/qrcode-generator n'expose pas ces méthodes : on les déclare.
interface QrModel {
  addData(data: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

const QUIET = 4; // zone calme en nombre de modules (recommandé pour la lecture)

// Génère un SVG minimal : un SEUL <path> où les modules d'une même ligne sont
// fusionnés en runs. Une seule zone de remplissage → aucune couture entre modules.
export function buildCleanSvg(settings: QrSettings): string {
  const { url, size, dotsColor, gradient, transparentBg, bgColor } = settings;

  const qr = qrcode(0, "Q") as unknown as QrModel;
  qr.addData(url || " ");
  qr.make();
  const n = qr.getModuleCount();
  const dim = n + QUIET * 2;

  // Zone centrale réservée à l'icône (modules « creusés » pour la lisibilité).
  // Séparation icône/modules : contour couleur du fond, sauf fond transparent
  // où l'on retombe sur une marge d'1 module.
  const parts = iconParts(settings.icon, settings.iconColor);
  const useOutline = parts !== null && !settings.transparentBg;
  const iconModules = parts ? Math.round(n * 0.32) : 0;
  const margin = parts && !useOutline ? 1 : 0;
  const box = iconModules + margin * 2;
  const from = Math.floor((n - box) / 2);
  const to = from + box;
  const reserved = (r: number, c: number) => parts !== null && r >= from && r < to && c >= from && c < to;

  let d = "";
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (qr.isDark(r, c) && !reserved(r, c)) {
        let len = 1;
        while (c + len < n && qr.isDark(r, c + len) && !reserved(r, c + len)) len++;
        d += `M${c + QUIET} ${r + QUIET}h${len}v1h-${len}z`;
        c += len;
      } else {
        c++;
      }
    }
  }

  // Icône centrée, recolorée. Avec contour (couleur du fond) si non transparent.
  let iconEl = "";
  if (parts) {
    const pos = from + margin + QUIET;
    let inner = parts.inner;
    if (useOutline) {
      // ~0,55 module de contour visible (paint-order=stroke → moitié externe visible).
      const strokeVb = (2 * 0.55 * parts.vbMax) / iconModules;
      inner = addStroke(inner, settings.bgColor, strokeVb);
    }
    iconEl =
      `<svg x="${pos}" y="${pos}" width="${iconModules}" height="${iconModules}" viewBox="${parts.viewBox}" ` +
      `preserveAspectRatio="xMidYMid meet" overflow="visible">${inner}</svg>`;
  }

  const gradId = "qr-grad";
  const fill = gradient ? `url(#${gradId})` : dotsColor;
  const defs = gradient
    ? `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${gradient.from}"/>` +
      `<stop offset="1" stop-color="${gradient.to}"/>` +
      `</linearGradient></defs>`
    : "";
  const bg = transparentBg ? "" : `<rect width="${dim}" height="${dim}" fill="${bgColor}"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges">` +
    defs +
    bg +
    `<path d="${d}" fill="${fill}"/>` +
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
