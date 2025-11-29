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
- **Bestiario**: Catalogo completo dei nemici con lore, statistiche e artwork

### 🎲 Altri Strumenti
- **Dado Virtuale**: Roll 3D animati per tutti i dadi (d4, d6, d8, d10, d12, d20, d100)
- **Carte Personaggio**: Visualizzazione stile trading card
- **Comandi Vocali**: Controllo hands-free con Web Speech API (tira dadi, leggi HP, naviga)

### 🐲 Sistema Draghi (Combat)
- **20 Draghi Giocabili**: Wyrmling e Young di tutti i 10 tipi cromatici/metallici
- **Breath Weapon**: Meccanica soffio con ricarica 5-6, tiro salvezza DEX
- **Effetti Visivi**: Animazioni fuoco, fulmine, ghiaccio, acido, veleno

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
- **Web Speech API** - Comandi vocali e sintesi vocale
- **Electron** - Build desktop app
- **SCSS** - Styling avanzato
- **PWA** - Progressive Web App con Service Worker

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
│   │   ├── gallery-artbook/    # Artbook sfogliabile
│   │   ├── bestiary/           # Catalogo nemici con lore
│   │   ├── voice-button/       # Pulsante comandi vocali
│   │   ├── voice-help-modal/   # Tutorial comandi vocali
│   │   ├── toast/              # Notifiche toast
│   │   └── offline-indicator/  # Indicatore stato offline
│   ├── services/
│   │   ├── database.service.ts    # Gestione IndexedDB
│   │   ├── story-parser.service.ts # Parser eventi/personaggi
│   │   ├── toast.service.ts       # Gestione notifiche
│   │   ├── voice.service.ts       # Riconoscimento vocale
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
- [x] Story Map con grafo force-directed + zoom/pan/search
- [x] Dado virtuale 3D
- [x] Artbook sfogliabile
- [x] Responsive design
- [x] Migrazione SCSS da @import a @use
- [x] Combat: Sistema nemici (12 tipi con CR 1/4 a CR 5)
- [x] Combat: Selezione nemico con card colorate
- [x] Combat: Integrazione armi dal Character Sheet
- [x] Combat: Sistema magie con cantrip e spell slots
- [x] Combat: Azioni Difesa (+2 CA) e Pozione (2d4+2)
- [x] Combat: Turni nemico automatici con abilità speciali
- [x] Combat: Sprite nemici stilizzati per tipo (humanoid/beast/undead/giant)
- [x] Combat: Effetti visivi (slash, proiettili magici, scudo, heal)
- [x] Combat: Animazioni breathing, morte, vittoria con confetti
- [x] **Sistema di Riposo** - Short/Long rest per recuperare HP, spell slots, hit dice
- [x] **Toast Notifications** - Sostituire alert() con notifiche eleganti
- [x] **Statistiche Combat** - Riepilogo post-combattimento (danni inflitti/subiti, round)
- [x] **Badge PWA** - Notifica nuove versioni con prompt aggiornamento
- [x] **Lazy Loading** - Riduzione bundle iniziale dell'85% (~700KB vs ~4MB)
- [x] **Indicatore Offline** - Mostra stato connessione nella PWA
- [x] **Bestiario** - Pagina dedicata con 32 nemici, lore, statistiche e artwork
- [x] **Draghi Combat** - 20 draghi (Wyrmling + Young) con breath weapon
- [x] **Breath Weapon** - Meccanica soffio con cooldown, ricarica 5-6, DEX save
- [x] **Effetti Breath** - Animazioni fuoco, fulmine, ghiaccio, acido, veleno
- [x] **Comandi Vocali** - Sistema completo con 25+ comandi (dadi, HP, navigazione)
- [x] **Voice Tutorial** - Modal aiuto con lista comandi per categoria
- [x] **ServiceWorker gh-pages** - PWA funzionante su GitHub Pages

### 🚧 In Sviluppo
- [ ] Visual Novel con Ink.js per narrazione interattiva
- [ ] Sprite per Auryn e Ravel

### 🟢 Quick Wins (Piccoli miglioramenti)
- [x] Storico dei tiri di dado nella sessione
- [x] Keyboard navigation con scorciatoie (Shift+? per aiuto)
- [x] Suoni effetti combat (hit, miss, critico, magia, vittoria)

### 🟡 Feature Medie
- [ ] Inventario migliorato - Drag & drop, filtri, peso totale con encumbrance
- [ ] Achievements - Badge/trofei per traguardi (es. "Prima vittoria", "100 tiri")
- [ ] Export/Import - Scheda personaggio in PDF o JSON
- [ ] Difficoltà dinamica - suggerire nemici in base al livello PG
- [ ] Multi-attacco per alcuni nemici (Gufolorso, Ghast)
- [ ] Condizioni di stato (Paralisi Ghoul, Fetore Ghast)
- [ ] Tiri Salvezza contro effetti nemici
- [ ] Storico combattimenti (visualizza dal DB)
- [ ] Sistema Loot/Ricompense dopo vittoria

### 🔴 Feature Avanzate (Alto impegno)
- [ ] Encounter Builder - Creare scontri personalizzati con più nemici
- [ ] Initiative Tracker - Gestione turni con più combattenti
- [ ] Spell Effects - Applicare condizioni durante il combattimento
- [ ] Campaign Journal - Timeline delle sessioni con date reali
- [ ] Sync Cloud - Sincronizzazione tra dispositivi (Firebase/Supabase)
- [ ] Multiplayer Notes - Note condivise tra giocatori

### 🛠️ Technical Debt / Ottimizzazioni
- [ ] Aumentare copertura unit/e2e test
- [ ] Analizzare bundle size con source-map-explorer
- [ ] Global error boundary con reporting

### 💡 Altre Idee
- [ ] Mappa interattiva di Phendelver
- [ ] Quest tracker
- [ ] Gestione spell slots nella scheda

## 🎨 Credits

- **LPC Spritesheet Generator**: Character sprites
- **Morris Roman Font**: Font custom per titoli
- **D&D 5e SRD**: Regole e meccaniche di gioco

## 📄 Licenza

Questo progetto è privato e destinato all'uso personale per la campagna D&D.
