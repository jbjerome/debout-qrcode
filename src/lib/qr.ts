import type { Gradient } from "./brand";
import type { IconKey } from "./icons";

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
  icon: IconKey;
  iconColor: string;
};
