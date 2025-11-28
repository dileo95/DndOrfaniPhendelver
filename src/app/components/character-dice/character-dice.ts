import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DiceAudioService } from '../../services/dice-audio.service';

type RollType = 'normal' | 'advantage' | 'disadvantage';
type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface DiceOption {
  sides: DiceType;
  label: string;
  icon: string;
}

interface RollHistoryEntry {
  id: number;
  face: number;
  modifier: number;
  total: number;
  type: RollType;
  diceType: DiceType;
  timestamp: Date;
  isCriticalSuccess: boolean;
  isCriticalFail: boolean;
  presetName?: string;
  multiRoll?: MultiRollResult; // Per tiri multipli
}

interface ActionPreset {
  name: string;
  icon: string;
  dice: DiceType;
  defaultModifier?: number;
  rollType?: RollType;
  description: string;
}

// Per gestire combinazioni di dadi (es. 3d8 + 1d6)
interface DicePool {
  dice: DiceType;
  count: number;
}

interface MultiRollResult {
  pools: { dice: DiceType; rolls: number[]; subtotal: number }[];
  total: number;
  formula: string;
}

@Component({
  selector: 'app-character-dice',
  imports: [FormsModule],
  templateUrl: './character-dice.html',
  styleUrl: './character-dice.scss'
})
export class CharacterDice implements OnInit {
  private audioService = inject(DiceAudioService);
  
  characterName = '';
  characterRoute = '';
  modifier = 0;
  currentFace = signal<number | null>(null);
  isRolling = signal(false);
  information = signal('');
  soundEnabled = signal(true);
  lastPresetUsed = signal<string | null>(null);
  
  // Tipo di dado selezionato
  selectedDice = signal<DiceType>(20);
  diceOptions: DiceOption[] = [
    { sides: 4, label: 'd4', icon: '🔺' },
    { sides: 6, label: 'd6', icon: '🎲' },
    { sides: 8, label: 'd8', icon: '💎' },
    { sides: 10, label: 'd10', icon: '🔷' },
    { sides: 12, label: 'd12', icon: '⬡' },
    { sides: 20, label: 'd20', icon: '⚔️' },
    { sides: 100, label: 'd100', icon: '💯' }
  ];
  
  // Pool di dadi per tiri multipli
  dicePool = signal<DicePool[]>([]);
  multiRollResult = signal<MultiRollResult | null>(null);
  
  // Presets per azioni comuni
  actionPresets: ActionPreset[] = [
    { name: 'Attacco', icon: '⚔️', dice: 20, description: 'Tiro per colpire' },
    { name: 'Salvezza', icon: '🛡️', dice: 20, description: 'Tiro salvezza' },
    { name: 'Iniziativa', icon: '⚡', dice: 20, description: 'Ordine di combattimento' },
    { name: 'Abilità', icon: '🎯', dice: 20, description: 'Prova di abilità' },
    { name: 'Danni d6', icon: '💥', dice: 6, description: 'Danni base' },
    { name: 'Danni d8', icon: '🔥', dice: 8, description: 'Danni marziali' },
    { name: 'Danni d10', icon: '💀', dice: 10, description: 'Danni pesanti' },
    { name: 'Guarigione', icon: '💚', dice: 8, description: 'Cura ferite' },
  ];
  
  // Per vantaggio/svantaggio
  firstRoll = signal<number | null>(null);
  secondRoll = signal<number | null>(null);
  rollType = signal<RollType>('normal');
  
  // Storico tiri
  rollHistory = signal<RollHistoryEntry[]>([]);
  private rollIdCounter = 0;
  private maxHistoryLength = 10;
  
  private animationDuration = 3000;

  // Computed per sapere quale tiro è stato usato
  isFirstRollUsed = computed(() => {
    const first = this.firstRoll();
    const second = this.secondRoll();
    const current = this.currentFace();
    if (first === null || second === null) return true;
    return current === first;
  });
  
  // Computed per verificare se è un d20 (per vantaggio/svantaggio)
  isD20 = computed(() => this.selectedDice() === 20);
  
  // Computed per la formula del pool
  poolFormula = computed(() => {
    const pool = this.dicePool();
    if (pool.length === 0) return '';
    return pool.map(p => `${p.count}d${p.dice}`).join(' + ');
  });
  
