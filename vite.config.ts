import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `host: true` est requis pour exposer le serveur Vite hors du conteneur Docker.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
