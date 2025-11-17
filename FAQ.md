# Domande e Risposte - Espansioni Future

## 💾 Q1: Limitazioni Salvataggio Dati Locale

### Risposta: Dipende dalla strategia scelta

#### ✅ **Opzione A: LocalStorage/SessionStorage**
**Limiti:**
- 5-10MB di spazio massimo
- Dati cancellabili dall'utente
- Sincronizzazione manuale tra dispositivi
- No backup automatico

**Adatto per:**
- PIN autenticazione
- Preferenze UI
- Ultima pagina visitata
- Dati temporanei sessione

---

#### ✅ **Opzione B: IndexedDB (CONSIGLIATA)**
**Vantaggi:**
- 50MB+ di spazio (fino a 1GB+ su desktop)
- Database strutturato con query
- Supporto transazioni
- Offline-first completo

**Limiti:**
- Ancora cancellabile dall'utente
- No sincronizzazione automatica tra dispositivi
- Richiede gestione versioning

**Adatto per:**
- **Tutte le note personali del giocatore**
- **Storia lanci dado (statistiche)**
- **Progressi campagna**
- **Dati gallery/artbook visitati**

**Implementazione suggerita:**
```typescript
// Servizio IndexedDB per Phendelver
import { openDB, DBSchema } from 'idb';

interface PhendelverDB extends DBSchema {
  'dice-rolls': {
    key: number;
    value: {
      id: number;
      character: string;
      roll: number;
      modifier: number;
      total: number;
      timestamp: Date;
      note?: string;
    };
  };
  'player-notes': {
    key: string; // chapter-id
    value: {
      chapterId: string;
      content: string;
      lastModified: Date;
    };
  };
  'progress': {
    key: string; // character-name
    value: {
      character: string;
      lastVisited: string; // route
      chaptersRead: string[];
      achievements: string[];
    };
  };
}

// Uso: 50MB+ di spazio garantito
```

---

#### ✅ **Opzione C: PWA + Cache API**
**Vantaggi:**
- Funziona offline
- Sincronizza automaticamente quando online
- Service Worker gestisce cache

**Limiti:**
- Più complesso da implementare
- Non sostituisce database

**Adatto per:**
- Cache immagini
- Cache risorse statiche
- Offline experience

---

#### 🚀 **Opzione D: IndexedDB + Cloud Sync (IDEALE per te)**

**Setup consigliato per diario personale:**

1. **Locale (IndexedDB):** Tutti i dati salvati subito
2. **Cloud opzionale (Firebase/Supabase):** Sincronizzazione automatica se l'utente vuole

**Vantaggi:**
- ✅ Funziona 100% offline
- ✅ Dati mai persi (backup cloud)
- ✅ Sincronizzazione multi-dispositivo
- ✅ Utente controlla se abilitare cloud
- ✅ Export/Import manuale possibile

**Implementazione:**
```typescript
// Strategia ibrida
class DiaryService {
  private useCloud = signal(false); // Impostazione utente
  
  async saveNote(note: PlayerNote) {
    // Salva SEMPRE locale
    await this.indexedDB.save(note);
    
    // Sincronizza cloud solo se abilitato
    if (this.useCloud()) {
      await this.firebase.sync(note);
    }
  }
  
  async loadNotes() {
    // Carica da locale
    const localNotes = await this.indexedDB.getAll();
    
    // Se cloud abilitato, sincronizza
    if (this.useCloud()) {
      const cloudNotes = await this.firebase.getAll();
      return this.merge(localNotes, cloudNotes);
    }
    
    return localNotes;
  }
}
```

### ✅ **Raccomandazione Finale:**
Per un diario personale come il tuo, **IndexedDB + Cloud opzionale** è la scelta migliore:
- Nessuna limitazione pratica (GB di spazio)
- Funziona sempre offline
- Sincronizzazione opzionale quando serve

---

## ⚔️ Q2: Sistema Combattimento RPG

### Risposta: SÌ, assolutamente fattibile!

#### 🎮 **Opzione A: Combat System Integrato Angular**

**Features implementabili:**

