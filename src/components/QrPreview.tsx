import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";
import { buildOptions, createQr, type QrSettings } from "../lib/qr";
import { buildCleanSvg, downloadCleanPng, downloadCleanSvg } from "../lib/cleanQr";

const NAME = "qr-code-debout";

export type Downloader = (extension: "png" | "svg") => void;

type Props = {
  settings: QrSettings;
  onReady: (download: Downloader) => void;
};

export default function QrPreview({ settings, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const prev = useRef({ clean: settings.dotsType === "square", gradient: !!settings.gradient });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Mode "Carré plein" : SVG maison, modules fusionnés en un seul tracé.
    if (settings.dotsType === "square") {
      qrRef.current = null;
      el.innerHTML = buildCleanSvg(settings);
      onReady((ext) =>
        ext === "svg" ? downloadCleanSvg(settings, NAME) : downloadCleanPng(settings, NAME),
      );
    } else {
      // Modes arrondi/points : qr-code-styling.
      // On recrée l'instance si on arrive du mode propre ou si le dégradé bascule
      // (update() ne supprime pas un dégradé existant).
      const needNew =
        !qrRef.current || prev.current.clean || !!settings.gradient !== prev.current.gradient;
      if (needNew) {
        const qr = createQr(settings);
        qrRef.current = qr;
        el.innerHTML = "";
        qr.append(el);
      } else {
        qrRef.current?.update(buildOptions(settings));
      }
      onReady((ext) => qrRef.current?.download({ name: NAME, extension: ext }));
    }

    prev.current = { clean: settings.dotsType === "square", gradient: !!settings.gradient };
  }, [settings, onReady]);

  return (
    <div
      ref={containerRef}
      className={`qr-preview${settings.transparentBg ? " qr-preview--transparent" : ""}`}
      aria-label="Aperçu du QR code"
    />
  );
}
