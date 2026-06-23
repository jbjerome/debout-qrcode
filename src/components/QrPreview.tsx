import { useEffect, useRef } from "react";
import type { QrSettings } from "../lib/qr";
import { buildCleanSvg, downloadCleanPng, downloadCleanSvg } from "../lib/cleanQr";

const NAME = "qr-code-debout";

export type Downloader = (extension: "png" | "svg") => void;

type Props = {
  settings: QrSettings;
  onReady: (download: Downloader) => void;
};

export default function QrPreview({ settings, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = buildCleanSvg(settings);
    onReady((ext) =>
      ext === "svg" ? downloadCleanSvg(settings, NAME) : downloadCleanPng(settings, NAME),
    );
  }, [settings, onReady]);

  return (
    <div
      ref={containerRef}
      className={`qr-preview${settings.transparentBg ? " qr-preview--transparent" : ""}`}
      aria-label="Aperçu du QR code"
    />
  );
}
