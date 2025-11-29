import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { DatabaseService } from './database.service';

// Definizione dei comandi vocali
export interface VoiceCommand {
  patterns: string[];           // Pattern da riconoscere (regex-like)
  action: string;               // Identificativo azione
  requiresCharacter: boolean;   // Richiede contesto personaggio?
  description: string;          // Descrizione per il tutorial
  category: 'dice' | 'info' | 'navigation' | 'combat' | 'utility';
}

// Risultato di un tiro di dado
export interface DiceResult {
  dice: string;
  rolls: number[];
  modifier: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private toast = inject(ToastService);
  private db = inject(DatabaseService);

  // Stato
  isListening = signal(false);
  isSupported = signal(false);
  lastCommand = signal<string>('');
  currentCharacter = signal<string | null>(null);

  // Speech Recognition
  private recognition: any = null;
  private isInitialized = false;

  // Callback per azioni esterne (dice roller, combat, etc.)
  private actionCallbacks: Map<string, (params?: any) => void> = new Map();

  // Definizione comandi
  readonly commands: VoiceCommand[] = [
    // === DADI ===
    { patterns: ['tira dado', 'lancia dado', 'roll dice', 'apri dadi'], action: 'open_dice', requiresCharacter: true, description: 'Apre il dice roller', category: 'dice' },
    { patterns: ['tira d4', 'roll d4', 'lancia d4'], action: 'roll_d4', requiresCharacter: true, description: 'Tira 1d4', category: 'dice' },
    { patterns: ['tira d6', 'roll d6', 'lancia d6'], action: 'roll_d6', requiresCharacter: true, description: 'Tira 1d6', category: 'dice' },
    { patterns: ['tira d8', 'roll d8', 'lancia d8'], action: 'roll_d8', requiresCharacter: true, description: 'Tira 1d8', category: 'dice' },
    { patterns: ['tira d10', 'roll d10', 'lancia d10'], action: 'roll_d10', requiresCharacter: true, description: 'Tira 1d10', category: 'dice' },
    { patterns: ['tira d12', 'roll d12', 'lancia d12'], action: 'roll_d12', requiresCharacter: true, description: 'Tira 1d12', category: 'dice' },
    { patterns: ['tira d20', 'roll d20', 'lancia d20', 'd20', 'tira venti'], action: 'roll_d20', requiresCharacter: true, description: 'Tira 1d20', category: 'dice' },
    { patterns: ['tira d100', 'roll d100', 'lancia d100', 'percentuale'], action: 'roll_d100', requiresCharacter: true, description: 'Tira 1d100', category: 'dice' },
    { patterns: ['tira iniziativa', 'roll initiative', 'iniziativa'], action: 'roll_initiative', requiresCharacter: true, description: 'Tira iniziativa (d20 + DES)', category: 'dice' },
    { patterns: ['tira attacco', 'roll attack', 'attacco'], action: 'roll_attack', requiresCharacter: true, description: 'Tira attacco con arma', category: 'dice' },
    { patterns: ['tira danno', 'roll damage', 'danno'], action: 'roll_damage', requiresCharacter: true, description: 'Tira danno arma', category: 'dice' },
    
    // Salvezze
    { patterns: ['tira salvezza forza', 'salvezza forza', 'save strength'], action: 'roll_save_str', requiresCharacter: true, description: 'Tiro salvezza Forza', category: 'dice' },
    { patterns: ['tira salvezza destrezza', 'salvezza destrezza', 'save dex'], action: 'roll_save_dex', requiresCharacter: true, description: 'Tiro salvezza Destrezza', category: 'dice' },
    { patterns: ['tira salvezza costituzione', 'salvezza costituzione', 'save con'], action: 'roll_save_con', requiresCharacter: true, description: 'Tiro salvezza Costituzione', category: 'dice' },
    { patterns: ['tira salvezza intelligenza', 'salvezza intelligenza', 'save int'], action: 'roll_save_int', requiresCharacter: true, description: 'Tiro salvezza Intelligenza', category: 'dice' },
    { patterns: ['tira salvezza saggezza', 'salvezza saggezza', 'save wis'], action: 'roll_save_wis', requiresCharacter: true, description: 'Tiro salvezza Saggezza', category: 'dice' },
    { patterns: ['tira salvezza carisma', 'salvezza carisma', 'save cha'], action: 'roll_save_cha', requiresCharacter: true, description: 'Tiro salvezza Carisma', category: 'dice' },

    // === INFORMAZIONI PERSONAGGIO ===
    { patterns: ['quanti hp ho', 'punti ferita', 'hp', 'vita', 'quanta vita ho'], action: 'info_hp', requiresCharacter: true, description: 'Legge HP attuali', category: 'info' },
    { patterns: ['classe armatura', 'ca', 'armor class', 'ac'], action: 'info_ac', requiresCharacter: true, description: 'Legge la CA', category: 'info' },
    { patterns: ['slot incantesimi', 'spell slot', 'incantesimi'], action: 'info_slots', requiresCharacter: true, description: 'Legge slot incantesimi', category: 'info' },
    { patterns: ['livello', 'che livello sono', 'level'], action: 'info_level', requiresCharacter: true, description: 'Legge classe e livello', category: 'info' },
    { patterns: ['statistiche', 'caratteristiche', 'stats', 'abilities'], action: 'info_stats', requiresCharacter: true, description: 'Legge le 6 caratteristiche', category: 'info' },

    // === NAVIGAZIONE ===
    { patterns: ['apri scheda', 'scheda personaggio', 'character sheet', 'vai alla scheda'], action: 'nav_sheet', requiresCharacter: true, description: 'Apre la scheda personaggio', category: 'navigation' },
    { patterns: ['apri bestiario', 'bestiario', 'bestiary', 'mostri'], action: 'nav_bestiary', requiresCharacter: false, description: 'Apre il bestiario', category: 'navigation' },
    { patterns: ['apri diario', 'diario', 'diary', 'vai al diario'], action: 'nav_diary', requiresCharacter: true, description: 'Apre il diario', category: 'navigation' },
    { patterns: ['apri mappa', 'mappa', 'story map', 'vai alla mappa'], action: 'nav_map', requiresCharacter: false, description: 'Apre la mappa', category: 'navigation' },
    { patterns: ['apri timeline', 'timeline', 'cronologia'], action: 'nav_timeline', requiresCharacter: false, description: 'Apre la timeline', category: 'navigation' },
    { patterns: ['apri combattimento', 'combattimento', 'combat', 'battaglia'], action: 'nav_combat', requiresCharacter: true, description: 'Apre il combat game', category: 'navigation' },
    { patterns: ['apri galleria', 'galleria', 'artbook', 'gallery'], action: 'nav_gallery', requiresCharacter: false, description: 'Apre la galleria', category: 'navigation' },
    { patterns: ['torna indietro', 'indietro', 'back', 'go back'], action: 'nav_back', requiresCharacter: false, description: 'Torna indietro', category: 'navigation' },
    { patterns: ['vai a casa', 'home', 'torna a casa', 'menu principale'], action: 'nav_home', requiresCharacter: false, description: 'Torna alla home', category: 'navigation' },

    // === COMBATTIMENTO ===
    { patterns: ['attacca', 'attack', 'colpisci'], action: 'combat_attack', requiresCharacter: true, description: 'Attacca con arma', category: 'combat' },
    { patterns: ['difendi', 'defend', 'difesa', 'mi difendo'], action: 'combat_defend', requiresCharacter: true, description: 'Attiva difesa (+2 CA)', category: 'combat' },
    { patterns: ['usa pozione', 'pozione', 'bevi pozione', 'cura'], action: 'combat_potion', requiresCharacter: true, description: 'Usa pozione di cura', category: 'combat' },

    // === UTILITY ===
    { patterns: ['salva', 'salva scheda', 'save', 'salva tutto'], action: 'util_save', requiresCharacter: true, description: 'Salva la scheda', category: 'utility' },
    { patterns: ['aiuto', 'help', 'comandi', 'cosa posso dire', 'lista comandi'], action: 'util_help', requiresCharacter: false, description: 'Mostra lista comandi', category: 'utility' },
    { patterns: ['stop', 'basta', 'smetti', 'stop listening', 'disattiva'], action: 'util_stop', requiresCharacter: false, description: 'Disattiva ascolto', category: 'utility' },
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSpeechRecognition();
    }
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('🎤 Speech Recognition non supportato in questo browser');
      this.isSupported.set(false);
      return;
    }

    this.isSupported.set(true);
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'it-IT';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      console.log('🎤 Riconosciuto:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('🎤 Errore:', event.error);
      if (event.error === 'not-allowed') {
        this.toast.error('Microfono non autorizzato. Controlla i permessi del browser.');
        this.stop();
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        // Riprova automaticamente per errori non critici
        setTimeout(() => {
          if (this.isListening()) {
            this.recognition.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      // Riavvia se dovrebbe essere ancora in ascolto
      if (this.isListening()) {
        try {
          this.recognition.start();
        } catch (e) {
          // Ignora errori di start multipli
        }
      }
    };

    this.isInitialized = true;
  }

  /** Avvia l'ascolto vocale */
  start() {
    if (!this.isSupported() || !this.isInitialized) {
      this.toast.error('Comandi vocali non supportati in questo browser');
      return;
    }

    try {
      this.recognition.start();
      this.isListening.set(true);
      this.toast.success('🎤 Ascolto attivo. Dimmi un comando!');
    } catch (error) {
      console.error('Errore avvio riconoscimento:', error);
    }
  }

  /** Ferma l'ascolto vocale */
  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.isListening.set(false);
  }

  /** Toggle ascolto */
  toggle() {
    if (this.isListening()) {
      this.stop();
    } else {
      this.start();
    }
  }

  /** Imposta il personaggio corrente (chiamato dalla route) */
  setCurrentCharacter(character: string | null) {
    this.currentCharacter.set(character);
  }

  /** Registra un callback per un'azione */
  registerAction(action: string, callback: (params?: any) => void) {
    this.actionCallbacks.set(action, callback);
  }

  /** Rimuovi un callback */
  unregisterAction(action: string) {
    this.actionCallbacks.delete(action);
  }

  /** Processa il comando riconosciuto */
  private processCommand(transcript: string) {
    this.lastCommand.set(transcript);

    // Cerca il comando corrispondente
    for (const cmd of this.commands) {
      for (const pattern of cmd.patterns) {
        if (transcript.includes(pattern)) {
          // Verifica se richiede un personaggio
          if (cmd.requiresCharacter && !this.currentCharacter()) {
            this.toast.warning(`⚠️ Devi selezionare un personaggio per usare "${pattern}"`);
            this.speak('Devi prima selezionare un personaggio');
            return;
          }

          // Esegui l'azione
          this.executeAction(cmd.action, transcript);
          return;
        }
      }
    }

    // Comando non riconosciuto
    this.toast.info(`🤔 Non ho capito: "${transcript}"`);
  }

  /** Esegue l'azione corrispondente al comando */
  private async executeAction(action: string, transcript: string) {
    console.log('🎯 Eseguo azione:', action);

    // Controlla se c'è un callback registrato
    const callback = this.actionCallbacks.get(action);
    if (callback) {
      callback(transcript);
      return;
    }

    // Azioni built-in
    switch (action) {
      // === DADI ===
      case 'roll_d4': this.rollDice(4); break;
      case 'roll_d6': this.rollDice(6); break;
      case 'roll_d8': this.rollDice(8); break;
      case 'roll_d10': this.rollDice(10); break;
      case 'roll_d12': this.rollDice(12); break;
      case 'roll_d20': this.rollDice(20); break;
      case 'roll_d100': this.rollDice(100); break;
      case 'roll_initiative': await this.rollInitiative(); break;
      case 'roll_attack': await this.rollAttack(); break;
      case 'roll_damage': await this.rollDamage(); break;
      case 'roll_save_str': await this.rollSave('strength'); break;
      case 'roll_save_dex': await this.rollSave('dexterity'); break;
      case 'roll_save_con': await this.rollSave('constitution'); break;
      case 'roll_save_int': await this.rollSave('intelligence'); break;
      case 'roll_save_wis': await this.rollSave('wisdom'); break;
      case 'roll_save_cha': await this.rollSave('charisma'); break;

      // === INFO ===
      case 'info_hp': await this.speakHP(); break;
      case 'info_ac': await this.speakAC(); break;
      case 'info_level': await this.speakLevel(); break;
      case 'info_stats': await this.speakStats(); break;
      case 'info_slots': await this.speakSlots(); break;

      // === NAVIGAZIONE ===
      case 'nav_sheet': this.navigate('sheet'); break;
      case 'nav_bestiary': this.navigate('bestiary'); break;
      case 'nav_diary': this.navigate('diary'); break;
      case 'nav_map': this.navigate('map'); break;
      case 'nav_timeline': this.navigate('timeline'); break;
      case 'nav_combat': this.navigate('combat'); break;
      case 'nav_gallery': this.navigate('gallery'); break;
      case 'nav_back': window.history.back(); break;
      case 'nav_home': this.navigate('home'); break;
      case 'open_dice': this.navigate('dice'); break;

      // === UTILITY ===
      case 'util_help': this.showHelp(); break;
      case 'util_stop': 
        this.stop(); 
        this.toast.info('🎤 Ascolto disattivato');
        break;
      case 'util_save':
        this.toast.success('💾 Scheda salvata!');
        this.speak('Scheda salvata');
        break;

      default:
        console.warn('Azione non implementata:', action);
    }
  }

  // === METODI DADI ===

  private rollDice(sides: number, count: number = 1, modifier: number = 0): DiceResult {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    
    const result: DiceResult = {
      dice: `${count}d${sides}${modifier >= 0 ? '+' + modifier : modifier}`,
      rolls,
      modifier,
      total
    };

    // Feedback
    const rollsStr = rolls.join(' + ');
    const modStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
    this.toast.success(`🎲 ${count}d${sides}${modStr} = ${rollsStr}${modStr} = ${total}`);
    this.speak(`Hai tirato ${total}`);

    return result;
  }

  private async rollInitiative() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet) return;
    
    const dexMod = Math.floor((sheet.dexterity - 10) / 2);
    const result = this.rollDice(20, 1, dexMod);
    this.toast.success(`⚡ Iniziativa: ${result.total} (${result.rolls[0]} + ${dexMod})`);
    this.speak(`Iniziativa: ${result.total}`);
  }

  private async rollAttack() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet || !sheet.weapons?.length) {
      this.toast.warning('Nessuna arma equipaggiata');
      return;
    }
    
    const weapon = sheet.weapons[0];
    const result = this.rollDice(20, 1, weapon.attackBonus);
    const isCrit = result.rolls[0] === 20;
    const isFumble = result.rolls[0] === 1;
    
    if (isCrit) {
      this.toast.success(`💥 CRITICO! Attacco: ${result.total}`);
      this.speak('Critico!');
    } else if (isFumble) {
      this.toast.error(`💀 Fallimento critico!`);
      this.speak('Fallimento critico!');
    } else {
      this.toast.success(`⚔️ Attacco con ${weapon.name}: ${result.total}`);
      this.speak(`Attacco: ${result.total}`);
    }
  }

  private async rollDamage() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet || !sheet.weapons?.length) {
      this.toast.warning('Nessuna arma equipaggiata');
      return;
    }
    
    const weapon = sheet.weapons[0];
    const match = weapon.damage.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return;
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const mod = match[3] ? parseInt(match[3]) : 0;
    
    const result = this.rollDice(sides, count, mod);
    this.toast.success(`💥 Danno ${weapon.name}: ${result.total} ${weapon.damageType}`);
    this.speak(`Danno: ${result.total}`);
  }

  private async rollSave(ability: string) {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet) return;
    
    const score = (sheet as any)[ability] || 10;
    const mod = Math.floor((score - 10) / 2);
    // savingThrows è un array di stringhe con le abilità proficient (es. ['STR', 'CON'])
    const hasProficiency = sheet.savingThrows?.includes(ability.toUpperCase()) ?? false;
    const profBonus = hasProficiency ? sheet.proficiencyBonus : 0;
    const totalMod = mod + profBonus;
    
    const result = this.rollDice(20, 1, totalMod);
    const abilityName = this.getAbilityName(ability);
    this.toast.success(`🛡️ Salvezza ${abilityName}: ${result.total}`);
    this.speak(`Salvezza ${abilityName}: ${result.total}`);
  }

  // === METODI INFO ===

  private async speakHP() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet) return;
    
    const msg = `Hai ${sheet.currentHP} punti ferita su ${sheet.maxHP}`;
    this.toast.info(`❤️ HP: ${sheet.currentHP}/${sheet.maxHP}`);
    this.speak(msg);
  }

  private async speakAC() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet) return;
    
    const msg = `La tua classe armatura è ${sheet.armorClass}`;
    this.toast.info(`🛡️ CA: ${sheet.armorClass}`);
    this.speak(msg);
  }

  private async speakLevel() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet) return;
    
    const msg = `Sei un ${sheet.class} di livello ${sheet.level}`;
    this.toast.info(`📊 ${sheet.class} Lv.${sheet.level}`);
    this.speak(msg);
  }

  private async speakStats() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet) return;
    
    const stats = `Forza ${sheet.strength}, Destrezza ${sheet.dexterity}, Costituzione ${sheet.constitution}, Intelligenza ${sheet.intelligence}, Saggezza ${sheet.wisdom}, Carisma ${sheet.charisma}`;
    this.toast.info(`📊 FOR:${sheet.strength} DES:${sheet.dexterity} COS:${sheet.constitution} INT:${sheet.intelligence} SAG:${sheet.wisdom} CAR:${sheet.charisma}`);
    this.speak(stats);
  }

  private async speakSlots() {
    const sheet = await this.db.getCharacterSheet(this.currentCharacter()!);
    if (!sheet || !sheet.spellSlots) {
      this.speak('Non hai slot incantesimi');
      return;
    }
    
    let msg = 'Slot incantesimi: ';
    for (const [level, slots] of Object.entries(sheet.spellSlots)) {
      if ((slots as any).max > 0) {
        msg += `Livello ${level}: ${(slots as any).current} su ${(slots as any).max}. `;
      }
    }
    this.toast.info(`✨ ${msg}`);
    this.speak(msg);
  }

  // === NAVIGAZIONE ===

  private navigate(destination: string) {
    const char = this.currentCharacter();
    
    switch (destination) {
      case 'sheet':
        if (char) this.router.navigate([char, 'sheet']);
        break;
      case 'diary':
        if (char) this.router.navigate([char, 'diary']);
        break;
      case 'combat':
        if (char) this.router.navigate([char, 'combat']);
        break;
      case 'dice':
        if (char) this.router.navigate([char, 'dice']);
        break;
      case 'bestiary':
        this.router.navigate(['diary', 'bestiary']);
        break;
      case 'map':
        this.router.navigate(['diary', 'story-map']);
        break;
      case 'timeline':
        this.router.navigate(['diary', 'timeline']);
        break;
      case 'gallery':
        this.router.navigate(['diary', 'artbook']);
        break;
      case 'home':
        if (char) {
          this.router.navigate([char, 'home']);
        } else {
          this.router.navigate(['/']);
        }
        break;
    }
    
    this.toast.info(`🧭 Navigazione: ${destination}`);
  }

  // === UTILITY ===

  private showHelp() {
    // Emetti evento per aprire il modale aiuto
    const callback = this.actionCallbacks.get('show_help_modal');
    if (callback) {
      callback();
    } else {
      // Fallback: mostra toast con comandi base
      this.toast.info('🎤 Comandi: "tira d20", "quanti HP ho", "apri scheda", "aiuto", "stop"', 8000);
    }
    this.speak('Prova a dire: tira d20, quanti HP ho, apri scheda');
  }

  /** Text-to-Speech */
  speak(text: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if ('speechSynthesis' in window) {
      // Ferma eventuali speech in corso
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  private getAbilityName(ability: string): string {
    const names: Record<string, string> = {
      'strength': 'Forza',
      'dexterity': 'Destrezza',
      'constitution': 'Costituzione',
      'intelligence': 'Intelligenza',
      'wisdom': 'Saggezza',
      'charisma': 'Carisma'
    };
    return names[ability] || ability;
  }
}