```typescript
// Sistema combattimento turn-based
interface CombatState {
  player: Character;
  enemy: Monster;
  turn: 'player' | 'enemy';
  log: CombatAction[];
}

interface CombatAction {
  type: 'attack' | 'spell' | 'defend' | 'item';
  attacker: string;
  target: string;
  damage?: number;
  healing?: number;
  effect?: StatusEffect;
  roll: number;
}

// Esempio: Asriel vs False Hydra
combat = {
  player: {
    name: 'Asriel',
    hp: 45,
    maxHp: 45,
    ac: 15,
    attacks: [
      { name: 'Eldritch Blast', damage: '1d10+3', type: 'spell' },
      { name: 'Patto della Lama', damage: '1d8+3', type: 'weapon' }
    ],
    spells: ['Hex', 'Armor of Agathys', 'Misty Step']
  },
  enemy: {
    name: 'False Hydra',
    hp: 120,
    maxHp: 120,
    ac: 14,
    attacks: [
      { name: 'Bite', damage: '2d8+4' },
      { name: 'Song of Silence', type: 'spell', effect: 'charm' }
    ]
  }
}
```

**UI suggerita:**
```
┌─────────────────────────────────────┐
│  ASRIEL        HP: ████████░░ 35/45 │
│  AC: 15        Initiative: 18        │
├─────────────────────────────────────┤
│                                      │
│         [ENEMY SPRITE]               │
│      FALSE HYDRA                     │
│      HP: ██████████████ 120/120      │
│                                      │
├─────────────────────────────────────┤
│  [ATTACK] [SPELL] [DEFEND] [ITEM]   │
└─────────────────────────────────────┘
```

**Librerie consigliate:**
- **Phaser.js** - Framework game 2D completo
- **PixiJS** - Rendering 2D velocissimo
- **Three.js** - Se vuoi combattimenti 3D
- **Canvas API nativo** - Per qualcosa di più semplice

---

#### 🎮 **Opzione B: Mini-Game Integrato**

**Esempio implementazione con Phaser:**

```typescript
// combat.component.ts
import Phaser from 'phaser';

export class CombatComponent implements OnInit, OnDestroy {
  private game!: Phaser.Game;
  
  ngOnInit() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'combat-container',
      scene: [CombatScene],
      physics: {
        default: 'arcade'
      }
    };
    
    this.game = new Phaser.Game(config);
  }
  
  ngOnDestroy() {
    this.game.destroy(true);
  }
}

// combat-scene.ts
class CombatScene extends Phaser.Scene {
  create() {
    // Background
    this.add.image(400, 300, 'combat-bg');
    
    // Personaggio
    const asriel = this.add.sprite(200, 400, 'asriel')
      .setScale(2);
    
    // Nemico
    const hydra = this.add.sprite(600, 350, 'hydra')
      .setScale(3);
    
    // UI combattimento
    this.createCombatUI();
  }
  
  attack() {
    const roll = Phaser.Math.Between(1, 20);
    const modifier = 5;
    const total = roll + modifier;
    
    if (total >= this.enemy.ac) {
      const damage = this.rollDamage('1d8+3');
      this.dealDamage(this.enemy, damage);
      this.showFloatingText(`HIT! ${damage} damage`, 'red');
    } else {
      this.showFloatingText('MISS!', 'gray');
    }
  }
}
```

**Features avanzate:**
- ✅ Animazioni attacchi
- ✅ Particelle magiche
- ✅ Sound effects
- ✅ Critical hits visivi
- ✅ Status effects (poison, burn, paralysis)
- ✅ Combo system
- ✅ Timeline turni

---

#### 🎲 **Opzione C: Sistema Semplificato (Quick Battle)**

**Per integrare velocemente:**

```typescript
// quick-battle.component.ts
interface QuickBattle {
  rounds: BattleRound[];
  winner: 'player' | 'enemy' | null;
}

// Simulazione automatica con risultati
simulateBattle(player: Character, enemy: Monster): QuickBattle {
  const rounds: BattleRound[] = [];
  let playerHp = player.maxHp;
  let enemyHp = enemy.maxHp;
  
  while (playerHp > 0 && enemyHp > 0) {
    // Turno player
    const playerRoll = this.rollD20() + player.attackBonus;
    if (playerRoll >= enemy.ac) {
      const damage = this.rollDamage(player.weapon);
      enemyHp -= damage;
      rounds.push({
        attacker: player.name,
        action: 'attack',
        roll: playerRoll,
        damage,
        success: true
      });
    }
    
    // Turno enemy
    const enemyRoll = this.rollD20() + enemy.attackBonus;
    if (enemyRoll >= player.ac) {
      const damage = this.rollDamage(enemy.attack);
      playerHp -= damage;
      rounds.push({
        attacker: enemy.name,
        action: 'attack',
        roll: enemyRoll,
        damage,
        success: true
      });
    }
  }
  
  return {
    rounds,
    winner: playerHp > 0 ? 'player' : 'enemy'
  };
}
```

