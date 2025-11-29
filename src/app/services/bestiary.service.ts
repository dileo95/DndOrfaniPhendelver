import { Injectable } from '@angular/core';

// ============ CREATURE INTERFACE ============
export interface Creature {
  id: string;
  name: string;
  type: 'humanoid' | 'beast' | 'undead' | 'giant' | 'dragon' | 'monstrosity';
  subtype?: string; // chromatic, metallic, etc.
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  cr: string;
  xp: number;
  hp: number;
  ac: number;
  speed: string;
  
  // Ability Scores
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  
  // Combat
  attackBonus: number;
  damage: string;
  damageType: string;
  abilities?: string[];
  
  // Flavor
  description: string;
  lore?: string;
  
  // Visual
  color: number;       // Colore principale per lo sprite
  spriteScale: number; // Moltiplicatore dimensione sprite
  spriteType: 'humanoid' | 'beast' | 'undead' | 'giant' | 'dragon_wyrmling' | 'dragon_young';
}

// ============ STANDARD MONSTERS ============
export const STANDARD_MONSTERS: Creature[] = [
  // CR 1/4
  { 
    id: 'goblin', name: 'Goblin', type: 'humanoid', size: 'small', cr: '1/4', xp: 50,
    hp: 7, ac: 15, speed: '30 ft',
    str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8,
    attackBonus: 4, damage: '1d6+2', damageType: 'slashing',
    description: 'Piccolo e subdolo, attacca in gruppo.',
    lore: 'I goblin sono creature piccole e maligne che vivono in tribù nelle caverne e nelle foreste oscure.',
    color: 0x4a7c3f, spriteScale: 0.7, spriteType: 'humanoid'
  },
  { 
    id: 'skeleton', name: 'Scheletro', type: 'undead', size: 'medium', cr: '1/4', xp: 50,
    hp: 13, ac: 13, speed: '30 ft',
    str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5,
    attackBonus: 4, damage: '1d6+2', damageType: 'piercing',
    abilities: ['Vulnerabile: contundenti'],
    description: 'Guerriero non morto animato da magia oscura.',
    lore: 'Gli scheletri sono i resti di guerrieri caduti, rianimati per servire un padrone necromante.',
    color: 0xd4c9a8, spriteScale: 0.9, spriteType: 'undead'
  },
  { 
    id: 'wolf', name: 'Lupo', type: 'beast', size: 'medium', cr: '1/4', xp: 50,
    hp: 11, ac: 13, speed: '40 ft',
    str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6,
    attackBonus: 4, damage: '2d4+2', damageType: 'piercing',
    abilities: ['Tattica di branco'],
    description: 'Predatore veloce che caccia in gruppo.',
    lore: 'I lupi sono predatori intelligenti che usano tattiche di branco per abbattere prede più grandi.',
    color: 0x6b6b6b, spriteScale: 0.8, spriteType: 'beast'
  },
  
  // CR 1/2
  { 
    id: 'orc', name: 'Orco', type: 'humanoid', size: 'medium', cr: '1/2', xp: 100,
    hp: 15, ac: 13, speed: '30 ft',
    str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10,
    attackBonus: 5, damage: '1d12+3', damageType: 'slashing',
    abilities: ['Aggressivo'],
    description: 'Brutale e feroce guerriero.',
    lore: 'Gli orchi sono creature brutali che vivono per la guerra e il saccheggio.',
    color: 0x5a8a4a, spriteScale: 1.1, spriteType: 'humanoid'
  },
  { 
    id: 'hobgoblin', name: 'Hobgoblin', type: 'humanoid', size: 'medium', cr: '1/2', xp: 100,
    hp: 11, ac: 18, speed: '30 ft',
    str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9,
    attackBonus: 3, damage: '1d8+1', damageType: 'slashing',
    abilities: ['Vantaggio Marziale'],
    description: 'Guerriero disciplinato e strategico.',
    lore: 'Gli hobgoblin sono goblinoidi militaristi che formano eserciti organizzati.',
    color: 0xc45c3a, spriteScale: 1.0, spriteType: 'humanoid'
  },
  
  // CR 1
  { 
    id: 'bugbear', name: 'Bugbear', type: 'humanoid', size: 'medium', cr: '1', xp: 200,
    hp: 27, ac: 16, speed: '30 ft',
    str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9,
    attackBonus: 4, damage: '2d8+2', damageType: 'bludgeoning',
    abilities: ['Attacco a sorpresa (+2d6)'],
    description: 'Colpisce dalle ombre con forza brutale.',
    lore: 'I bugbear sono goblinoidi furtivi che amano tendere imboscate.',
    color: 0x8b5a2b, spriteScale: 1.3, spriteType: 'humanoid'
  },
  { 
    id: 'ghoul', name: 'Ghoul', type: 'undead', size: 'medium', cr: '1', xp: 200,
    hp: 22, ac: 12, speed: '30 ft',
    str: 13, dex: 15, con: 10, int: 7, wis: 10, cha: 6,
    attackBonus: 4, damage: '2d6+2', damageType: 'slashing',
    abilities: ['Paralisi (TS Cos 10)'],
    description: 'Non morto che paralizza le sue prede.',
    lore: 'I ghoul sono non morti che si nutrono di carne dei vivi, paralizzando le vittime col tocco.',
    color: 0x4a5a4a, spriteScale: 0.95, spriteType: 'undead'
  },
  
  // CR 2
  { 
    id: 'ogre', name: 'Ogre', type: 'giant', size: 'large', cr: '2', xp: 450,
    hp: 59, ac: 11, speed: '40 ft',
    str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7,
    attackBonus: 6, damage: '2d8+4', damageType: 'bludgeoning',
    description: 'Gigante devastante e stupido.',
    lore: 'Gli ogre sono giganti brutali che vivono per mangiare e distruggere.',
    color: 0x8b7355, spriteScale: 1.8, spriteType: 'giant'
  },
  { 
    id: 'ghast', name: 'Ghast', type: 'undead', size: 'medium', cr: '2', xp: 450,
    hp: 36, ac: 13, speed: '30 ft',
    str: 16, dex: 17, con: 10, int: 11, wis: 10, cha: 8,
    attackBonus: 5, damage: '2d8+3', damageType: 'slashing',
    abilities: ['Fetore (TS Cos 10)', 'Paralisi'],
    description: 'Ghoul potenziato con aura di fetore.',
    lore: 'I ghast sono ghoul evoluti, più intelligenti e con un\'aura nauseabonda.',
    color: 0x3a4a3a, spriteScale: 1.0, spriteType: 'undead'
  },
  
  // CR 3+
  { 
    id: 'owlbear', name: 'Gufolorso', type: 'monstrosity', size: 'large', cr: '3', xp: 700,
    hp: 59, ac: 13, speed: '40 ft',
    str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7,
    attackBonus: 7, damage: '2d8+5', damageType: 'slashing',
    abilities: ['Multiattacco (2 attacchi)'],
    description: 'Bestia feroce metà gufo metà orso.',
    lore: 'I guforsi sono creature feroci create da esperimenti magici, estremamente territoriali.',
    color: 0x5a4a3a, spriteScale: 1.5, spriteType: 'beast'
  },
  { 
    id: 'minotaur', name: 'Minotauro', type: 'monstrosity', size: 'large', cr: '3', xp: 700,
    hp: 76, ac: 14, speed: '40 ft',
    str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9,
    attackBonus: 6, damage: '2d12+4', damageType: 'slashing',
    abilities: ['Carica (+2d8)', 'Memoria Labirinto'],
    description: 'Bestia del labirinto con corna devastanti.',
    lore: 'I minotauri sono creature che vagano nei labirinti, cacciando chiunque vi si addentri.',
    color: 0x6a3a2a, spriteScale: 1.6, spriteType: 'beast'
  },
  { 
    id: 'troll', name: 'Troll', type: 'giant', size: 'large', cr: '5', xp: 1800,
    hp: 84, ac: 15, speed: '30 ft',
    str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7,
    attackBonus: 7, damage: '2d6+4', damageType: 'slashing',
    abilities: ['Rigenerazione 10 HP/round', 'Vulnerabile: fuoco/acido'],
    description: 'Gigante che si rigenera costantemente.',
    lore: 'I troll sono giganti verdi con un\'incredibile capacità rigenerativa, fermabile solo col fuoco.',
    color: 0x2a5a2a, spriteScale: 1.7, spriteType: 'giant'
  },
];

