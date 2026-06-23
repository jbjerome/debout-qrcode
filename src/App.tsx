import { useCallback, useRef, useState } from "react";
import Controls from "./components/Controls";
import QrPreview, { type Downloader } from "./components/QrPreview";
import { BRAND } from "./lib/brand";
import { iconDataUrl } from "./lib/icons";
import type { QrSettings } from "./lib/qr";

const DEFAULTS: QrSettings = {
  url: "https://nouspresident.fr",
  size: 320,
  dotsColor: BRAND.fuchsia,
  bgColor: BRAND.beige,
  gradient: null,
  transparentBg: false,
  dotsType: "square",
  cornerColor: BRAND.fuchsia,
  cornerStyle: "auto",
  icon: "none",
  iconColor: BRAND.noir,
};

export default function App() {
  const [settings, setSettings] = useState<QrSettings>(DEFAULTS);
  const downloadRef = useRef<Downloader>(() => {});

  // Stable : évite que QrPreview se recrée à chaque rendu.
  const handleReady = useCallback((download: Downloader) => {
    downloadRef.current = download;
  }, []);

  const handleDownload = (extension: "png" | "svg") => {
    downloadRef.current(extension);
  };

  return (
    <main className="app">
      <header className="header">
        <span className="badge">
          <img src={iconDataUrl("d", BRAND.beige)} alt="Debout!" />
        </span>
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
        <p>
          <span aria-hidden="true">✊</span> Développé par JB — Comtois Debout —
          jean-baptiste(at)iweez.fr
        </p>
        <p>
          <a href="https://github.com/jbjerome/debout-qrcode" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {" · "}
          <a
            href="https://github.com/jbjerome/debout-qrcode/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            Licence GPL-3.0
          </a>
        </p>
      </footer>
    </main>
  );
}