### ✅ **Raccomandazione:**
- **Phaser.js** se vuoi un sistema completo e visuale
- **Sistema semplificato** per integrazione veloce
- Puoi iniziare semplice e espandere dopo

---

## 🎮 Q3: Integrazione RPG Maker / Visual Novel

### Risposta: SÌ, ci sono diverse strategie!

#### 🎯 **Opzione A: RPG Maker → Export Web → Embed**

**Come funziona:**
1. Crei il gioco in RPG Maker
2. Esporti per Web (HTML5)
3. Integri in Angular come iframe

**Implementazione:**

```typescript
// rpg-game.component.ts
@Component({
  selector: 'app-rpg-game',
  template: `
    <div class="game-container">
      <div class="game-header">
        <button (click)="goBack()">← Torna al Diario</button>
        <h2>{{ gameTitle }}</h2>
      </div>
      
      <iframe 
        #gameFrame
        [src]="gameUrl | safe"
        frameborder="0"
        allowfullscreen>
      </iframe>
      
      <div class="game-controls" *ngIf="showControls">
        <p>Controlli: Frecce = Movimento | Z = Conferma | X = Annulla</p>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    iframe {
      flex: 1;
      width: 100%;
      border: none;
    }
  `]
})
export class RpgGameComponent {
  gameUrl = '/assets/games/prison-escape/index.html';
  gameTitle = 'Fuga dal Laboratorio';
  showControls = true;
  
  goBack() {
    this.router.navigate(['/asriel/story']);
  }
}
```

**Struttura file:**
```
angular-phendelver/
  public/
    games/
      prison-escape/        ← RPG Maker export
        index.html
        js/
        img/
        audio/
      phandalin-origins/    ← Altro gioco
        index.html
        ...
```

**Route:**
```typescript
// app.routes.ts
{
  path: ':character/game/:gameId',
  component: RpgGameComponent,
  canActivate: [authGuard]
}
```

---

#### 🎯 **Opzione B: Comunicazione Bidirezionale App ↔ Game**

**Per passare dati tra Angular e RPG Maker:**

```typescript
// Angular → RPG Maker
sendToGame(data: any) {
  const gameFrame = this.gameFrame.nativeElement;
  gameFrame.contentWindow.postMessage({
    type: 'FROM_ANGULAR',
    payload: {
      playerName: 'Asriel',
      hp: 45,
      inventory: ['Pozione', 'Chiave']
    }
  }, '*');
}

// RPG Maker → Angular (listener)
ngOnInit() {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'FROM_GAME') {
      console.log('Ricevuto da gioco:', event.data.payload);
      
      // Esempio: Gioco finito, torna a Angular
      if (event.data.payload.gameCompleted) {
        this.router.navigate(['/asriel/story']);
      }
      
      // Salva progresso
      if (event.data.payload.checkpoint) {
        this.saveProgress(event.data.payload.checkpoint);
      }
    }
  });
}
```

**Nel gioco RPG Maker (plugin custom):**
```javascript
// RPG Maker MV/MZ Plugin
(function() {
  // Invia dati ad Angular
  function sendToAngular(data) {
    window.parent.postMessage({
      type: 'FROM_GAME',
      payload: data
    }, '*');
  }
  
  // Ricevi dati da Angular
  window.addEventListener('message', function(event) {
    if (event.data.type === 'FROM_ANGULAR') {
      const playerData = event.data.payload;
      // Usa i dati nel gioco
      $gameVariables.setValue(1, playerData.hp);
    }
  });
  
  // Esempio: Fine gioco
  Game_Interpreter.prototype.endGameAndReturn = function() {
    sendToAngular({
      gameCompleted: true,
      score: $gameVariables.value(10)
    });
  };
})();
```

---

#### 🎯 **Opzione C: Visual Novel con Ren'Py / Yarn Spinner**

**Alternative a RPG Maker per Visual Novel:**

##### **1. Ren'Py (Python-based)**
- Export Web disponibile
- Ottimo per visual novel
- Scripting semplice

