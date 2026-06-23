import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `host: true` est requis pour exposer le serveur Vite hors du conteneur Docker.
// `base` : la racine "/" pour le dev et le build Docker (servi à la racine par nginx),
// "/debout-qrcode/" uniquement pour le déploiement GitHub Pages (variable posée par le workflow).
export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/debout-qrcode/" : "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
