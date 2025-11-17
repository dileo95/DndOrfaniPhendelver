import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

// Interfaces
export interface PlayerNote {
  id?: number;
  character: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface CharacterSheet {
  id?: number;
  character: string;
  
  // Statistiche base
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Info base
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  
  // Combattimento
  armorClass: number;
  initiative: number;
  speed: number;
  currentHP: number;
  maxHP: number;
  temporaryHP: number;
  hitDice: string;
  
  // Proficiency
  proficiencyBonus: number;
  savingThrows: string[];
  skills: { [key: string]: number };
  
  // Equipaggiamento
  weapons: Weapon[];
  armor: string;
  equipment: string[];
  
  // Incantesimi
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spells: Spell[];
  spellSlots?: { [level: number]: { max: number; current: number } };
  
  // Tratti e abilità
  features: string[];
  traits: string[];
  
  updatedAt: Date;
}

export interface Weapon {
  name: string;
  damage: string;
  damageType: string;
  attackBonus: number;
  properties?: string;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
}

export interface DiceRoll {
  id?: number;
  character: string;
  type: string; // 'attack', 'damage', 'save', 'check', 'initiative'
  roll: number;
  modifier: number;
  total: number;
  details: string;
  timestamp: Date;
}

export interface CombatEncounter {
  id?: number;
  character: string;
  enemyName: string;
  enemyHP: number;
  enemyMaxHP: number;
  enemyAC: number;
  playerHP: number;
  playerMaxHP: number;
  rounds: CombatRound[];
  result?: 'victory' | 'defeat' | 'ongoing';
  timestamp: Date;
}

export interface CombatRound {
  roundNumber: number;
  actions: CombatAction[];
}

export interface CombatAction {
  actor: 'player' | 'enemy';
  type: 'attack' | 'spell' | 'defend' | 'item';
  roll?: number;
  damage?: number;
  healing?: number;
  description: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  notes!: Table<PlayerNote, number>;
  sheets!: Table<CharacterSheet, number>;
  rolls!: Table<DiceRoll, number>;
  combats!: Table<CombatEncounter, number>;

  constructor() {
    super('PhendelverDB');
    
    this.version(1).stores({
      notes: '++id, character, createdAt, updatedAt',
      sheets: '++id, character, updatedAt',
      rolls: '++id, character, timestamp',
      combats: '++id, character, timestamp'
    });
  }

  // ========== NOTES ==========
  async addNote(note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await this.notes.add({
      ...note,
      createdAt: now,
      updatedAt: now
    });
  }

  async getNotesByCharacter(character: string): Promise<PlayerNote[]> {
    return await this.notes
      .where('character')
      .equals(character)
      .reverse()
      .sortBy('updatedAt');
  }

  async updateNote(id: number, updates: Partial<PlayerNote>): Promise<number> {
    return await this.notes.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deleteNote(id: number): Promise<void> {
    await this.notes.delete(id);
  }

  // ========== CHARACTER SHEETS ==========
  async saveCharacterSheet(sheet: Omit<CharacterSheet, 'id' | 'updatedAt'>): Promise<number> {
    const existing = await this.sheets.where('character').equals(sheet.character).first();
    
    if (existing) {
      await this.sheets.update(existing.id!, {
        ...sheet,
        updatedAt: new Date()
      });
      return existing.id!;
    } else {
      return await this.sheets.add({
        ...sheet,
        updatedAt: new Date()
      });
    }
  }

  async getCharacterSheet(character: string): Promise<CharacterSheet | undefined> {
    return await this.sheets.where('character').equals(character).first();
  }

  async updateCharacterHP(character: string, currentHP: number, temporaryHP: number = 0): Promise<void> {
    const sheet = await this.getCharacterSheet(character);
    if (sheet) {
      await this.sheets.update(sheet.id!, {
        currentHP,
        temporaryHP,
        updatedAt: new Date()
      });
    }
  }

  // ========== DICE ROLLS ==========
  async addDiceRoll(roll: Omit<DiceRoll, 'id' | 'timestamp'>): Promise<number> {
    return await this.rolls.add({
      ...roll,
      timestamp: new Date()
    });
  }

  async getRollsByCharacter(character: string, limit: number = 50): Promise<DiceRoll[]> {
    return await this.rolls
      .where('character')
      .equals(character)
      .reverse()
      .limit(limit)
      .toArray();
  }

  // ========== COMBAT ==========
  async saveCombatEncounter(combat: Omit<CombatEncounter, 'id' | 'timestamp'>): Promise<number> {
    return await this.combats.add({
      ...combat,
      timestamp: new Date()
    });
  }

  async getCombatsByCharacter(character: string, limit: number = 20): Promise<CombatEncounter[]> {
    return await this.combats
      .where('character')
      .equals(character)
      .reverse()
      .limit(limit)
      .toArray();
  }

  async updateCombat(id: number, updates: Partial<CombatEncounter>): Promise<number> {
    return await this.combats.update(id, updates);
  }
}