**Esempio:**
```python
# script.rpy
label start:
    scene bg prison
    
    "Ti svegli in una cella buia..."
    
    show asriel worried
    
    asriel "Dove sono? Come sono arrivato qui?"
    
    menu:
        "Cerco di scappare":
            jump escape_attempt
        
        "Aspetto e osservo":
            jump wait_and_watch
```

##### **2. Ink (by Inkle) + ink.js**
- Linguaggio scripting per narrativa
- Libreria JavaScript nativa
- **Integrazione perfetta con Angular!**

**Esempio implementazione:**
```typescript
// visual-novel.component.ts
import { Story } from 'inkjs';

@Component({
  selector: 'app-visual-novel',
  template: `
    <div class="vn-container">
      <div class="vn-background" [style.backgroundImage]="currentBg"></div>
      
      <div class="vn-text-box">
        <h3>{{ currentSpeaker }}</h3>
        <p>{{ currentText }}</p>
        
        <div class="vn-choices">
          <button 
            *ngFor="let choice of choices"
            (click)="selectChoice(choice)"
            class="vn-choice-btn">
            {{ choice.text }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class VisualNovelComponent implements OnInit {
  private story!: Story;
  currentText = '';
  currentSpeaker = '';
  currentBg = '';
  choices: any[] = [];
  
  async ngOnInit() {
    // Carica storia Ink
    const storyContent = await fetch('/assets/stories/asriel-prison.ink.json')
      .then(r => r.json());
    
    this.story = new Story(storyContent);
    this.continue();
  }
  
  continue() {
    if (this.story.canContinue) {
      this.currentText = this.story.Continue()!;
      this.parseStoryTags();
      
      if (this.story.currentChoices.length > 0) {
        this.choices = this.story.currentChoices;
      }
    } else {
      // Storia finita
      this.router.navigate(['/asriel/story']);
    }
  }
  
  selectChoice(choice: any) {
    this.story.ChooseChoiceIndex(choice.index);
    this.continue();
  }
  
  private parseStoryTags() {
    // Tags Ink: # speaker: Asriel
    const tags = this.story.currentTags;
    tags.forEach(tag => {
      if (tag.startsWith('speaker:')) {
        this.currentSpeaker = tag.split(':')[1].trim();
      }
      if (tag.startsWith('bg:')) {
        this.currentBg = `url(/assets/img/${tag.split(':')[1].trim()})`;
      }
    });
  }
}
```

**Storia Ink (asriel-prison.ink):**
```ink
=== start ===
# speaker: Narratore
# bg: prison.jpg

Ti svegli in una cella buia. L'aria è fredda e umida.

# speaker: Asriel
"Dove... dove sono?"

Vedi una piccola finestra in alto e una porta di ferro chiusa.

* [Grida per chiedere aiuto] -> shout
* [Esamina la cella] -> examine
* [Prova ad aprire la porta] -> try_door

=== shout ===
# speaker: Asriel
"AIUTO! C'È QUALCUNO?!"

Nessuna risposta. Solo l'eco della tua voce.

+ [Continua...] -> examine

=== examine ===
Nella cella vedi:
- Una branda arrugginita
- Un secchio nell'angolo
- Scritte sul muro

* [Leggi le scritte] -> read_wall
* [Cerca sotto la branda] -> search_bed

=== read_wall ===
# bg: wall_writings.jpg

Scritte incise nel muro:
"Giorno 47: Ancora esperimenti."
"Giorno 93: Ho visto Lyra oggi. Sta male."
"Giorno ???: Non ricordo più quanto tempo è passato."

# speaker: Asriel
"Chi ha scritto questo?"

-> escape_plan

=== escape_plan ===
Improvvisamente senti passi fuori dalla cella...

# speaker: Guardia
"Soggetto 23, preparati. È ora del test."

* [Combatti!] -> {
  ~ return_to_angular("combat", "guard")
}
* [Fingi di essere malato] -> fake_sick

=== return_to_angular(section, param) ===
// JavaScript per tornare ad Angular
<>
~ temp message = "Returning to Angular: " + section
-> END
```

---

#### 🎮 **Gestione Controller/Gamepad**

**Per supportare controller anche fuori dal gioco:**

```typescript
// gamepad.service.ts
@Injectable({ providedIn: 'root' })
export class GamepadService {
  private gamepad: Gamepad | null = null;
  private animationId: number = 0;
  
  onButtonPress = new EventEmitter<number>();
  onAxisMove = new EventEmitter<{ axis: number, value: number }>();
  
  init() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Controller connesso:', e.gamepad);
      this.gamepad = e.gamepad;
      this.startPolling();
    });
    
    window.addEventListener('gamepaddisconnected', () => {
      this.gamepad = null;
      this.stopPolling();
    });
  }
  
  private startPolling() {
    const poll = () => {
      if (!this.gamepad) return;
      
      const gp = navigator.getGamepads()[this.gamepad.index];
      if (!gp) return;
      
      // Controlla bottoni
      gp.buttons.forEach((button, index) => {
        if (button.pressed) {
          this.onButtonPress.emit(index);
        }
      });
      
      // Controlla assi (stick analogici)
      gp.axes.forEach((value, index) => {
        if (Math.abs(value) > 0.2) {
          this.onAxisMove.emit({ axis: index, value });
        }
      });
      
      this.animationId = requestAnimationFrame(poll);
    };
    
    poll();
  }
  
  private stopPolling() {
    cancelAnimationFrame(this.animationId);
  }
}

