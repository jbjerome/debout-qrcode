import { useCallback, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import Controls from "./components/Controls";
import QrPreview from "./components/QrPreview";
import { BRAND } from "./lib/brand";
import type { QrSettings } from "./lib/qr";

const DEFAULTS: QrSettings = {
  url: "https://nouspresident.fr",
  size: 320,
  dotsColor: BRAND.fuchsia,
  bgColor: BRAND.beige,
  gradient: null,
  transparentBg: false,
  dotsType: "square",
};

export default function App() {
  const [settings, setSettings] = useState<QrSettings>(DEFAULTS);
  const qrRef = useRef<QRCodeStyling | null>(null);

  // Stable : évite que QrPreview se recrée à chaque rendu.
  const handleReady = useCallback((qr: QRCodeStyling) => {
    qrRef.current = qr;
  }, []);

  const handleDownload = (extension: "png" | "svg") => {
    qrRef.current?.download({ name: "qr-code-debout", extension });
  };

  return (
    <main className="app">
      <header className="header">
        <span className="badge">D!</span>
        <div>
          <h1>Générateur de QR code</h1>
          <p className="subtitle">Aux couleurs de Debout! — télécharge en PNG ou SVG.</p>
        </div>
      </header>

      <div className="layout">
        <QrPreview settings={settings} onReady={handleReady} />
        <Controls settings={settings} onChange={setSettings} onDownload={handleDownload} />
      </div>

      <footer className="footer">
        <span aria-hidden="true">✊</span> Développé par JB — Comtois Debout —
        jean-baptiste(at)iweez.fr
      </footer>
    </main>
  );
}
