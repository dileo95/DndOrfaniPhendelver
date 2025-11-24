# 🐉 Phendelver - D&D Campaign Companion

Una Progressive Web App interattiva per la campagna D&D "Gli Orfani di Phendelver". Costruita con Angular 20, questa applicazione offre un'esperienza immersiva per giocatori e master con gestione personaggi, combattimento dinamico, e visualizzazioni interattive della storia. Questa applicazione è costruita specificamente per un uso personale nella attuale campagna che sto portando avanti.

## ✨ Caratteristiche Principali

### 🎮 Sistema di Combattimento
- **Combat Game con Phaser.js**: Sistema di combattimento turn-based con grafica 2D
- **Sprite Animati**: Personaggi con animazioni LPC (idle, attack, spell, hurt)
- **Calcolo Automatico**: Tiri per colpire, danni, AC e HP basati su D&D 5e
- **Musica di Sottofondo**: Atmosfera immersiva durante i combattimenti
- **Sprite Dinamici**: Ogni personaggio usa il proprio sprite (Asriel, Ruben, ecc.)

### 📋 Gestione Personaggi
- **Schede Complete D&D 5e**: Caratteristiche, abilità, competenze, HP, AC
- **4 Personaggi Giocabili**: Asriel (Warlock), Auryn, Ravel, Ruben
- **Editor Schede**: Modifica stats, armi, incantesimi, feature
- **Persistenza Locale**: Database IndexedDB con Dexie.js

### 📝 Sistema di Note
- **Appunti del Giocatore**: Crea, modifica ed elimina note personali
- **Organizzazione per Personaggio**: Note separate per ogni PG
- **Storage Persistente**: Salvataggio automatico locale

### 📚 Contenuti della Campagna
- **Storia del Personaggio**: Background e storia personale
- **Diario**: Antefatti, eventi, galleria immagini
- **Artbook**: Sfoglia le illustrazioni con PageFlip.js
- **Timeline Interattiva**: Visualizza eventi cronologici con D3.js
- **Mappa Relazioni**: Grafo interattivo di personaggi ed eventi (D3.js force-directed)

### 🎲 Altri Strumenti
- **Dado Virtuale**: Roll 3D animati per tutti i dadi (d4, d6, d8, d10, d12, d20, d100)
- **Carte Personaggio**: Visualizzazione stile trading card

## 🚀 Quick Start

### Installazione

```bash
# Clona il repository
git clone https://github.com/dileo95/DndOrfaniPhendelver.git
cd DndOrfaniPhendelver

# Installa le dipendenze
npm install

# Avvia il dev server
ng serve
```

Apri il browser su `http://localhost:4200/`

## 🎮 Come Usare l'App

1. **Login**: Seleziona il tuo personaggio e inserisci il PIN
2. **Home Personaggio**: Accedi a tutte le funzionalità del tuo PG
3. **Combattimento**: Usa le statistiche della tua scheda per combattere
4. **Note**: Prendi appunti durante le sessioni
5. **Esplora**: Naviga timeline, mappa relazioni e diario

## 🔧 Configurazione

### Variabili d'Ambiente
Crea un file `.env` (opzionale per feature future):
```
API_URL=https://your-api.com
FIREBASE_CONFIG=...
```

## 🛠️ Comandi Disponibili

```bash
# Development server
ng serve

# Build per produzione
ng build --configuration production

# Build per Electron desktop app
npm run electron:build

# Deploy su GitHub Pages
npm run deploy

# Lint del codice
ng lint

# Test
ng test
```

## 📦 Tecnologie Utilizzate

- **Angular 20** - Framework frontend
- **TypeScript** - Linguaggio di programmazione
- **Phaser.js 3** - Game engine per il combat system
- **D3.js** - Visualizzazioni interattive (timeline, grafo)
- **Dexie.js** - Wrapper per IndexedDB
- **PageFlip.js** - Effetto flip per l'artbook
- **Electron** - Build desktop app
- **SCSS** - Styling avanzato

## 📁 Struttura Progetto

```
src/
├── app/
│   ├── components/
│   │   ├── intro/              # Schermata iniziale
│   │   ├── character-home/     # Home del personaggio
│   │   ├── character-card/     # Carta personaggio
│   │   ├── character-dice/     # Dado virtuale
│   │   ├── character-history/  # Storia del personaggio
│   │   ├── player-notes/       # Note del giocatore
│   │   ├── character-sheet/    # Scheda D&D 5e
│   │   ├── combat-game/        # Sistema di combattimento
│   │   ├── story-map/          # Grafo interattivo
│   │   ├── timeline/           # Timeline eventi
│   │   ├── diary/              # Diario della campagna
│   │   └── gallery-artbook/    # Artbook sfogliabile
│   ├── services/
│   │   ├── database.service.ts    # Gestione IndexedDB
│   │   ├── story-parser.service.ts # Parser eventi/personaggi
│   │   └── scroll.ts              # Controllo scroll
│   └── guards/
│       └── auth.guard.ts          # Protezione route con PIN
├── assets/
│   ├── img/                    # Immagini e artwork
│   ├── spritesheet/            # Sprite LPC per combattimenti
│   ├── sound/                  # Musica di sottofondo
│   └── font/                   # Font personalizzati
└── styles.scss                 # Stili globali
```

## 🎯 Roadmap / TODO

### ✅ Completato
- [x] Sistema di autenticazione con PIN per personaggi
- [x] Database locale con Dexie (IndexedDB)
- [x] Schede personaggio complete D&D 5e
- [x] Sistema di note persistenti
- [x] Combat game turn-based con Phaser
- [x] Sprite animati per combattimenti (Asriel, Ruben)
- [x] Timeline interattiva con D3
- [x] Story Map con grafo force-directed
- [x] Dado virtuale 3D
- [x] Artbook sfogliabile
- [x] Responsive design

### 🚧 In Sviluppo
- [ ] Visual Novel con Ink.js per narrazione interattiva
- [ ] Sprite per Auryn e Ravel
- [ ] Sistema di nemici multipli nel combat
- [ ] Gestione spell slots nella scheda
- [ ] Export scheda personaggio in PDF

### 💡 Idee Future
- [ ] Multiplayer sync tramite Firebase
- [ ] Dice roller con cronologia
- [ ] Sistema di achievements
- [ ] Note condivise tra giocatori
- [ ] Mappa interattiva di Phendelver
- [ ] Inventory system
- [ ] Quest tracker

## 🎨 Credits

- **LPC Spritesheet Generator**: Character sprites
- **Morris Roman Font**: Font custom per titoli
- **D&D 5e SRD**: Regole e meccaniche di gioco

## 📄 Licenza

Questo progetto è privato e destinato all'uso personale per la campagna D&D.