// Uso nel componente
export class GameComponent {
  constructor(private gamepad: GamepadService) {
    gamepad.onButtonPress.subscribe(button => {
      // Button A (Xbox) = index 0
      if (button === 0) this.confirm();
      // Button B (Xbox) = index 1
      if (button === 1) this.cancel();
      // D-Pad
      if (button === 12) this.moveUp();
      if (button === 13) this.moveDown();
      if (button === 14) this.moveLeft();
      if (button === 15) this.moveRight();
    });
  }
}
```

---

### ✅ **Raccomandazioni RPG/Visual Novel:**

| Feature | RPG Maker | Ren'Py | Ink + Angular |
|---------|-----------|--------|---------------|
| Facilità setup | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Integrazione Angular | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Flessibilità | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Controller support | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

**Per il tuo caso:**
1. **Visual Novel semplici**: Usa **Ink + Angular** (integrazione nativa)
2. **Giochi più complessi**: Usa **RPG Maker + iframe** (embed)
3. **Controller**: Funziona in entrambi i casi con Gamepad API

---

## 🗺️ Q4: Mappe Concettuali Dinamiche

### Risposta: SÌ, posso crearle e aggiornarle!

#### 🎨 **Opzione A: Mappa Visuale con Libreria Dedicata**

**Librerie consigliate:**

##### **1. D3.js - Grafico Forza (Force-Directed Graph)**
```typescript
// Struttura dati
interface StoryMap {
  nodes: Node[];
  links: Link[];
}

interface Node {
  id: string;
  type: 'character' | 'location' | 'event' | 'organization';
  name: string;
  description: string;
  image?: string;
  importance: 1 | 2 | 3; // Dimensione nodo
}

interface Link {
  source: string; // node id
  target: string; // node id
  type: 'knows' | 'located_at' | 'participated_in' | 'belongs_to';
  description: string;
}

// Esempio dati Phendelver
const phendelverMap: StoryMap = {
  nodes: [
    // Personaggi
    { id: 'asriel', type: 'character', name: 'Asriel', importance: 3 },
    { id: 'lyra', type: 'character', name: 'Lyra', importance: 2 },
    { id: 'snack', type: 'character', name: 'Snickersnack', importance: 2 },
    { id: 'grazzt', type: 'character', name: "Graz'zt", importance: 3 },
    { id: 'nova', type: 'character', name: 'Nova', importance: 2 },
    
    // Luoghi
    { id: 'orfanotrofio', type: 'location', name: 'Orfanotrofio', importance: 2 },
    { id: 'laboratorio', type: 'location', name: 'Laboratorio', importance: 3 },
    { id: 'palazzo-cristallo', type: 'location', name: 'Palazzo di Cristallo', importance: 3 },
    { id: 'phandalin', type: 'location', name: 'Phandalin', importance: 2 },
    
    // Eventi
    { id: 'rapimento', type: 'event', name: 'Rapimento', importance: 3 },
    { id: 'esperimenti', type: 'event', name: 'Esperimenti', importance: 3 },
    { id: 'patto', type: 'event', name: 'Patto con Grazzt', importance: 3 },
    { id: 'liberazione', type: 'event', name: 'Liberazione', importance: 2 },
    
    // Organizzazioni
    { id: 'org-tatuaggio', type: 'organization', name: 'Organizzazione del Tatuaggio', importance: 3 }
  ],
  
  links: [
    // Asriel connections
    { source: 'asriel', target: 'orfanotrofio', type: 'located_at', description: 'Cresciuto qui' },
    { source: 'asriel', target: 'lyra', type: 'knows', description: 'Amici nel laboratorio' },
    { source: 'asriel', target: 'snack', type: 'knows', description: 'Compagni di cella' },
    { source: 'asriel', target: 'laboratorio', type: 'located_at', description: 'Prigioniero' },
    { source: 'asriel', target: 'grazzt', type: 'knows', description: 'Warlock patron' },
    { source: 'asriel', target: 'palazzo-cristallo', type: 'located_at', description: 'Prigioniero' },
    { source: 'asriel', target: 'nova', type: 'knows', description: 'Rivalità' },
    
    // Eventi
    { source: 'rapimento', target: 'orfanotrofio', type: 'participated_in', description: 'Da qui' },
    { source: 'rapimento', target: 'laboratorio', type: 'participated_in', description: 'Verso qui' },
    { source: 'rapimento', target: 'org-tatuaggio', type: 'belongs_to', description: 'Responsabili' },
    { source: 'esperimenti', target: 'laboratorio', type: 'participated_in', description: 'Location' },
    { source: 'esperimenti', target: 'org-tatuaggio', type: 'belongs_to', description: 'Eseguiti da' },
    { source: 'patto', target: 'grazzt', type: 'participated_in', description: 'Con' },
    { source: 'patto', target: 'palazzo-cristallo', type: 'participated_in', description: 'Location' }
  ]
};
```

**Componente Angular:**
```typescript
// story-map.component.ts
import * as d3 from 'd3';