// ============ CHROMATIC DRAGONS (Evil) ============
export const CHROMATIC_DRAGONS: Creature[] = [
  // === BLACK DRAGON ===
  { 
    id: 'black_dragon_wyrmling', name: 'Drago Nero Cucciolo', type: 'dragon', subtype: 'chromatic',
    size: 'medium', cr: '2', xp: 450,
    hp: 33, ac: 17, speed: '30 ft, fly 60 ft, swim 30 ft',
    str: 15, dex: 14, con: 13, int: 10, wis: 11, cha: 13,
    attackBonus: 4, damage: '1d10+2', damageType: 'piercing',
    abilities: ['Soffio Acido (linea 5x30 ft, 5d8 acido, TS Des 11)'],
    description: 'Giovane drago delle paludi, crudele e sadico.',
    lore: 'I draghi neri abitano le paludi e amano torturare le loro prede prima di ucciderle.',
    color: 0x1a1a1a, spriteScale: 1.2, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_black_dragon', name: 'Drago Nero Giovane', type: 'dragon', subtype: 'chromatic',
    size: 'large', cr: '7', xp: 2900,
    hp: 127, ac: 18, speed: '40 ft, fly 80 ft, swim 40 ft',
    str: 19, dex: 14, con: 17, int: 12, wis: 11, cha: 15,
    attackBonus: 7, damage: '2d10+4', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Acido (linea 5x30 ft, 11d8 acido, TS Des 14)'],
    description: 'Drago delle paludi, maestro dell\'imboscata.',
    lore: 'I draghi neri giovani sono territoriali e malvagi, stabilendo il dominio su vaste paludi.',
    color: 0x0d0d0d, spriteScale: 1.8, spriteType: 'dragon_young'
  },

  // === BLUE DRAGON ===
  { 
    id: 'blue_dragon_wyrmling', name: 'Drago Blu Cucciolo', type: 'dragon', subtype: 'chromatic',
    size: 'medium', cr: '3', xp: 700,
    hp: 52, ac: 17, speed: '30 ft, fly 60 ft, burrow 15 ft',
    str: 17, dex: 10, con: 15, int: 12, wis: 11, cha: 15,
    attackBonus: 5, damage: '1d10+3', damageType: 'piercing',
    abilities: ['Soffio Fulmine (linea 5x30 ft, 4d10 fulmine, TS Des 12)'],
    description: 'Cucciolo del deserto, vanitoso e calcolatore.',
    lore: 'I draghi blu sono creature vanitose che amano essere temute e rispettate.',
    color: 0x1e90ff, spriteScale: 1.2, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_blue_dragon', name: 'Drago Blu Giovane', type: 'dragon', subtype: 'chromatic',
    size: 'large', cr: '9', xp: 5000,
    hp: 152, ac: 18, speed: '40 ft, fly 80 ft, burrow 20 ft',
    str: 21, dex: 10, con: 19, int: 14, wis: 13, cha: 17,
    attackBonus: 9, damage: '2d10+5', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Fulmine (linea 5x60 ft, 10d10 fulmine, TS Des 16)'],
    description: 'Signore delle tempeste del deserto.',
    lore: 'I draghi blu giovani costruiscono elaborate tane nel deserto e accumulano tesori scintillanti.',
    color: 0x0066cc, spriteScale: 1.8, spriteType: 'dragon_young'
  },

  // === GREEN DRAGON ===
  { 
    id: 'green_dragon_wyrmling', name: 'Drago Verde Cucciolo', type: 'dragon', subtype: 'chromatic',
    size: 'medium', cr: '2', xp: 450,
    hp: 38, ac: 17, speed: '30 ft, fly 60 ft, swim 30 ft',
    str: 15, dex: 12, con: 13, int: 14, wis: 11, cha: 13,
    attackBonus: 4, damage: '1d10+2', damageType: 'piercing',
    abilities: ['Soffio Veleno (cono 15 ft, 6d6 veleno, TS Cos 11)'],
    description: 'Astuto cucciolo delle foreste, manipolatore.',
    lore: 'I draghi verdi sono i più subdoli, preferendo manipolare piuttosto che combattere direttamente.',
    color: 0x228b22, spriteScale: 1.2, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_green_dragon', name: 'Drago Verde Giovane', type: 'dragon', subtype: 'chromatic',
    size: 'large', cr: '8', xp: 3900,
    hp: 136, ac: 18, speed: '40 ft, fly 80 ft, swim 40 ft',
    str: 19, dex: 12, con: 17, int: 16, wis: 13, cha: 15,
    attackBonus: 7, damage: '2d10+4', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Veleno (cono 30 ft, 12d6 veleno, TS Cos 14)'],
    description: 'Maestro della manipolazione delle foreste.',
    lore: 'I draghi verdi giovani stabiliscono il dominio su vaste foreste, corrompendo la vita che vi abita.',
    color: 0x006400, spriteScale: 1.8, spriteType: 'dragon_young'
  },

  // === RED DRAGON ===
  { 
    id: 'red_dragon_wyrmling', name: 'Drago Rosso Cucciolo', type: 'dragon', subtype: 'chromatic',
    size: 'medium', cr: '4', xp: 1100,
    hp: 75, ac: 17, speed: '30 ft, fly 60 ft, climb 30 ft',
    str: 19, dex: 10, con: 17, int: 12, wis: 11, cha: 15,
    attackBonus: 6, damage: '1d10+4', damageType: 'piercing',
    abilities: ['Soffio Fuoco (cono 15 ft, 7d6 fuoco, TS Des 13)'],
    description: 'Cucciolo arrogante e distruttivo.',
    lore: 'I draghi rossi sono i più temuti, con un ego smisurato e una furia devastante.',
    color: 0xdc143c, spriteScale: 1.3, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_red_dragon', name: 'Drago Rosso Giovane', type: 'dragon', subtype: 'chromatic',
    size: 'large', cr: '10', xp: 5900,
    hp: 178, ac: 18, speed: '40 ft, fly 80 ft, climb 40 ft',
    str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19,
    attackBonus: 10, damage: '2d10+6', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Fuoco (cono 30 ft, 16d6 fuoco, TS Des 17)'],
    description: 'Terrore delle montagne, signore del fuoco.',
    lore: 'I draghi rossi giovani stabiliscono tane in montagne vulcaniche, accumulando tesori immensi.',
    color: 0x8b0000, spriteScale: 2.0, spriteType: 'dragon_young'
  },

  // === WHITE DRAGON ===
  { 
    id: 'white_dragon_wyrmling', name: 'Drago Bianco Cucciolo', type: 'dragon', subtype: 'chromatic',
    size: 'medium', cr: '2', xp: 450,
    hp: 32, ac: 16, speed: '30 ft, fly 60 ft, burrow 15 ft, swim 30 ft',
    str: 14, dex: 10, con: 14, int: 5, wis: 10, cha: 11,
    attackBonus: 4, damage: '1d10+2', damageType: 'piercing',
    abilities: ['Soffio Gelo (cono 15 ft, 5d8 freddo, TS Cos 12)'],
    description: 'Cucciolo bestiale dei ghiacci.',
    lore: 'I draghi bianchi sono i meno intelligenti ma i più feroci, cacciando come animali.',
    color: 0xf0f8ff, spriteScale: 1.1, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_white_dragon', name: 'Drago Bianco Giovane', type: 'dragon', subtype: 'chromatic',
    size: 'large', cr: '6', xp: 2300,
    hp: 133, ac: 17, speed: '40 ft, fly 80 ft, burrow 20 ft, swim 40 ft',
    str: 18, dex: 10, con: 18, int: 6, wis: 11, cha: 12,
    attackBonus: 7, damage: '2d10+4', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Gelo (cono 30 ft, 10d8 freddo, TS Cos 15)'],
    description: 'Predatore implacabile delle terre ghiacciate.',
    lore: 'I draghi bianchi giovani dominano vaste distese di ghiaccio, cacciando tutto ciò che si muove.',
    color: 0xe8e8e8, spriteScale: 1.7, spriteType: 'dragon_young'
  },
];

