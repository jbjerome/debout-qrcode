# Générateur de QR code — Debout!

Application front statique (React + Vite + TypeScript) qui génère un QR code à partir d'une URL via [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) et permet de le télécharger en **PNG** ou **SVG**.

Le QR est entièrement généré côté navigateur : aucune URL saisie n'est transmise à un serveur.

## Charte graphique

L'interface et les QR codes reprennent la charte **Debout!** :

- **Presets biton** prêts à l'emploi (couleur des modules + couleur de fond), dont deux dégradés deux tons (Fuchsia→Mauve, Fuchsia→Turquoise).
- **Palette** : Hot Fuchsia `#ff4d56`, Antique White `#f9f7e4`, Noir `#000000`, Turquoise `#5fccb7`, Mauve `#de6ef9`, Crimson `#3a0a23`.
- Réglage manuel possible des couleurs modules/fond et de la taille.
- Typo **Inter** auto-hébergée (`@fontsource/inter`, pas de CDN Google → conforme RGPD).

Les couleurs et presets sont centralisés dans `src/lib/brand.ts`. Pour la lecture, privilégier les combinaisons à fort contraste (ex. Noir/Beige) ; le niveau de correction d'erreur est réglé sur `Q` pour la robustesse.

## Développement

Avec Docker (hot reload Vite) :

```bash
docker compose up dev
# → http://localhost:5173
```

En local (sans Docker) :

```bash
npm install
npm run dev
```

## Production

Build et exécution de l'image nginx :

```bash
docker compose up --build prod
# → http://localhost:9000
```

Ou directement avec Docker :

```bash
docker build -t qrcode .
docker run -p 9000:80 qrcode
```

## Structure

```
src/
├── App.tsx                 état { url, size, dotsColor, bgColor, gradient }
├── components/
│   ├── QrPreview.tsx       aperçu live (qr-code-styling)
│   └── Controls.tsx        URL, presets, palette, couleurs, taille, téléchargement
└── lib/
    ├── brand.ts            palette Debout! + presets biton
    └── qr.ts               configuration et instanciation du QR (uni ou dégradé)
```