@Component({
  selector: 'app-story-map',
  template: `
    <div class="map-container">
      <div class="map-controls">
        <button (click)="filterBy('character')">Personaggi</button>
        <button (click)="filterBy('location')">Luoghi</button>
        <button (click)="filterBy('event')">Eventi</button>
        <button (click)="filterBy('all')">Tutto</button>
      </div>
      
      <svg #mapSvg></svg>
      
      <div class="map-legend">
        <div class="legend-item">
          <span class="node character"></span> Personaggi
        </div>
        <div class="legend-item">
          <span class="node location"></span> Luoghi
        </div>
        <div class="legend-item">
          <span class="node event"></span> Eventi
        </div>
        <div class="legend-item">
          <span class="node organization"></span> Organizzazioni
        </div>
      </div>
      
      <div class="node-details" *ngIf="selectedNode">
        <h3>{{ selectedNode.name }}</h3>
        <p>{{ selectedNode.description }}</p>
        <button (click)="closeDetails()">Chiudi</button>
      </div>
    </div>
  `
})
export class StoryMapComponent implements OnInit {
  @ViewChild('mapSvg') svgRef!: ElementRef<SVGSVGElement>;
  
  private simulation!: d3.Simulation<Node, Link>;
  selectedNode: Node | null = null;
  
  ngOnInit() {
    this.createMap();
  }
  
  private createMap() {
    const svg = d3.select(this.svgRef.nativeElement);
    const width = 1200;
    const height = 800;
    
    // Simulazione fisica
    this.simulation = d3.forceSimulation(phendelverMap.nodes)
      .force('link', d3.forceLink(phendelverMap.links)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Collegamenti
    const link = svg.append('g')
      .selectAll('line')
      .data(phendelverMap.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);
    
    // Nodi
    const node = svg.append('g')
      .selectAll('circle')
      .data(phendelverMap.nodes)
      .join('circle')
      .attr('r', d => d.importance * 10)
      .attr('fill', d => this.getNodeColor(d.type))
      .call(this.drag(this.simulation))
      .on('click', (event, d) => this.selectNode(d));
    
    // Etichette
    const label = svg.append('g')
      .selectAll('text')
      .data(phendelverMap.nodes)
      .join('text')
      .text(d => d.name)
      .attr('font-size', 12)
      .attr('dx', 15)
      .attr('dy', 4);
    
    // Aggiorna posizioni
    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
      
      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  }
  
  private getNodeColor(type: string): string {
    const colors = {
      character: '#4CAF50',
      location: '#2196F3',
      event: '#FF9800',
      organization: '#9C27B0'
    };
    return colors[type] || '#757575';
  }
  
  private drag(simulation: any) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }
  
  selectNode(node: Node) {
    this.selectedNode = node;
  }
  
