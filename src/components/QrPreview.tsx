import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";
import { buildOptions, createQr, type QrSettings } from "../lib/qr";

type Props = {
  settings: QrSettings;
  onReady: (qr: QRCodeStyling) => void;
};

export default function QrPreview({ settings, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const hadGradient = useRef<boolean>(!!settings.gradient);

  const mount = (qr: QRCodeStyling) => {
    qrRef.current = qr;
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qr.append(containerRef.current);
    }
    onReady(qr);
  };

  // Montage initial.
  useEffect(() => {
    mount(createQr(settings));
    hadGradient.current = !!settings.gradient;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour à chaque changement de réglage.
  useEffect(() => {
    const gradientToggled = !!settings.gradient !== hadGradient.current;
    if (gradientToggled) {
      // update() fusionne les options et ne supprime pas un dégradé existant :
      // on recrée l'instance quand on bascule dégradé ↔ couleur unie.
      mount(createQr(settings));
    } else {
      qrRef.current?.update(buildOptions(settings));
    }
    hadGradient.current = !!settings.gradient;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, onReady]);

  return (
    <div
      ref={containerRef}
      className={`qr-preview${settings.transparentBg ? " qr-preview--transparent" : ""}`}
      aria-label="Aperçu du QR code"
    />
  );
}
