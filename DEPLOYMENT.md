# Phendelver and Below - Deployment Guide

Questa applicazione supporta tre modalità di distribuzione: PWA, GitHub Pages, ed Electron Desktop App.

## 📱 PWA (Progressive Web App)

L'applicazione è configurata come PWA e può essere installata su dispositivi mobili e desktop.

### Build PWA
```bash
npm run build:prod
```

Il service worker verrà automaticamente generato e l'app sarà installabile dai browser supportati.

### Test PWA locale
1. Build dell'app: `npm run build:prod`
2. Servire con un server HTTPS (richiesto per PWA)
3. Visitare l'URL e cliccare "Installa" nel browser

## 🌐 GitHub Pages

### Setup iniziale su GitHub
1. Vai su Settings → Pages nel tuo repository
2. Seleziona "GitHub Actions" come source
3. Il workflow `.github/workflows/deploy.yml` si attiverà automaticamente ad ogni push su `main`

### Build e Deploy manuale
```bash
# Build per GitHub Pages
npm run build:gh-pages

# Output in: dist/angular-phendelver/browser/
```

Il file `404.html` viene creato automaticamente per gestire il routing SPA.

**URL finale**: `https://dileo95.github.io/SID_Phendelver/`

### Note importanti
- Il routing funziona tramite la copia di `index.html` in `404.html`
- Il `base-href` è impostato su `/SID_Phendelver/`
- File `.nojekyll` previene l'elaborazione Jekyll

## 🖥️ Electron Desktop App

L'applicazione può essere impacchettata come app desktop per Windows, Mac e Linux.

### Sviluppo
```bash
# Build Angular + avvia Electron
npm run electron:build
```

### Packaging per distribuzione

#### Windows (.exe)
```bash
npm run electron:package:win
```
Output: `release/Phendelver Setup X.X.X.exe`

#### Mac (.dmg)
```bash
npm run electron:package:mac
```
Output: `release/Phendelver-X.X.X.dmg`

#### Linux (.AppImage)
```bash
npm run electron:package:linux
```
Output: `release/Phendelver-X.X.X.AppImage`

#### Tutti i sistemi
```bash
npm run electron:package
```

### Caratteristiche Electron
- Finestra 1200x800 (minimo 800x600)
- Icona personalizzata
- Background scuro (#121212)
- Context isolation abilitato
- Node integration disabilitato (sicurezza)

## 📦 File di configurazione

- **PWA**: `ngsw-config.json`, `public/manifest.webmanifest`
- **GitHub Pages**: `.github/workflows/deploy.yml`, `public/.nojekyll`
- **Electron**: `electron-main.js`, sezione `build` in `package.json`

## 🚀 Scripts disponibili

| Script | Descrizione |
|--------|-------------|
| `npm start` | Dev server (localhost:4200) |
| `npm run build:prod` | Build produzione (con PWA) |
| `npm run build:gh-pages` | Build per GitHub Pages |
| `npm run electron:build` | Build + avvia Electron |
| `npm run electron:package:win` | Crea installer Windows |
| `npm run electron:package:mac` | Crea installer Mac |
| `npm run electron:package:linux` | Crea installer Linux |

## ⚙️ Requisiti

- Node.js 20+
- npm 10+
- Per build Mac: macOS
- Per build Windows: Windows o Wine
- Per build Linux: Linux o Docker

## 🔐 Autenticazione PIN

Il PIN di autenticazione è gestito lato frontend e funziona in tutte e tre le modalità di deployment.
