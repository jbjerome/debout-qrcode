import QRCodeStyling, { type Options } from "qr-code-styling";
import type { Gradient } from "./brand";

// Sous-ensemble de types de modules proposés dans l'UI.
export type DotsType = "square" | "rounded" | "dots";

export const DOT_STYLES: { value: DotsType; label: string }[] = [
  { value: "square", label: "Carré plein" },
  { value: "rounded", label: "Arrondi" },
  { value: "dots", label: "Points" },
];

export type QrSettings = {
  url: string;
  size: number;
  dotsColor: string;
  bgColor: string;
  gradient: Gradient | null;
  transparentBg: boolean;
  dotsType: DotsType;
};

export function buildOptions({
  url,
  size,
  dotsColor,
  bgColor,
  gradient,
  transparentBg,
  dotsType,
}: QrSettings): Options {
  // Le fill des modules : dégradé deux tons si défini, sinon couleur unie.
  const fill = gradient
    ? {
        gradient: {
          type: "linear" as const,
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: gradient.from },
            { offset: 1, color: gradient.to },
          ],
        },
      }
    : { color: dotsColor };

  // En "Carré plein", on garde les coins carrés pour un rendu sans interstices.
  const solid = dotsType === "square";
  const cornerColor = gradient ? gradient.from : dotsColor;

  return {
    width: size,
    height: size,
    type: "svg",
    data: url,
    margin: 12,
    // Niveau de correction élevé : robustesse accrue, utile pour les combos colorés.
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { type: dotsType, ...fill },
    backgroundOptions: { color: transparentBg ? "transparent" : bgColor },
    cornersSquareOptions: { color: cornerColor, type: solid ? "square" : "extra-rounded" },
    cornersDotOptions: { color: cornerColor, type: solid ? "square" : "dot" },
  };
}

export function createQr(settings: QrSettings): QRCodeStyling {
  return new QRCodeStyling(buildOptions(settings));
}
