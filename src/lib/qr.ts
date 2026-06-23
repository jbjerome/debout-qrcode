import type { Gradient } from "./brand";
import type { IconKey } from "./icons";

// Sous-ensemble de types de modules proposés dans l'UI.
export type DotsType = "square" | "rounded" | "extra" | "dots";

export const DOT_STYLES: { value: DotsType; label: string }[] = [
  { value: "square", label: "Carré plein" },
  { value: "rounded", label: "Arrondi" },
  { value: "extra", label: "Extra arrondi" },
  { value: "dots", label: "Points" },
];

// Forme des motifs de repérage (les 3 « gros carrés »).
export type CornerStyle = "auto" | "square";

export const CORNER_STYLES: { value: CornerStyle; label: string }[] = [
  { value: "auto", label: "Selon les modules" },
  { value: "square", label: "Carré arrondi" },
];

export type QrSettings = {
  url: string;
  size: number;
  dotsColor: string;
  bgColor: string;
  gradient: Gradient | null;
  transparentBg: boolean;
  dotsType: DotsType;
  cornerColor: string;
  cornerStyle: CornerStyle;
  icon: IconKey;
  iconColor: string;
};
