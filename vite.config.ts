import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `host: true` est requis pour exposer le serveur Vite hors du conteneur Docker.
// `base` : "/" partout. Le site GitHub Pages est servi à la racine du domaine
// custom (qrcode.comtoisdebout.fr), comme le build Docker derrière nginx.
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