// ============ METALLIC DRAGONS (Good) ============
export const METALLIC_DRAGONS: Creature[] = [
  // === BRASS DRAGON ===
  { 
    id: 'brass_dragon_wyrmling', name: 'Drago d\'Ottone Cucciolo', type: 'dragon', subtype: 'metallic',
    size: 'medium', cr: '1', xp: 200,
    hp: 16, ac: 16, speed: '30 ft, fly 60 ft, burrow 15 ft',
    str: 15, dex: 10, con: 13, int: 10, wis: 11, cha: 13,
    attackBonus: 4, damage: '1d10+2', damageType: 'piercing',
    abilities: ['Soffio Fuoco (linea 20 ft, 4d6 fuoco, TS Des 11)', 'Soffio Sonno (cono 15 ft, TS Cos 11)'],
    description: 'Cucciolo chiacchierone del deserto.',
    lore: 'I draghi d\'ottone amano conversare e sono noti per trattenere i viaggiatori con lunghe discussioni.',
    color: 0xb5a642, spriteScale: 1.1, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_brass_dragon', name: 'Drago d\'Ottone Giovane', type: 'dragon', subtype: 'metallic',
    size: 'large', cr: '6', xp: 2300,
    hp: 110, ac: 17, speed: '40 ft, fly 80 ft, burrow 20 ft',
    str: 19, dex: 10, con: 17, int: 12, wis: 11, cha: 15,
    attackBonus: 7, damage: '2d10+4', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Fuoco (linea 40 ft, 9d6 fuoco, TS Des 14)', 'Soffio Sonno'],
    description: 'Amichevole guardiano del deserto.',
    lore: 'I draghi d\'ottone giovani stabiliscono tane nel deserto dove accolgono viaggiatori per conversare.',
    color: 0x8b7500, spriteScale: 1.7, spriteType: 'dragon_young'
  },

  // === BRONZE DRAGON ===
  { 
    id: 'bronze_dragon_wyrmling', name: 'Drago di Bronzo Cucciolo', type: 'dragon', subtype: 'metallic',
    size: 'medium', cr: '2', xp: 450,
    hp: 32, ac: 17, speed: '30 ft, fly 60 ft, swim 30 ft',
    str: 17, dex: 10, con: 15, int: 12, wis: 11, cha: 15,
    attackBonus: 5, damage: '1d10+3', damageType: 'piercing',
    abilities: ['Soffio Fulmine (linea 40 ft, 3d10 fulmine, TS Des 12)', 'Soffio Repulsione'],
    description: 'Cucciolo costiero, combatte l\'ingiustizia.',
    lore: 'I draghi di bronzo amano il mare e spesso aiutano i marinai contro i pirati.',
    color: 0xcd7f32, spriteScale: 1.2, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_bronze_dragon', name: 'Drago di Bronzo Giovane', type: 'dragon', subtype: 'metallic',
    size: 'large', cr: '8', xp: 3900,
    hp: 142, ac: 18, speed: '40 ft, fly 80 ft, swim 40 ft',
    str: 21, dex: 10, con: 19, int: 14, wis: 13, cha: 17,
    attackBonus: 8, damage: '2d10+5', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Fulmine (linea 60 ft, 7d10 fulmine, TS Des 15)', 'Cambia Forma'],
    description: 'Campione della giustizia delle coste.',
    lore: 'I draghi di bronzo giovani prendono spesso forme umanoidi per osservare e proteggere le comunità costiere.',
    color: 0x8b4513, spriteScale: 1.8, spriteType: 'dragon_young'
  },

  // === COPPER DRAGON ===
  { 
    id: 'copper_dragon_wyrmling', name: 'Drago di Rame Cucciolo', type: 'dragon', subtype: 'metallic',
    size: 'medium', cr: '1', xp: 200,
    hp: 22, ac: 16, speed: '30 ft, fly 60 ft, climb 30 ft',
    str: 15, dex: 12, con: 13, int: 14, wis: 11, cha: 13,
    attackBonus: 4, damage: '1d10+2', damageType: 'piercing',
    abilities: ['Soffio Acido (linea 20 ft, 4d8 acido, TS Des 11)', 'Soffio Rallentamento'],
    description: 'Cucciolo scherzoso delle colline.',
    lore: 'I draghi di rame sono burloni noti per i loro scherzi e indovinelli.',
    color: 0xb87333, spriteScale: 1.1, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_copper_dragon', name: 'Drago di Rame Giovane', type: 'dragon', subtype: 'metallic',
    size: 'large', cr: '7', xp: 2900,
    hp: 119, ac: 17, speed: '40 ft, fly 80 ft, climb 40 ft',
    str: 19, dex: 12, con: 17, int: 16, wis: 13, cha: 15,
    attackBonus: 7, damage: '2d10+4', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Acido (linea 40 ft, 9d8 acido, TS Des 14)', 'Soffio Rallentamento'],
    description: 'Maestro degli scherzi delle colline.',
    lore: 'I draghi di rame giovani amano accumulare tesori ma ancora di più raccontare e ascoltare storie.',
    color: 0x9a5a00, spriteScale: 1.7, spriteType: 'dragon_young'
  },

  // === GOLD DRAGON ===
  { 
    id: 'gold_dragon_wyrmling', name: 'Drago d\'Oro Cucciolo', type: 'dragon', subtype: 'metallic',
    size: 'medium', cr: '3', xp: 700,
    hp: 60, ac: 17, speed: '30 ft, fly 60 ft, swim 30 ft',
    str: 19, dex: 14, con: 17, int: 14, wis: 11, cha: 16,
    attackBonus: 6, damage: '1d10+4', damageType: 'piercing',
    abilities: ['Soffio Fuoco (cono 15 ft, 6d10 fuoco, TS Des 13)', 'Soffio Indebolimento'],
    description: 'Cucciolo nobile e saggio.',
    lore: 'I draghi d\'oro sono i più nobili e potenti dei draghi metallici.',
    color: 0xffd700, spriteScale: 1.3, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_gold_dragon', name: 'Drago d\'Oro Giovane', type: 'dragon', subtype: 'metallic',
    size: 'large', cr: '10', xp: 5900,
    hp: 178, ac: 18, speed: '40 ft, fly 80 ft, swim 40 ft',
    str: 23, dex: 14, con: 21, int: 16, wis: 13, cha: 20,
    attackBonus: 10, damage: '2d10+6', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Fuoco (cono 30 ft, 10d10 fuoco, TS Des 17)', 'Cambia Forma'],
    description: 'Campione della luce e della giustizia.',
    lore: 'I draghi d\'oro giovani spesso prendono forme umanoidi per vivere tra i mortali e combattere il male.',
    color: 0xdaa520, spriteScale: 2.0, spriteType: 'dragon_young'
  },

  // === SILVER DRAGON ===
  { 
    id: 'silver_dragon_wyrmling', name: 'Drago d\'Argento Cucciolo', type: 'dragon', subtype: 'metallic',
    size: 'medium', cr: '2', xp: 450,
    hp: 45, ac: 17, speed: '30 ft, fly 60 ft',
    str: 19, dex: 10, con: 17, int: 12, wis: 11, cha: 15,
    attackBonus: 6, damage: '1d10+4', damageType: 'piercing',
    abilities: ['Soffio Gelo (cono 15 ft, 5d8 freddo, TS Cos 13)', 'Soffio Paralisi'],
    description: 'Cucciolo amichevole delle montagne.',
    lore: 'I draghi d\'argento sono i più amichevoli verso gli umanoidi e amano le loro compagnie.',
    color: 0xc0c0c0, spriteScale: 1.2, spriteType: 'dragon_wyrmling'
  },
  { 
    id: 'young_silver_dragon', name: 'Drago d\'Argento Giovane', type: 'dragon', subtype: 'metallic',
    size: 'large', cr: '9', xp: 5000,
    hp: 168, ac: 18, speed: '40 ft, fly 80 ft',
    str: 23, dex: 10, con: 21, int: 14, wis: 13, cha: 19,
    attackBonus: 10, damage: '2d10+6', damageType: 'piercing',
    abilities: ['Multiattacco (3 attacchi)', 'Soffio Gelo (cono 30 ft, 10d8 freddo, TS Cos 17)', 'Cambia Forma'],
    description: 'Protettore gentile delle comunità montane.',
    lore: 'I draghi d\'argento giovani spesso assumono forma umana per vivere nelle comunità che proteggono.',
    color: 0xa0a0a0, spriteScale: 1.9, spriteType: 'dragon_young'
  },
];