  filterBy(type: string) {
    // Filtra nodi e collegamenti
    // Ricreare visualizzazione
  }
}
```

---

##### **2. Timeline Verticale**

**Per eventi cronologici:**

```typescript
// timeline.component.ts
interface TimelineEvent {
  date: string; // "Anno 1492, Autunno"
  title: string;
  description: string;
  characters: string[];
  location: string;
  image?: string;
}

const asrielTimeline: TimelineEvent[] = [
  {
    date: 'Anno 0',
    title: 'Nascita',
    description: 'Asriel nasce da genitori sconosciuti',
    characters: ['Asriel'],
    location: 'Sconosciuto'
  },
  {
    date: 'Anno 0 - Giorno 1',
    title: 'Abbandono',
    description: 'Lasciato davanti alle porte dell\'orfanotrofio',
    characters: ['Asriel'],
    location: 'Orfanotrofio'
  },
  {
    date: 'Anno 8',
    title: 'Amicizia con Ravel',
    description: 'Conosce Ravel che lo protegge dagli altri orfani',
    characters: ['Asriel', 'Ravel'],
    location: 'Orfanotrofio'
  },
  {
    date: 'Anno 13',
    title: 'Il Rapimento',
    description: 'Viene rapito dall\'orfanotrofio in piena notte',
    characters: ['Asriel', 'Organizzazione'],
    location: 'Orfanotrofio → Laboratorio',
    image: 'rapimento.jpg'
  },
  {
    date: 'Anno 13 - Giorno 1',
    title: 'Primo giorno nel Laboratorio',
    description: 'Si sveglia in una cella. Conosce Lyra e Snickersnack',
    characters: ['Asriel', 'Lyra', 'Snack'],
    location: 'Laboratorio'
  },
  {
    date: 'Anno 13-16',
    title: 'Gli Esperimenti',
    description: 'Anni di prigionia e esperimenti. Sviluppa poteri curativi',
    characters: ['Asriel', 'Lyra', 'Snack', 'Organizzazione'],
    location: 'Laboratorio',
    image: 'prison.jpg'
  },
  {
    date: 'Anno 16',
    title: 'Tentativo di Fuga',
    description: 'Piano di fuga fallito. Viene separato da Lyra e Snack',
    characters: ['Asriel', 'Lyra', 'Snack'],
    location: 'Laboratorio'
  },
  {
    date: 'Anno 16',
    title: 'Il Patto',
    description: 'Graz\'zt appare e offre un patto. Asriel accetta pur di uscire',
    characters: ['Asriel', 'Grazzt'],
    location: 'Laboratorio → Palazzo di Cristallo',
    image: 'grazzt.jpg'
  },
  {
    date: 'Anno 16-18',
    title: 'Prigionia nel Palazzo',
    description: 'Vive nel palazzo di cristallo di Graz\'zt. Rivalità con Nova',
    characters: ['Asriel', 'Grazzt', 'Nova'],
    location: 'Palazzo di Cristallo',
    image: 'nova.png'
  },
  {
    date: 'Anno 18',
    title: 'La Liberazione',
    description: 'Graz\'zt lo lascia andare con un patto: tornare dopo la vendetta',
    characters: ['Asriel', 'Grazzt'],
    location: 'Palazzo di Cristallo'
  },
  {
    date: 'Anno 18 - Presente',
    title: 'Ricerca nel Faerun',
    description: 'Viaggia alla ricerca del laboratorio e di un modo per liberarsi dal patto',
    characters: ['Asriel'],
    location: 'Faerun',
    image: 'phandalin.jpg'
  }
];
```

---

#### 🎯 **Opzione B: Mappa Geografica Interattiva**

**Usando Leaflet.js:**

```typescript
// world-map.component.ts
import * as L from 'leaflet';

@Component({
  selector: 'app-world-map',
  template: `
    <div id="map" #mapContainer></div>
    
    <div class="map-sidebar">
      <h3>Locations</h3>
      <div class="location-list">
        <button 
          *ngFor="let loc of locations"
          (click)="focusLocation(loc)"
          class="location-btn">
          {{ loc.name }}
        </button>
      </div>
    </div>
  `
})
export class WorldMapComponent implements OnInit {
  private map!: L.Map;
  
