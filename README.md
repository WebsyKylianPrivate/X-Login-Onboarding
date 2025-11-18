# X-Login-Onboarding

Monorepo pour X Login Onboarding - Mini App Telegram.

## Structure

```
.
├── mini-app/          # Mini App Telegram (frontend)
│   ├── src/          # Code source React TypeScript
│   ├── server/       # Backend Express
│   ├── redis/        # Service Redis
│   └── package.json
└── package.json      # Scripts racine
```

## Installation

```bash
# À la racine
npm install

# Dans mini-app
cd mini-app
npm install
```

## Scripts

```bash
# Depuis la racine
npm run dev      # Démarrer mini-app en dev
npm run build    # Build mini-app
npm run deploy   # Déployer mini-app

# Depuis mini-app/
cd mini-app
npm run dev      # Développement
npm run build    # Build production
npm run deploy   # Déployer sur GitHub Pages
```

## Déploiement

Le déploiement se fait automatiquement via GitHub Actions sur chaque push vers `main`.

Le workflow se trouve dans `.github/workflows/github-pages-deploy.yml` et build depuis `mini-app/`.