// ============ ALL CREATURES ============
export const ALL_CREATURES: Creature[] = [
  ...STANDARD_MONSTERS,
  ...CHROMATIC_DRAGONS,
  ...METALLIC_DRAGONS,
];

// ============ SERVICE ============
@Injectable({
  providedIn: 'root'
})
export class BestiaryService {
  
  getAllCreatures(): Creature[] {
    return ALL_CREATURES;
  }

  getCreatureById(id: string): Creature | undefined {
    return ALL_CREATURES.find(c => c.id === id);
  }

  getCreaturesByType(type: Creature['type']): Creature[] {
    return ALL_CREATURES.filter(c => c.type === type);
  }

  getCreaturesByCR(cr: string): Creature[] {
    return ALL_CREATURES.filter(c => c.cr === cr);
  }

  getDragons(): Creature[] {
    return ALL_CREATURES.filter(c => c.type === 'dragon');
  }

  getChromaticDragons(): Creature[] {
    return CHROMATIC_DRAGONS;
  }

  getMetallicDragons(): Creature[] {
    return METALLIC_DRAGONS;
  }

  getStandardMonsters(): Creature[] {
    return STANDARD_MONSTERS;
  }

  // Converte CR string in numero per ordinamento
  crToNumber(cr: string): number {
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseFloat(cr);
  }

  // Ordina creature per CR
  sortByCR(creatures: Creature[]): Creature[] {
    return [...creatures].sort((a, b) => this.crToNumber(a.cr) - this.crToNumber(b.cr));
  }

  // Calcola modificatore abilità
  getModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  formatModifier(score: number): string {
    const mod = this.getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }
}