  locations = [
    { 
      name: 'Orfanotrofio',
      coords: [45.5, 12.3] as [number, number],
      description: 'Dove Asriel è cresciuto',
      icon: 'house'
    },
    {
      name: 'Laboratorio Segreto',
      coords: [46.2, 13.1] as [number, number],
      description: 'Luogo degli esperimenti',
      icon: 'flask'
    },
    {
      name: 'Phandalin',
      coords: [44.8, 11.5] as [number, number],
      description: 'Villaggio obiettivo',
      icon: 'home'
    }
  ];
  
  ngOnInit() {
    // Mappa custom Sword Coast
    this.map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -1
    });
    
    // Immagine mappa Faerun
    const bounds = [[0, 0], [1000, 1000]] as L.LatLngBoundsExpression;
    L.imageOverlay('/assets/maps/sword-coast.jpg', bounds).addTo(this.map);
    this.map.fitBounds(bounds);
    
    // Aggiungi marker
    this.locations.forEach(loc => {
      const marker = L.marker(loc.coords, {
        icon: this.getCustomIcon(loc.icon)
      }).addTo(this.map);
      
      marker.bindPopup(`
        <h4>${loc.name}</h4>
        <p>${loc.description}</p>
      `);
    });
  }
  
  focusLocation(location: any) {
    this.map.setView(location.coords, 2);
  }
}
```

---

### ✅ **Posso Creare e Mantenere le Mappe?**

**SÌ, assolutamente! Ecco come:**

#### **Workflow proposto:**

1. **Tu mi dai aggiornamenti narrativi:**
   ```
   "In questa sessione:
   - Asriel ha incontrato Drosda a Phandalin
   - Hanno scoperto che l'organizzazione si chiama 'I Collezionisti'
   - C'è un nuovo PNG: Jonah, un mercante halfling"
   ```

2. **Io aggiorno i file di dati:**
   ```typescript
   // story-data.json (aggiornato)
   {
     "nodes": [
       ...existing nodes,
       { 
         "id": "drosda",
         "type": "character",
         "name": "Drosda",
         "description": "Chierico nanica di Moradin"
       },
       {
         "id": "collezionisti",
         "type": "organization",
         "name": "I Collezionisti",
         "description": "Organizzazione segreta"
       }
     ],
     "links": [
       ...existing links,
       {
         "source": "asriel",
         "target": "drosda",
         "type": "knows",
         "description": "Incontrati a Phandalin"
       }
     ]
   }
   ```

3. **La mappa si aggiorna automaticamente!**

#### **Strumenti che posso usare:**

- ✅ **D3.js** - Grafi di relazioni
- ✅ **Leaflet** - Mappe geografiche
- ✅ **Timeline verticali** - Eventi cronologici
- ✅ **Mermaid diagrams** - Diagrammi embedded
- ✅ **JSON strutturati** - Facili da aggiornare

#### **Formato aggiornamenti:**

Per rendere facile l'aggiornamento, useremo questo formato:

```json
// session-updates.json
{
  "sessionNumber": 15,
  "date": "2025-11-17",
  "updates": {
    "newCharacters": [
      {
        "id": "jonah",
        "name": "Jonah",
        "race": "Halfling",
        "class": "Mercante",
        "description": "Mercante viaggiatore con informazioni sui Collezionisti"
      }
    ],
    "newLocations": [],
    "newEvents": [
      {
        "id": "incontro-drosda",
        "title": "Incontro con Drosda",
        "description": "Asriel arriva a Phandalin e incontra Drosda",
        "participants": ["asriel", "drosda"],
        "location": "phandalin"
      }
    ],
    "newRelationships": [
      {
        "from": "asriel",
        "to": "drosda",
        "type": "ally",
        "description": "Alleati nella ricerca"
      }
    ]
  }
}
```

**Poi eseguo uno script che aggiorna automaticamente la mappa!**

---

### ✅ **Conclusione delle Risposte**

| Domanda | Risposta | Raccomandazione |
|---------|----------|-----------------|
| **Limitazioni salvataggio locale** | No limitazioni pratiche con IndexedDB | Usa IndexedDB + cloud opzionale |
| **Sistema combattimento RPG** | Sì, fattibile con Phaser o sistema custom | Inizia semplice, espandi dopo |
| **Integrazione RPG Maker/VN** | Sì, con iframe o Ink nativo | Ink + Angular per VN, iframe per giochi complessi |
| **Mappe concettuali** | Sì, posso crearle e aggiornarle! | D3.js per relazioni, Timeline per cronologia |

**Vuoi che inizi con uno di questi?** Dimmi su quale vuoi concentrarti per primo!