  // Computed per verificare se c'è un pool attivo
  hasPool = computed(() => this.dicePool().length > 0);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterRoute = this.route.snapshot.paramMap.get('character') || '';
    this.characterName = this.getCharacterName(this.characterRoute);
  }

  private getCharacterName(route: string): string {
    const names: Record<string, string> = {
      'asriel': 'Asriel',
      'auryn': 'Auryn',
      'ravel': 'Ravel',
      'ruben': 'Ruben'
    };
    return names[route] || '';
  }

  selectDice(sides: DiceType): void {
    this.selectedDice.set(sides);
    this.currentFace.set(null);
    this.firstRoll.set(null);
    this.secondRoll.set(null);
    this.information.set('');
    this.lastPresetUsed.set(null);
  }

  // Esegue un preset di azione
  executePreset(preset: ActionPreset): void {
    this.selectedDice.set(preset.dice);
    this.lastPresetUsed.set(preset.name);
    this.rollType.set(preset.rollType || 'normal');
    this.firstRoll.set(null);
    this.secondRoll.set(null);
    this.executeRoll(preset.name);
  }

  rollDice(): void {
    this.rollType.set('normal');
    this.firstRoll.set(null);
    this.secondRoll.set(null);
    this.lastPresetUsed.set(null);
    this.executeRoll();
  }

  rollWithAdvantage(): void {
    if (!this.isD20()) return;
    this.rollType.set('advantage');
    this.lastPresetUsed.set(null);
    this.executeDoubleRoll(true);
  }

  rollWithDisadvantage(): void {
    if (!this.isD20()) return;
    this.rollType.set('disadvantage');
    this.lastPresetUsed.set(null);
    this.executeDoubleRoll(false);
  }

  toggleSound(): void {
    const enabled = this.audioService.toggleSound();
    this.soundEnabled.set(enabled);
  }

  private executeRoll(presetName?: string): void {
    this.information.set('');
    this.isRolling.set(true);
    this.currentFace.set(null);
    this.audioService.playRollSound();

    setTimeout(() => {
      this.isRolling.set(false);
      const face = this.randomFace();
      this.currentFace.set(face);
      this.setInformation(face, undefined, presetName);
      this.addToHistory(face, 'normal', presetName);
      this.playResultSound(face);
    }, this.animationDuration);
  }

  private executeDoubleRoll(takeHigher: boolean): void {
    this.information.set('');
    this.isRolling.set(true);
    this.currentFace.set(null);
    this.firstRoll.set(null);
    this.secondRoll.set(null);
    this.audioService.playRollSound();

    setTimeout(() => {
      this.isRolling.set(false);
      const roll1 = this.randomFace();
      const roll2 = this.randomFace();
      
      this.firstRoll.set(roll1);
      this.secondRoll.set(roll2);
      
      const chosenFace = takeHigher 
        ? Math.max(roll1, roll2) 
        : Math.min(roll1, roll2);
      
      this.currentFace.set(chosenFace);
      const type = takeHigher ? 'advantage' : 'disadvantage';
      this.setInformation(chosenFace, type);
      this.addToHistory(chosenFace, type);
      this.playResultSound(chosenFace);
    }, this.animationDuration);
  }

  private playResultSound(face: number): void {
    const sides = this.selectedDice();
    if (face === sides) {
      this.audioService.playCriticalSuccess();
    } else if (face === 1) {
      this.audioService.playCriticalFail();
    } else {
      this.audioService.playResultSound();
    }
  }

  private addToHistory(face: number, type: RollType, presetName?: string, multiRoll?: MultiRollResult): void {
    const sides = this.selectedDice();
    const entry: RollHistoryEntry = {
      id: ++this.rollIdCounter,
      face,
      modifier: this.modifier || 0,
      total: face + (this.modifier || 0),
      type,
      diceType: sides,
      timestamp: new Date(),
      isCriticalSuccess: face === sides,
      isCriticalFail: face === 1,
      presetName,
      multiRoll
    };
    
    this.rollHistory.update(history => {
      const newHistory = [entry, ...history];
      return newHistory.slice(0, this.maxHistoryLength);
    });
  }

  // ===== METODI PER DICE POOL (TIRI MULTIPLI) =====
  
  addToPool(dice: DiceType): void {
    this.dicePool.update(pool => {
      const existing = pool.find(p => p.dice === dice);
      if (existing) {
        return pool.map(p => p.dice === dice ? { ...p, count: p.count + 1 } : p);
      }
      return [...pool, { dice, count: 1 }];
    });
  }
  
  removeFromPool(dice: DiceType): void {
    this.dicePool.update(pool => {
      const existing = pool.find(p => p.dice === dice);
      if (!existing) return pool;
      
      if (existing.count > 1) {
        return pool.map(p => p.dice === dice ? { ...p, count: p.count - 1 } : p);
      }
      return pool.filter(p => p.dice !== dice);
    });
  }
  
  clearPool(): void {
    this.dicePool.set([]);
    this.multiRollResult.set(null);
  }
  
  getDiceCountInPool(dice: DiceType): number {
    const pool = this.dicePool();
    const entry = pool.find(p => p.dice === dice);
    return entry?.count || 0;
  }
  
  rollPool(): void {
    const pool = this.dicePool();
    if (pool.length === 0) return;
    
    this.isRolling.set(true);
    this.audioService.playRollSound();
    
    setTimeout(() => {
      this.isRolling.set(false);
      
      const results: MultiRollResult = {
        pools: [],
        total: 0,
        formula: this.poolFormula()
      };
      
      for (const p of pool) {
        const rolls: number[] = [];
        let subtotal = 0;
        
        for (let i = 0; i < p.count; i++) {
          const roll = Math.floor(Math.random() * p.dice) + 1;
          rolls.push(roll);
          subtotal += roll;
        }
        
        results.pools.push({
          dice: p.dice,
          rolls,
          subtotal
        });
        results.total += subtotal;
      }
      
      // Aggiungi modificatore
      results.total += (this.modifier || 0);
      
      this.multiRollResult.set(results);
      this.audioService.playResultSound();
      
      // Aggiungi allo storico
      this.addToHistory(results.total, 'normal', 'Tiro Multiplo', results);
      
    }, this.animationDuration);
  }
  
  // Preset rapidi per combinazioni comuni
  addDamagePreset(formula: string): void {
    this.clearPool();
    
    // Parse formule come "2d6", "1d8+1d6", "3d8"
    const parts = formula.split('+').map(p => p.trim());
    
    for (const part of parts) {
      const match = part.match(/(\d+)d(\d+)/);
      if (match) {
        const count = parseInt(match[1], 10);
        const dice = parseInt(match[2], 10) as DiceType;
        
        for (let i = 0; i < count; i++) {
          this.addToPool(dice);
        }
      }
    }
  }

  clearHistory(): void {
    this.rollHistory.set([]);
  }

  getTypeIcon(type: RollType): string {
    switch (type) {
      case 'advantage': return '⬆️';
      case 'disadvantage': return '⬇️';
      default: return '🎲';
    }
  }
  
  getDiceLabel(sides: DiceType): string {
    return `d${sides}`;
  }

  private randomFace(): number {
    return Math.floor((Math.random() * this.selectedDice())) + 1;
  }

  private setInformation(face: number, type?: 'advantage' | 'disadvantage', presetName?: string): void {
    const sides = this.selectedDice();
    let prefix = '';
    
    if (presetName) {
      prefix = `[${presetName}] `;
    }
    
    if (type === 'advantage') {
      prefix += '(Vantaggio) ';
    } else if (type === 'disadvantage') {
      prefix += '(Svantaggio) ';
    }

    if (face === 1) {
      this.information.set(prefix + 'Fallimento critico! 💀');
    } else if (face === sides) {
      this.information.set(prefix + 'Massimo! ⚔️');
    } else {
      const total = this.getTotal();
      const threshold = sides * 0.7;
      if (total >= threshold) {
        this.information.set(prefix + 'Ottimo tiro!');
      } else if (total >= sides * 0.5) {
        this.information.set(prefix + 'Buon tiro!');
      } else {
        this.information.set(prefix + 'Poteva andare meglio...');
      }
    }
  }

  getTotal(): number {
    const face = this.currentFace();
    if (face === null) return 0;
    return face + (this.modifier || 0);
  }

  goBack(): void {
    this.router.navigate([this.characterRoute, 'home']);
  }
}
