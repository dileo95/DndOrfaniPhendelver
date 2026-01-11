// ============================================================
// BASTION SYSTEM MODELS - D&D 2024 DMG
// ============================================================

// Tipi di Facility disponibili per livello
export type FacilityType = 
  // Livello 5+
  | 'arcane-study' | 'armory' | 'barracks' | 'garden' | 'library' | 'sanctuary' 
  | 'smithy' | 'storehouse' | 'workshop'
  // Livello 9+
  | 'gaming-hall' | 'greenhouse' | 'laboratory' 
  | 'sacristy' | 'scriptorium' | 'stable' | 'teleportation-circle' | 'theater' | 'training-area' | 'trophy-room'
  // Livello 13+
  | 'archive' | 'meditation-chamber' | 'menagerie' | 'observatory' | 'pub' | 'reliquary'
  // Livello 17+
  | 'demiplane' | 'guildhall' | 'sanctum' | 'war-room';

// Dimensioni facility
export type FacilitySize = 'cramped' | 'roomy' | 'vast';

// Tipi di ordini bastion
export type BastionOrderType = 
  | 'craft' | 'empower' | 'harvest' 
  | 'recruit' | 'research' | 'trade' | 'none';

// Stato dell'ordine
export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

// ============================================================
// FACILITY DEFINITIONS
// ============================================================

export interface FacilityDefinition {
  type: FacilityType;
  name: string;
  nameIt: string;
  icon: string;
  minLevel: number;
  baseCost: number; // GP (0 per special facilities - si ottengono con level up)
  buildTime: number; // giorni
  size: FacilitySize;
  orders: BastionOrderType[];
  description: string;
  hirelings: number; // numero di hireling inclusi
  prerequisite?: string; // requisito per costruire (DMG 2024)
  prerequisiteIt?: string; // requisito in italiano
  passiveBenefit?: string; // beneficio passivo (es. Charm)
  passiveBenefitIt?: string;
  craftOptions?: CraftOption[]; // opzioni specifiche per ordine Craft
  harvestOptions?: HarvestOption[]; // opzioni per ordine Harvest
  tradeOptions?: TradeOption[]; // opzioni per ordine Trade
  researchOptions?: ResearchOption[]; // opzioni per ordine Research
  empowerOptions?: EmpowerOption[]; // opzioni per ordine Empower
  recruitOptions?: RecruitOption[]; // opzioni per ordine Recruit
  enlargingCost?: number; // costo GP per espandere a Vast
  enlargingBenefit?: string; // beneficio dell'espansione
  enlargingBenefitIt?: string;
  maxCapacity?: number; // es. 12 defenders per Barracks
  maxCapacityEnlarged?: number; // es. 25 defenders per Vast Barracks
}

// Opzioni di craft specifiche per facility
export interface CraftOption {
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  daysRequired: number; // turni per completare l'ordine
  goldCost: number;
  levelRequired?: number; // livello minimo del PG per questa opzione
  effectDuration?: string; // durata effetto in tempo reale (es. "7 days")
  effectDurationIt?: string;
}

// Opzioni di harvest
export interface HarvestOption {
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  daysRequired: number; // turni per completare l'ordine
  goldCost: number;
  result?: string; // cosa si ottiene
  resultIt?: string;
  effectDuration?: string; // durata effetto in tempo reale
  effectDurationIt?: string;
}

// Opzioni di trade
export interface TradeOption {
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  daysRequired: number; // turni per completare l'ordine
  goldCost: number;
  goldEarned?: string; // formula (es. "1d6 × 10")
  specialEffect?: string;
  specialEffectIt?: string;
  effectDuration?: string; // durata effetto in tempo reale
  effectDurationIt?: string;
}

// Opzioni di research
export interface ResearchOption {
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  daysRequired: number; // turni per completare l'ordine
  goldCost: number;
  effectDuration?: string; // durata effetto in tempo reale
  effectDurationIt?: string;
}

// Opzioni di empower
export interface EmpowerOption {
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  daysRequired: number; // turni per completare l'ordine
  goldCost: number;
  effectDuration?: string; // durata effetto in tempo reale (es. "7 days")
  effectDurationIt?: string;
}

// Opzioni di recruit
export interface RecruitOption {
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  daysRequired: number; // turni per completare l'ordine
  goldCost: number;
  defendersGained?: string; // formula (es. "1d4")
  effectDuration?: string; // durata effetto in tempo reale
  effectDurationIt?: string;
}

// ============================================================
// GUILD SYSTEM - Per Guildhall (Lv.17)
// ============================================================

export type GuildType = 
  | 'adventurers' | 'bakers' | 'brewers' 
  | 'masons' | 'shipbuilders' | 'thieves';

export interface GuildDefinition {
  type: GuildType;
  name: string;
  nameIt: string;
  symbol: string;
  assignment: string; // cosa fa l'ordine Recruit
  assignmentIt: string;
  effectDuration?: string;
  effectDurationIt?: string;
}

export const GUILD_DEFINITIONS: GuildDefinition[] = [
  {
    type: 'adventurers',
    name: 'Adventurers\' Guild',
    nameIt: 'Gilda degli Avventurieri',
    symbol: '🔥', // Lit torch
    assignment: 'Send adventurers to track down a Beast CR 2 or lower within 50 miles. Slay or capture (your choice). If slain and you have Trophy Room, add trophy. If captured and you have Menagerie with space, add creature.',
    assignmentIt: 'Invia avventurieri a cacciare una Bestia CR 2 o meno entro 50 miglia. Uccidono o catturano (a tua scelta). Se uccisa e hai Sala Trofei, aggiungi trofeo. Se catturata e hai Serraglio con spazio, aggiungi creatura.',
    effectDuration: '1d6+1 days',
    effectDurationIt: '1d6+1 giorni'
  },
  {
    type: 'bakers',
    name: 'Bakers\' Guild',
    nameIt: 'Gilda dei Panettieri',
    symbol: '🥧', // Pastry
    assignment: 'Assign bakers to create baked goods for a prestigious event within 7 days. Receive 500 GP or a favor from the event\'s host.',
    assignmentIt: 'Assegna panettieri per creare prodotti da forno per un evento prestigioso entro 7 giorni. Ricevi 500 GP o un favore dall\'ospite dell\'evento.',
    effectDuration: '7 days',
    effectDurationIt: '7 giorni'
  },
  {
    type: 'brewers',
    name: 'Brewers\' Guild',
    nameIt: 'Gilda dei Birrai',
    symbol: '🍺', // Foaming mug
    assignment: 'Assign brewers to deliver fifty 40-gallon barrels of ale (worth 10 GP each) to your Bastion in 7 days.',
    assignmentIt: 'Assegna birrai per consegnare cinquanta barili da 40 galloni di birra (10 GP ciascuno) al tuo Bastion in 7 giorni.',
    effectDuration: '7 days',
    effectDurationIt: '7 giorni'
  },
  {
    type: 'masons',
    name: 'Masons\' Guild',
    nameIt: 'Gilda dei Muratori',
    symbol: '🗿', // Stone mask
    assignment: 'Assign masons to add a defensive wall to your Bastion at no cost. Can work on another character\'s Bastion within 1 mile. Each 5-foot square takes 1 day (instead of 10).',
    assignmentIt: 'Assegna muratori per aggiungere un muro difensivo al tuo Bastion gratuitamente. Possono lavorare sul Bastion di un altro PG entro 1 miglio. Ogni quadrato da 5 piedi richiede 1 giorno (invece di 10).',
    effectDuration: '1 day per 5-foot square',
    effectDurationIt: '1 giorno per quadrato da 5 piedi'
  },
  {
    type: 'shipbuilders',
    name: 'Shipbuilders\' Guild',
    nameIt: 'Gilda dei Costruttori Navali',
    symbol: '⚓', // Crossed oars
    assignment: 'Assign shipbuilders to build a vehicle from PHB Airborne/Waterborne Vehicles table. Pay full cost of vehicle. Work takes 1 day per 1,000 GP (Rowboat = 1 day).',
    assignmentIt: 'Assegna costruttori navali per costruire un veicolo dalla tabella Veicoli del PHB. Paga il costo pieno del veicolo. 1 giorno ogni 1.000 GP (Barca a remi = 1 giorno).',
    effectDuration: '1 day per 1,000 GP',
    effectDurationIt: '1 giorno ogni 1.000 GP'
  },
  {
    type: 'thieves',
    name: 'Thieves\' Guild',
    nameIt: 'Gilda dei Ladri',
    symbol: '🔑', // White key
    assignment: 'Assign thieves to infiltrate a location within 50 miles and steal a nonmagical object (max 5 feet). Delivered in 1d6+1 days. DM may decide risk of retaliation from law or victim.',
    assignmentIt: 'Assegna ladri per infiltrare una location entro 50 miglia e rubare un oggetto non magico (max 5 piedi). Consegnato in 1d6+1 giorni. Il DM può decidere rischio di ritorsione dalle autorità o dalla vittima.',
    effectDuration: '1d6+1 days',
    effectDurationIt: '1d6+1 giorni'
  }
];

export function getGuildDefinition(type: GuildType): GuildDefinition | undefined {
  return GUILD_DEFINITIONS.find(g => g.type === type);
}

export const FACILITY_DEFINITIONS: FacilityDefinition[] = [
  // ============================================================
  // LIVELLO 5+ FACILITIES
  // ============================================================
  {
    type: 'arcane-study',
    name: 'Arcane Study',
    nameIt: 'Studio Arcano',
    icon: '🔮',
    minLevel: 5,
    baseCost: 0, // Special facility - ottenuta con level up
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'A place of quiet research with desks and bookshelves. Grants Arcane Study Charm.',
    hirelings: 1,
    prerequisite: 'Ability to use an Arcane Focus or a tool as a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Focus Arcano o uno strumento come Focus da Incantatore',
    passiveBenefit: 'Arcane Study Charm: After a Long Rest, gain a Charm that lets you cast Identify without spell slot or components. Lasts 7 days.',
    passiveBenefitIt: 'Charm dello Studio Arcano: Dopo un Riposo Lungo, ottieni un Charm che ti permette di lanciare Identificare senza slot e senza componenti. Dura 7 giorni.',
    craftOptions: [
      {
        name: 'Arcane Focus',
        nameIt: 'Focus Arcano',
        description: 'Commission a hireling to craft an Arcane Focus.',
        descriptionIt: 'Commissiona la creazione di un Focus Arcano.',
        daysRequired: 1, // 1 turno
        goldCost: 0
      },
      {
        name: 'Book',
        nameIt: 'Libro',
        description: 'Commission a hireling to craft a blank book.',
        descriptionIt: 'Commissiona la creazione di un libro vuoto.',
        daysRequired: 1, // 1 turno
        goldCost: 10
      },
      {
        name: 'Common Magic Item (Arcana)',
        nameIt: 'Oggetto Magico Comune (Arcana)',
        description: 'Craft a Common magic item from the Arcana tables.',
        descriptionIt: 'Crea un oggetto magico Comune dalle tabelle Arcana.',
        daysRequired: 1, // 1 turno = 7 giorni
        goldCost: 50,
        levelRequired: 9
      },
      {
        name: 'Uncommon Magic Item (Arcana)',
        nameIt: 'Oggetto Magico Non Comune (Arcana)',
        description: 'Craft an Uncommon magic item from the Arcana tables.',
        descriptionIt: 'Crea un oggetto magico Non Comune dalle tabelle Arcana.',
        daysRequired: 3, // 3 turni = 21 giorni
        goldCost: 200,
        levelRequired: 9
      }
    ]
  },
  {
    type: 'armory',
    name: 'Armory',
    nameIt: 'Armeria',
    icon: '⚔️',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['trade'],
    description: 'Contains mannequins for armor, racks for weapons, and chests for ammunition.',
    hirelings: 1,
    passiveBenefit: 'While Armory is stocked, Bastion Defenders roll 1d8 instead of 1d6 when determining casualties (harder to kill).',
    passiveBenefitIt: 'Mentre l\'Armeria è rifornita, i Difensori del Bastion tirano 1d8 invece di 1d6 per le perdite (più difficile morire).',
    tradeOptions: [
      {
        name: 'Stock Armory',
        nameIt: 'Rifornire Armeria',
        description: 'Stock the Armory with armor, shields, weapons, and ammunition.',
        descriptionIt: 'Rifornisce l\'Armeria con armature, scudi, armi e munizioni.',
        daysRequired: 1,
        goldCost: 100, // + 100 GP per defender
        specialEffect: 'Costs 100 GP + 100 GP per Bastion Defender. If you have a Smithy, total cost is halved. Equipment is expended after any Bastion Event.',
        specialEffectIt: 'Costa 100 GP + 100 GP per Difensore. Se hai una Fucina, il costo è dimezzato. L\'equipaggiamento si esaurisce dopo qualsiasi Evento del Bastion.'
      }
    ]
  },
  {
    type: 'barracks',
    name: 'Barracks',
    nameIt: 'Caserma',
    icon: '🛡️',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['recruit'],
    description: 'Sleeping quarters for up to twelve Bastion Defenders.',
    hirelings: 1,
    maxCapacity: 12,
    maxCapacityEnlarged: 25,
    enlargingCost: 2000,
    enlargingBenefit: 'A Vast Barrack can accommodate up to twenty-five Bastion Defenders.',
    enlargingBenefitIt: 'Una Caserma Vasta può ospitare fino a venticinque Difensori del Bastion.',
    recruitOptions: [
      {
        name: 'Recruit Bastion Defenders',
        nameIt: 'Recluta Difensori',
        description: 'Recruit up to 4 Bastion Defenders. Recruitment costs no money.',
        descriptionIt: 'Recluta fino a 4 Difensori del Bastion. Il reclutamento non costa denaro.',
        daysRequired: 1,
        goldCost: 0,
        defendersGained: '1d4'
      }
    ]
  },
  {
    type: 'garden',
    name: 'Garden',
    nameIt: 'Giardino',
    icon: '🌿',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['harvest'],
    description: 'Choose a Garden Type when you add this facility. Can instruct hireling to change type (takes 3 turns).',
    hirelings: 1,
    enlargingCost: 2000,
    enlargingBenefit: 'A Vast Garden can include two Gardens (same or different types). Each produces its own harvest. Gains one additional hireling.',
    enlargingBenefitIt: 'Un Giardino Vasto include due giardini (stesso tipo o diversi). Ognuno produce il suo raccolto. Ottiene un hireling aggiuntivo.',
    harvestOptions: [
      {
        name: 'Decorative Garden - Garden Growth',
        nameIt: 'Giardino Decorativo - Raccolto',
        description: 'Harvest from your decorative garden.',
        descriptionIt: 'Raccogli dal tuo giardino decorativo.',
        daysRequired: 1,
        goldCost: 0,
        result: '10 exquisite floral bouquets (5 GP each), 10 vials of Perfume, or 10 Candles',
        resultIt: '10 bouquet floreali squisiti (5 GP ciascuno), 10 fiale di Profumo, o 10 Candele'
      },
      {
        name: 'Food Garden - Garden Growth',
        nameIt: 'Giardino Alimentare - Raccolto',
        description: 'Harvest from your food garden.',
        descriptionIt: 'Raccogli dal tuo giardino alimentare.',
        daysRequired: 1,
        goldCost: 0,
        result: '100 days worth of Rations',
        resultIt: '100 giorni di Razioni'
      },
      {
        name: 'Herb Garden - Garden Growth',
        nameIt: 'Giardino di Erbe - Raccolto',
        description: 'Harvest from your herb garden.',
        descriptionIt: 'Raccogli dal tuo giardino di erbe.',
        daysRequired: 1,
        goldCost: 0,
        result: 'Herbs for 10 Healer\'s Kits or 1 Potion of Healing',
        resultIt: 'Erbe per 10 Kit del Guaritore o 1 Pozione di Guarigione'
      },
      {
        name: 'Poison Garden - Garden Growth',
        nameIt: 'Giardino dei Veleni - Raccolto',
        description: 'Harvest from your poison garden.',
        descriptionIt: 'Raccogli dal tuo giardino dei veleni.',
        daysRequired: 1,
        goldCost: 0,
        result: '2 vials of Antitoxin or 1 vial of Basic Poison',
        resultIt: '2 fiale di Antitossina o 1 fiala di Veleno Base'
      },
      {
        name: 'Change Garden Type',
        nameIt: 'Cambia Tipo di Giardino',
        description: 'Instruct the hireling to change the Garden from one type to another. No other activity can occur during this time.',
        descriptionIt: 'Ordina all\'hireling di cambiare il tipo di Giardino. Nessun\'altra attività può avvenire durante questo tempo.',
        daysRequired: 3,
        goldCost: 0,
        result: 'Garden type changed',
        resultIt: 'Tipo di giardino cambiato'
      }
    ]
  },
  {
    type: 'library',
    name: 'Library',
    nameIt: 'Biblioteca',
    icon: '📚',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['research'],
    description: 'This Library contains a collection of books plus one or more desks and reading chairs.',
    hirelings: 1,
    researchOptions: [
      {
        name: 'Topical Lore',
        nameIt: 'Sapere Tematico',
        description: 'Commission the hireling to research a topic: a legend, a known event or location, a person of significance, a type of creature, or a famous object. After 7 days, the hireling obtains up to 3 accurate pieces of information previously unknown to you.',
        descriptionIt: 'Commissiona all\'hireling di ricercare un argomento: una leggenda, un evento o luogo noto, una persona importante, un tipo di creatura, o un oggetto famoso. Dopo 7 giorni, l\'hireling ottiene fino a 3 informazioni accurate precedentemente sconosciute.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days (research time)',
        effectDurationIt: '7 giorni (tempo di ricerca)'
      }
    ]
  },
  {
    type: 'sanctuary',
    name: 'Sanctuary',
    nameIt: 'Santuario',
    icon: '🙏',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'Icons of your religion are displayed in this facility, which includes a quiet place for worship.',
    hirelings: 1,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Simbolo Sacro o Focus Druidico come Focus da Incantatore',
    passiveBenefit: 'Sanctuary Charm: After a Long Rest in your Bastion, gain a Charm that lets you cast Healing Word once without expending a spell slot. Lasts 7 days or until used.',
    passiveBenefitIt: 'Charm del Santuario: Dopo un Riposo Lungo nel Bastion, ottieni un Charm che ti permette di lanciare Healing Word una volta senza slot. Dura 7 giorni o finché non lo usi.',
    craftOptions: [
      {
        name: 'Sacred Focus',
        nameIt: 'Focus Sacro',
        description: 'Commission the hireling to craft a Druidic Focus (wooden staff) or a Holy Symbol. The item remains in your Bastion until you claim it.',
        descriptionIt: 'Commissiona la creazione di un Focus Druidico (bastone di legno) o un Simbolo Sacro. L\'oggetto resta nel Bastion finché non lo ritiri.',
        daysRequired: 1,
        goldCost: 0
      }
    ]
  },
  {
    type: 'smithy',
    name: 'Smithy',
    nameIt: 'Fucina',
    icon: '🔨',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'This Smithy contains a forge, an anvil, and other tools needed to craft weapons, armor, and other equipment.',
    hirelings: 2,
    craftOptions: [
      {
        name: 'Smith\'s Tools',
        nameIt: 'Strumenti da Fabbro',
        description: 'Craft anything that can be made with Smith\'s Tools, using the rules in the PHB.',
        descriptionIt: 'Crea qualsiasi cosa realizzabile con Strumenti da Fabbro, usando le regole del PHB.',
        daysRequired: 1,
        goldCost: 0
      },
      {
        name: 'Magic Item (Armament)',
        nameIt: 'Oggetto Magico (Armamento)',
        description: 'If you are level 9+, craft a Common or Uncommon magic item from the Armaments tables in chapter 7. The facility has the tool and hirelings have proficiency with it and Arcana skill. See "Crafting Magic Items" for time and cost. If the item requires spells, you must craft it yourself (hirelings can assist).',
        descriptionIt: 'Se sei livello 9+, crea un oggetto magico Comune o Non Comune dalle tabelle Armamenti del capitolo 7. La facility ha lo strumento e gli hireling hanno competenza con esso e in Arcana. Vedi "Crafting Magic Items" per tempo e costo. Se l\'oggetto richiede incantesimi, devi crearlo tu (gli hireling possono assistere).',
        daysRequired: 1,
        goldCost: 0,
        levelRequired: 9
      }
    ]
  },
  {
    type: 'storehouse',
    name: 'Storehouse',
    nameIt: 'Magazzino',
    icon: '📦',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['trade'],
    description: 'A Storehouse is a cool, dark space meant to contain objects from the Trade Goods table in chapter 7 and from chapter 6 of the PHB.',
    hirelings: 1,
    tradeOptions: [
      {
        name: 'Trade Goods',
        nameIt: 'Merci Commerciali',
        description: 'The hireling spends 7 days procuring nonmagical items (total value 500 GP or less) and stores them, OR sells goods from the Storehouse. You bear the total cost of purchases. Max value increases to 2,000 GP at level 9 and 5,000 GP at level 13. When selling, buyer pays 10% more than standard (20% at lv.9, 50% at lv.13, 100% at lv.17).',
        descriptionIt: 'L\'hireling passa 7 giorni a procurare oggetti non magici (valore totale 500 GP o meno) e li immagazzina, OPPURE vende merci dal Magazzino. Paghi tu il costo totale degli acquisti. Il valore max aumenta a 2.000 GP al lv.9 e 5.000 GP al lv.13. Vendendo, il compratore paga 10% in più (20% lv.9, 50% lv.13, 100% lv.17).',
        daysRequired: 1,
        goldCost: 0
      }
    ]
  },
  {
    type: 'workshop',
    name: 'Workshop',
    nameIt: 'Officina',
    icon: '🔧',
    minLevel: 5,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'This Workshop is a creative space where useful items can be crafted. Equipped with six different kinds of Artisan\'s Tools (chosen when added to Bastion).',
    hirelings: 3,
    passiveBenefit: 'Source of Inspiration: After spending an entire Short Rest in your Workshop, you gain Heroic Inspiration. You can\'t gain this benefit again until you finish a Long Rest.',
    passiveBenefitIt: 'Fonte di Ispirazione: Dopo aver completato un Riposo Breve nell\'Officina, ottieni Ispirazione Eroica. Non puoi riutilizzare questo beneficio finché non completi un Riposo Lungo.',
    enlargingCost: 2000,
    enlargingBenefit: 'Workshop gains two additional hirelings and three additional Artisan\'s Tools (chosen from the list).',
    enlargingBenefitIt: 'L\'Officina ottiene due hireling aggiuntivi e tre Strumenti da Artigiano aggiuntivi (scelti dalla lista).',
    craftOptions: [
      {
        name: 'Adventuring Gear',
        nameIt: 'Equipaggiamento da Avventura',
        description: 'Craft anything that can be made with the tools you chose when you added the Workshop to your Bastion, using the rules in the PHB.',
        descriptionIt: 'Crea qualsiasi cosa realizzabile con gli strumenti scelti quando hai aggiunto l\'Officina al Bastion, usando le regole del PHB.',
        daysRequired: 1,
        goldCost: 0
      },
      {
        name: 'Magic Item (Implement)',
        nameIt: 'Oggetto Magico (Implemento)',
        description: 'If you are level 9+, craft a Common or Uncommon magic item from the Implements tables in chapter 7. The facility has the tool and hirelings have proficiency with it and Arcana skill. See "Crafting Magic Items" for time and cost. If the item requires spells, you must craft it yourself (hirelings can assist).',
        descriptionIt: 'Se sei livello 9+, crea un oggetto magico Comune o Non Comune dalle tabelle Implementi del capitolo 7. La facility ha lo strumento e gli hireling hanno competenza con esso e in Arcana. Vedi "Crafting Magic Items" per tempo e costo. Se l\'oggetto richiede incantesimi, devi crearlo tu (gli hireling possono assistere).',
        daysRequired: 1,
        goldCost: 0,
        levelRequired: 9
      }
    ]
  },
  // ============================================================
  // LIVELLO 9+ FACILITIES
  // ============================================================
  {
    type: 'gaming-hall',
    name: 'Gaming Hall',
    nameIt: 'Sala da Gioco',
    icon: '🎲',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['trade'],
    description: 'Recreational activities like chess, darts, cards, or dice games.',
    hirelings: 4,
    tradeOptions: [
      {
        name: 'Gambling Hall',
        nameIt: 'Casa da Gioco',
        description: 'Turn the Gaming Hall into a gambling den for 1 turn. At the end, roll 1d100 for winnings.',
        descriptionIt: 'Trasforma la Sala da Gioco in un casinò per 1 turno. Alla fine, tira 1d100 per le vincite.',
        daysRequired: 1,
        goldCost: 0,
        goldEarned: '1d100: 01-50 = 1d6×10 GP, 51-85 = 2d6×10 GP, 86-95 = 4d6×10 GP, 96-00 = 10d6×10 GP',
        specialEffect: 'Roll 1d100 at end of the order to determine house winnings.',
        specialEffectIt: 'Tira 1d100 alla fine dell\'ordine per determinare le vincite della casa.'
      }
    ]
  },
  {
    type: 'greenhouse',
    name: 'Greenhouse',
    nameIt: 'Serra',
    icon: '🌺',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['harvest'],
    description: 'An enclosure where rare plants and fungi are nurtured in a controlled climate.',
    hirelings: 1,
    passiveBenefit: 'Fruit of Restoration: One plant has 3 magical fruits. Any creature that eats one gains the benefit of Lesser Restoration. Fruits not eaten within 24 hours lose their magic. The plant replaces all picked fruits daily at dawn.',
    passiveBenefitIt: 'Frutto della Restaurazione: Una pianta ha 3 frutti magici. Chi ne mangia uno ottiene il beneficio di Ristorare Inferiore. I frutti non mangiati entro 24 ore perdono la magia. La pianta rigenera tutti i frutti ogni alba.',
    harvestOptions: [
      {
        name: 'Healing Herbs',
        nameIt: 'Erbe Curative',
        description: 'Commission the hireling to create a Potion of Healing (greater) from healing herbs.',
        descriptionIt: 'Commissiona la creazione di una Pozione di Guarigione (superiore) dalle erbe curative.',
        daysRequired: 1,
        goldCost: 0,
        result: '1 Potion of Healing (Greater)',
        resultIt: '1 Pozione di Guarigione (Superiore)'
      },
      {
        name: 'Poison - Assassin\'s Blood',
        nameIt: 'Veleno - Sangue dell\'Assassino',
        description: 'Extract one application of Assassin\'s Blood poison.',
        descriptionIt: 'Estrai un\'applicazione di veleno Sangue dell\'Assassino.',
        daysRequired: 1,
        goldCost: 0,
        result: '1 application of Assassin\'s Blood',
        resultIt: '1 applicazione di Sangue dell\'Assassino'
      },
      {
        name: 'Poison - Malice',
        nameIt: 'Veleno - Malizia',
        description: 'Extract one application of Malice poison.',
        descriptionIt: 'Estrai un\'applicazione di veleno Malizia.',
        daysRequired: 1,
        goldCost: 0,
        result: '1 application of Malice',
        resultIt: '1 applicazione di Malizia'
      },
      {
        name: 'Poison - Pale Tincture',
        nameIt: 'Veleno - Tintura Pallida',
        description: 'Extract one application of Pale Tincture poison.',
        descriptionIt: 'Estrai un\'applicazione di veleno Tintura Pallida.',
        daysRequired: 1,
        goldCost: 0,
        result: '1 application of Pale Tincture',
        resultIt: '1 applicazione di Tintura Pallida'
      },
      {
        name: 'Poison - Truth Serum',
        nameIt: 'Veleno - Siero della Verità',
        description: 'Extract one application of Truth Serum.',
        descriptionIt: 'Estrai un\'applicazione di Siero della Verità.',
        daysRequired: 1,
        goldCost: 0,
        result: '1 application of Truth Serum',
        resultIt: '1 applicazione di Siero della Verità'
      }
    ]
  },
  {
    type: 'laboratory',
    name: 'Laboratory',
    nameIt: 'Laboratorio',
    icon: '⚗️',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'A Laboratory contains storage space for alchemical supplies and workspaces for crafting various concoctions.',
    hirelings: 1,
    craftOptions: [
      {
        name: 'Alchemist\'s Supplies',
        nameIt: 'Forniture da Alchimista',
        description: 'Craft anything that can be made with Alchemist\'s Supplies using the rules in the PHB and chapter 7 of DMG.',
        descriptionIt: 'Crea qualsiasi cosa realizzabile con Forniture da Alchimista usando le regole del PHB e capitolo 7 del DMG.',
        daysRequired: 1,
        goldCost: 0 // Costo varia in base a cosa crei
      },
      {
        name: 'Poison',
        nameIt: 'Veleno',
        description: 'Craft a vial containing one application of poison. Choose: Burnt Othur Fumes, Essence of Ether, or Torpor. Pay half the poison\'s cost.',
        descriptionIt: 'Crea una fiala contenente un\'applicazione di veleno. Scegli: Fumi di Othur Bruciato, Essenza di Etere, o Torpore. Paga metà del costo del veleno.',
        daysRequired: 1,
        goldCost: 0 // Metà del costo del veleno scelto
      }
    ]
  },
  {
    type: 'sacristy',
    name: 'Sacristy',
    nameIt: 'Sacrestia',
    icon: '✨',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'A Sacristy serves as a preparation and storage room for the sacred items and religious vestments.',
    hirelings: 1,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Simbolo Sacro o Focus Druidico come Focus da Incantatore',
    passiveBenefit: 'Spell Refreshment: Having a Sacristy allows you to regain one expended spell slot of level 5 or lower after spending an entire Short Rest in your Bastion. You can\'t gain this benefit again until you finish a Long Rest.',
    passiveBenefitIt: 'Recupero Incantesimi: La Sacrestia ti permette di recuperare uno slot incantesimo speso di livello 5 o inferiore dopo aver completato un Riposo Breve nel Bastion. Non puoi riutilizzare questo beneficio finché non completi un Riposo Lungo.',
    craftOptions: [
      {
        name: 'Holy Water',
        nameIt: 'Acqua Santa',
        description: 'Craft a flask of Holy Water. Costs no money. You can spend GP during creation to increase potency: +1d8 damage per 100 GP spent, up to 500 GP max.',
        descriptionIt: 'Crea una fiasca di Acqua Santa. Non costa nulla. Puoi spendere GP durante la creazione per aumentare la potenza: +1d8 danni ogni 100 GP spesi, fino a 500 GP max.',
        daysRequired: 1,
        goldCost: 0
      },
      {
        name: 'Magic Item (Relic)',
        nameIt: 'Oggetto Magico (Reliquia)',
        description: 'Craft a Common or Uncommon magic item from the Relics tables in chapter 7. The facility has the tool and the hireling has proficiency with it and Arcana skill. See "Crafting Magic Items" for time and cost.',
        descriptionIt: 'Crea un oggetto magico Comune o Non Comune dalle tabelle Reliquie del capitolo 7. La facility ha lo strumento e l\'hireling ha competenza con esso e in Arcana. Vedi "Crafting Magic Items" per tempo e costo.',
        daysRequired: 1, // Varia in base all'oggetto
        goldCost: 0 // Varia in base all'oggetto
      }
    ]
  },
  {
    type: 'scriptorium',
    name: 'Scriptorium',
    nameIt: 'Scriptorium',
    icon: '📜',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['craft'],
    description: 'A Scriptorium contains desks and writing supplies.',
    hirelings: 1,
    craftOptions: [
      {
        name: 'Book Replica',
        nameIt: 'Copia di Libro',
        description: 'Commission the hireling to make a copy of a nonmagical Book. Doing so requires a blank book.',
        descriptionIt: 'Commissiona la copia di un Libro non magico. Richiede un libro vuoto.',
        daysRequired: 1,
        goldCost: 0
      },
      {
        name: 'Spell Scroll',
        nameIt: 'Pergamena Incantesimo',
        description: 'Commission the hireling to scribe a Spell Scroll containing one Cleric or Wizard spell of level 3 or lower. The facility has Calligrapher\'s Supplies and the hireling meets all prerequisites. See PHB for time and cost.',
        descriptionIt: 'Commissiona la trascrizione di una Pergamena Incantesimo contenente un incantesimo da Chierico o Mago di livello 3 o inferiore. La facility ha Forniture da Calligrafo e l\'hireling ha tutti i prerequisiti. Vedi PHB per tempo e costo.',
        daysRequired: 1, // Varia in base al livello
        goldCost: 0 // Varia in base al livello
      },
      {
        name: 'Paperwork',
        nameIt: 'Documenti',
        description: 'Commission the hireling to create up to 50 copies of a broadsheet, pamphlet, or other loose-leaf paper product. Costs 1 GP per copy. The hireling can distribute the paperwork to locations within 50 miles at no extra cost.',
        descriptionIt: 'Commissiona la creazione di fino a 50 copie di un volantino, opuscolo o altro prodotto cartaceo. Costa 1 GP per copia. L\'hireling può distribuire i documenti entro 50 miglia senza costi aggiuntivi.',
        daysRequired: 1,
        goldCost: 50 // 1 GP × 50 copie max
      }
    ]
  },
  {
    type: 'stable',
    name: 'Stable',
    nameIt: 'Stalla',
    icon: '🐴',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['trade'],
    description: 'A Bastion can have more than one Stable. Each Stable comes with one Riding Horse or Camel and two Ponies or Mules. The facility is big enough to house three Large animals (two Medium = one Large).',
    hirelings: 1,
    passiveBenefit: 'Trained Mounts: After a Beast that can serve as a mount spends at least 14 days in this facility, all Wisdom (Animal Handling) checks made with respect to it have Advantage.',
    passiveBenefitIt: 'Cavalcature Addestrate: Dopo che una Bestia usabile come cavalcatura passa almeno 14 giorni nella Stalla, tutte le prove di Saggezza (Gestione Animali) su di essa hanno Vantaggio.',
    enlargingCost: 2000,
    enlargingBenefit: 'Enlarge to Vast. The Stable is large enough to house six Large animals.',
    enlargingBenefitIt: 'Espandi a Vast. La Stalla può ospitare sei animali Large.',
    tradeOptions: [
      {
        name: 'Trade Animals',
        nameIt: 'Commercio Animali',
        description: 'Commission the hireling to buy or sell one or more mounts at normal cost, keeping the ones you buy in your Stable. The DM decides what types of animals are available (horses, ponies, mules most common). When you sell a mount from your Stable, the buyer pays 20% more than standard price (+50% at lv.13, +100% at lv.17).',
        descriptionIt: 'Commissiona l\'acquisto o vendita di cavalcature a prezzo normale, tenendo quelle comprate nella Stalla. Il DM decide quali animali sono disponibili (cavalli, pony, muli i più comuni). Vendendo una cavalcatura, il compratore paga 20% in più (+50% lv.13, +100% lv.17).',
        daysRequired: 1,
        goldCost: 0
      }
    ]
  },
  {
    type: 'teleportation-circle',
    name: 'Teleportation Circle',
    nameIt: 'Circolo di Teletrasporto',
    icon: '🌀',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['recruit'],
    description: 'Inscribed on the floor of this room is a permanent teleportation circle created by the Teleportation Circle spell.',
    hirelings: 1,
    recruitOptions: [
      {
        name: 'Recruit Spellcaster',
        nameIt: 'Recluta Incantatore',
        description: 'Each time you issue the Recruit order, the hireling extends an invitation to a Friendly NPC spellcaster. Roll any die. If odd, the invitee declines. If even, the spellcaster accepts and arrives via your Teleportation Circle. While in your Bastion, you can ask them to cast one Wizard spell of level 4 or lower (level 8 if you are level 17+). You must pay for Material components. The spellcaster stays for 14 days or until they cast a spell for you, then departs. They won\'t defend your Bastion if attacked.',
        descriptionIt: 'Ogni volta che dai l\'ordine Recruit, l\'hireling invita un incantatore PNG Amichevole. Tira un dado. Se dispari, rifiuta. Se pari, accetta e arriva via Circolo. Nel tuo Bastion, puoi chiedergli di lanciare un incantesimo da Mago di livello 4 o meno (livello 8 se sei lv.17+). Devi pagare le componenti Materiali. Resta 14 giorni o finché non lancia un incantesimo, poi parte. Non difenderà il Bastion se attaccato.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '14 days stay',
        effectDurationIt: '14 giorni di permanenza'
      }
    ]
  },
  {
    type: 'theater',
    name: 'Theater',
    nameIt: 'Teatro',
    icon: '🎭',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['empower'],
    description: 'The Theater contains a stage, a backstage area where props and sets are kept, and a seating area for a small audience.',
    hirelings: 4,
    passiveBenefit: 'Theater Die: At the end of a rehearsal period, each contributing character can make a DC 15 Charisma (Performance) check. If more succeed than fail, you and all contributors each gain a Theater die (d6, becomes d8 at lv.13, d10 at lv.17). You can expend this die to add it to one D20 Test immediately after rolling. If you haven\'t used your die before gaining another, the first is lost.',
    passiveBenefitIt: 'Dado del Teatro: Alla fine delle prove, ogni partecipante può fare una prova DC 15 Carisma (Intrattenere). Se più successi che fallimenti, tu e tutti i partecipanti ottenete un dado Teatro (d6, d8 al lv.13, d10 al lv.17). Puoi spenderlo per aggiungerlo a un Test D20 subito dopo averlo tirato. Se non l\'hai usato prima di ottenerne un altro, il primo è perso.',
    empowerOptions: [
      {
        name: 'Theatrical Event',
        nameIt: 'Evento Teatrale',
        description: 'The hirelings begin work on a theatrical production or concert. Rehearsals and preparations take 14 days, followed by at least 7 days of performances. Performances continue indefinitely until a new production starts. Contributors: Composer/Writer (14 days to write script/music), Conductor/Director (must remain in Bastion for entire production), Performer (star in one or more performances, hireling can understudy).',
        descriptionIt: 'Gli hireling iniziano a lavorare su una produzione teatrale o concerto. Le prove e preparazioni richiedono 14 giorni, seguiti da almeno 7 giorni di spettacoli. Gli spettacoli continuano indefinitamente finché non inizia una nuova produzione. Contributori: Compositore/Scrittore (14 giorni per scrivere), Direttore (deve restare nel Bastion per tutta la produzione), Artista (protagonista in uno o più spettacoli, l\'hireling può fare da sostituto).',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '14 days rehearsal + 7+ days performances',
        effectDurationIt: '14 giorni prove + 7+ giorni spettacoli'
      }
    ]
  },
  {
    type: 'training-area',
    name: 'Training Area',
    nameIt: 'Area di Addestramento',
    icon: '🏋️',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['empower'],
    description: 'A Bastion can have more than one Training Area: an open courtyard, a gymnasium, a music or dance hall, or a gauntlet of traps and hazards. One of the hirelings is an expert trainer; the others serve as training partners.',
    hirelings: 4,
    passiveBenefit: 'Expert Trainer: When the Training Area becomes part of your Bastion, choose one trainer from the Expert Trainers table. On each Bastion turn, you can replace that trainer with another one from the table. | Expert Trainers: Battle Expert (Reaction to reduce Unarmed/weapon damage by 1d4), Skills Expert (proficiency in Acrobatics/Athletics/Performance/Sleight of Hand/Stealth), Tools Expert (proficiency with one tool), Unarmed Combat Expert (+1d4 Bludgeoning to Unarmed Strikes), Weapon Expert (proficiency or mastery with Simple/Martial weapon).',
    passiveBenefitIt: 'Allenatore Esperto: Quando l\'Area diventa parte del Bastion, scegli un allenatore dalla tabella. Ogni turno Bastion, puoi sostituirlo. | Allenatori: Esperto Battaglia (-1d4 danni Reazione), Esperto Abilità (competenza Acrobazia/Atletica/Intrattenere/Rapidità di Mano/Furtività), Esperto Strumenti (competenza strumento), Esperto Combattimento Disarmato (+1d4 Contundenti), Esperto Armi (competenza o maestria arma Semplice/Marziale).',
    empowerOptions: [
      {
        name: 'Training',
        nameIt: 'Addestramento',
        description: 'When you issue the Empower order, the hirelings conduct training exercises for the next 7 days. Any character who trains here for at least 8 hours on each of those days gains a benefit at the end of the training period. The benefit depends on which trainer is present in the facility, as noted in the Expert Trainers table. The benefit lasts for 7 days.',
        descriptionIt: 'Quando dai l\'ordine Empower, gli hireling conducono esercizi per i prossimi 7 giorni. Chiunque si alleni qui per almeno 8 ore al giorno per tutti i 7 giorni ottiene un beneficio alla fine. Il beneficio dipende dall\'allenatore presente nella facility, come indicato nella tabella. Il beneficio dura 7 giorni.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days training, benefit lasts 7 days',
        effectDurationIt: '7 giorni allenamento, beneficio dura 7 giorni'
      }
    ]
  },
  {
    type: 'trophy-room',
    name: 'Trophy Room',
    nameIt: 'Sala dei Trofei',
    icon: '🏆',
    minLevel: 9,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['research'],
    description: 'This room houses a collection of mementos: weapons from old battles, mounted heads of slain creatures, trinkets plucked from dungeons and ruins, and trophies passed down from ancestors.',
    hirelings: 1,
    researchOptions: [
      {
        name: 'Research Lore',
        nameIt: 'Ricerca Sapere',
        description: 'Commission the hireling to research a topic of your choice: a legend, any kind of creature, or a famous object. The topic need not be directly related to items on display. The trophies provide clues to research a wide variety of subjects. After 7 days, the hireling obtains up to three accurate pieces of information previously unknown to you. The DM determines what information is learned.',
        descriptionIt: 'Commissiona la ricerca di un argomento a tua scelta: una leggenda, un tipo di creatura, o un oggetto famoso. L\'argomento non deve essere direttamente correlato agli oggetti esposti. I trofei forniscono indizi per ricercare svariati soggetti. Dopo 7 giorni, l\'hireling ottiene fino a tre informazioni accurate precedentemente sconosciute. Il DM determina le informazioni.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days research',
        effectDurationIt: '7 giorni di ricerca'
      },
      {
        name: 'Research Trinket Trophy',
        nameIt: 'Ricerca Trofeo Ninnolo',
        description: 'Commission the hireling to search for a trinket that might be of use to you. After 7 days, roll any die. If odd, the hireling finds nothing useful. If even, the hireling finds a magic item. Roll on the Implements—Common table in chapter 7 to determine what it is.',
        descriptionIt: 'Commissiona la ricerca di un ninnolo che potrebbe esserti utile. Dopo 7 giorni, tira un dado. Se dispari, l\'hireling non trova nulla di utile. Se pari, trova un oggetto magico. Tira sulla tabella Implementi—Comuni del capitolo 7 per determinare cos\'è.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days search',
        effectDurationIt: '7 giorni di ricerca'
      }
    ]
  },
  // LIVELLO 13+ FACILITIES
  // ============================================================
  {
    type: 'archive',
    name: 'Archive',
    nameIt: 'Archivio',
    icon: '📚',
    minLevel: 13,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['research'],
    description: 'A repository of books, maps, and scrolls. Usually attached to a Library behind a locked or secret door.',
    hirelings: 1,
    enlargingCost: 2000,
    enlargingBenefit: 'Enlarge to Vast and gain two additional reference books from the list.',
    enlargingBenefitIt: 'Espandi a Vasto e ottieni due libri di riferimento aggiuntivi dalla lista.',
    passiveBenefit: 'Reference Book: Your Archive contains one reference book that gives you Advantage on specific checks while you are in your Bastion. Choose from: Bigby\'s Handy Arcana Codex (Arcana), Chronepsis Chronicles (History), Investigations of the Inquisitive (Investigation), Material Musings on Nature (Nature), The Old Faith and Other Religions (Religion).',
    passiveBenefitIt: 'Libro di Riferimento: L\'Archivio contiene un libro che ti dà Vantaggio su check specifici mentre sei nel Bastion. Scegli tra: Codex Arcano di Bigby (Arcana), Cronache di Chronepsis (Storia), Indagini dell\'Inquisitivo (Indagine), Riflessioni sulla Natura (Natura), L\'Antica Fede e Altre Religioni (Religione).',
    researchOptions: [
      {
        name: 'Helpful Lore',
        nameIt: 'Sapienza Utile',
        description: 'Commission the hireling to search the Archive for lore. The hireling gains knowledge as if they had cast Legend Lore, then shares it with you.',
        descriptionIt: 'Commissiona la ricerca di sapienza nell\'Archivio. L\'hireling ottiene conoscenza come se avesse lanciato Conoscenza delle Leggende, e la condivide con te.',
        daysRequired: 1,
        goldCost: 0
      }
    ]
  },
  {
    type: 'meditation-chamber',
    name: 'Meditation Chamber',
    nameIt: 'Camera di Meditazione',
    icon: '🧘',
    minLevel: 13,
    baseCost: 0,
    buildTime: 0,
    size: 'cramped',
    orders: ['empower'],
    description: 'A Meditation Chamber is a relaxing space that helps align one\'s mind, body, and spirit.',
    hirelings: 1,
    passiveBenefit: 'Fortify Self: Meditate in this facility for 7 days without leaving the Bastion. At the end, gain Advantage on two kinds of saving throws (roll 1d6 twice) for the next 7 days.',
    passiveBenefitIt: 'Fortificare Sé: Medita in questa facility per 7 giorni senza lasciare il Bastion. Alla fine, ottieni Vantaggio su due tipi di tiri salvezza (tira 1d6 due volte) per i prossimi 7 giorni.',
    empowerOptions: [
      {
        name: 'Inner Peace',
        nameIt: 'Pace Interiore',
        description: 'Your Bastion\'s hirelings can use the Meditation Chamber to gain a measure of inner peace. The next time you roll for a Bastion event, you can roll twice and choose either result.',
        descriptionIt: 'Gli hireling del tuo Bastion possono usare la Camera di Meditazione per ottenere pace interiore. La prossima volta che tiri per un evento Bastion, puoi tirare due volte e scegliere uno dei risultati.',
        daysRequired: 1,
        goldCost: 0
      }
    ]
  },
  {
    type: 'menagerie',
    name: 'Menagerie',
    nameIt: 'Serraglio',
    icon: '🦁',
    minLevel: 13,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['recruit'],
    description: 'A Menagerie has enclosures big enough to contain up to four Large creatures. Four Small or Medium creatures occupy the same space as one Large creature.',
    hirelings: 2,
    passiveBenefit: 'Bastion Defenders: Creatures in your Menagerie count as Bastion Defenders. Deduct any you lose from your Bastion Defenders roster. You can choose not to count one or more creatures as Defenders.',
    passiveBenefitIt: 'Difensori del Bastion: Le creature nel Serraglio contano come Difensori del Bastion. Sottrai quelle perse dal roster. Puoi scegliere di non contare alcune creature come Difensori.',
    recruitOptions: [
      {
        name: 'Recruit Creature',
        nameIt: 'Recluta Creatura',
        description: 'Commission the hirelings to add a creature from the Menagerie Creatures table. Recruitment takes 7 days. Cost depends on CR: CR 0-1/8 = 50 GP, CR 1/4 = 250 GP, CR 1/2 = 500 GP, CR 1 = 1000 GP, CR 2 = 2000 GP, CR 3 = 3500 GP.',
        descriptionIt: 'Commissiona l\'aggiunta di una creatura dalla tabella. Il reclutamento richiede 7 giorni. Costo in base al CR: CR 0-1/8 = 50 GP, CR 1/4 = 250 GP, CR 1/2 = 500 GP, CR 1 = 1000 GP, CR 2 = 2000 GP, CR 3 = 3500 GP.',
        daysRequired: 1,
        goldCost: 0 // Varia in base alla creatura
      }
    ]
  },
  {
    type: 'observatory',
    name: 'Observatory',
    nameIt: 'Osservatorio',
    icon: '🔭',
    minLevel: 13,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['empower'],
    description: 'Situated atop your Bastion, your Observatory contains a telescope aimed at the night sky. You can peer into the far corners of Wildspace and the Astral Plane.',
    hirelings: 1,
    prerequisite: 'Ability to use a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Focus da Incantatore',
    passiveBenefit: 'Observatory Charm: After a Long Rest in your Observatory, gain a Charm that lets you cast Contact Other Plane once without expending a spell slot. Lasts 7 days or until used.',
    passiveBenefitIt: 'Charm dell\'Osservatorio: Dopo un Riposo Lungo nell\'Osservatorio, ottieni un Charm che ti permette di lanciare Contattare Altro Piano una volta senza slot. Dura 7 giorni o finché non lo usi.',
    empowerOptions: [
      {
        name: 'Eldritch Discovery',
        nameIt: 'Scoperta Eldritch',
        description: 'You or the hireling explore the eldritch mysteries of the stars for 7 consecutive nights. At the end, roll a die. If even, nothing is gained. If odd, an unknown power bestows a Charm (your choice): Charm of Darkvision, Charm of Heroism, or Charm of Vitality.',
        descriptionIt: 'Tu o l\'hireling esplorate i misteri eldritch delle stelle per 7 notti consecutive. Alla fine, tira un dado. Se pari, nulla. Se dispari, ottieni un Charm a scelta: Charm di Scurovisione, Charm di Eroismo, o Charm di Vitalità.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 nights observation',
        effectDurationIt: '7 notti di osservazione'
      }
    ]
  },
  {
    type: 'pub',
    name: 'Pub',
    nameIt: 'Locanda',
    icon: '🍺',
    minLevel: 13,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['research'],
    description: 'Folks come here to consume tasty beverages and socialize. The hireling (bartender) maintains a network of spies scattered throughout nearby communities.',
    hirelings: 1,
    passiveBenefit: 'Pub Special: One magical beverage on tap (choose at Bastion turn start): Bigby\'s Burden (Enlarge 24h), Kiss of the Spider Queen (Spider Climb 24h), Moonlight Serenade (Darkvision 60ft 24h), or Positive Reinforcement (Resistance to Necrotic 24h).',
    passiveBenefitIt: 'Bevanda Speciale: Una bevanda magica alla spina (scegli all\'inizio del turno): Fardello di Bigby (Ingrandire 24h), Bacio della Regina Ragno (Camminare sui Ragni 24h), Serenata al Chiaro di Luna (Scurovisione 60ft 24h), o Rinforzo Positivo (Resistenza Necrotica 24h).',
    enlargingCost: 2000,
    enlargingBenefit: 'Vast Pub can have two magical beverages from the Pub Special list on tap at a time. Gains 3 additional hirelings (servers, total of 4).',
    enlargingBenefitIt: 'La Locanda Vast può avere due bevande magiche alla spina contemporaneamente. Ottiene 3 hireling aggiuntivi (camerieri, totale 4).',
    researchOptions: [
      {
        name: 'Information Gathering',
        nameIt: 'Raccolta Informazioni',
        description: 'Commission the bartender to gather information from spies about important events within 10 miles of your Bastion over the next 7 days. The spies can divulge the location of any creature familiar to you within 50 miles (not hidden by magic). If found, they also know where the creature has been for the previous 7 days.',
        descriptionIt: 'Commissiona al barista di raccogliere informazioni dalle spie su eventi importanti entro 10 miglia dal Bastion nei prossimi 7 giorni. Le spie possono rivelare la posizione di creature a te familiari entro 50 miglia (non nascoste da magia). Se trovate, sanno anche dove sono state nei 7 giorni precedenti.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days spying',
        effectDurationIt: '7 giorni di spionaggio'
      }
    ]
  },
  {
    type: 'reliquary',
    name: 'Reliquary',
    nameIt: 'Reliquiario',
    icon: '🏺',
    minLevel: 13,
    baseCost: 0,
    buildTime: 0,
    size: 'cramped',
    orders: ['harvest'],
    description: 'This vault holds sacred objects.',
    hirelings: 1,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Simbolo Sacro o Focus Druidico come Focus da Incantatore',
    passiveBenefit: 'Reliquary Charm: After a Long Rest in your Bastion, gain a Charm that lets you cast Greater Restoration once without expending a spell slot or using Material components. Lasts 7 days or until used.',
    passiveBenefitIt: 'Charm del Reliquiario: Dopo un Riposo Lungo nel Bastion, ottieni un Charm che ti permette di lanciare Ristorare Superiore una volta senza slot o componenti Materiali. Dura 7 giorni o finché non lo usi.',
    harvestOptions: [
      {
        name: 'Talisman',
        nameIt: 'Talismano',
        description: 'Commission the hireling to produce a specially prepared talisman (amulet, rune-carved box, statuette, or any Tiny nonmagical object with religious significance). You can use this talisman in place of one spell\'s Material components (up to 1,000 GP). The talisman isn\'t consumed. After use, return it to Reliquary for another Harvest order.',
        descriptionIt: 'Commissiona la creazione di un talismano preparato (amuleto, scatola con rune, statuetta o oggetto Minuscolo non magico con significato religioso). Puoi usarlo al posto di componenti Materiali di un incantesimo (fino a 1.000 GP). Il talismano non viene consumato. Dopo l\'uso, riportalo al Reliquiario per un nuovo ordine Harvest.',
        daysRequired: 1,
        goldCost: 0
      }
    ]
  },
  // LIVELLO 17+ FACILITIES
  // ============================================================
  {
    type: 'demiplane',
    name: 'Demiplane',
    nameIt: 'Semipiano',
    icon: '🌌',
    minLevel: 17,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['empower'],
    description: 'A door up to 5 feet wide and 10 feet tall appears on a flat surface in your Bastion, leading to a stone room in an extradimensional space.',
    hirelings: 1,
    prerequisite: 'Ability to use an Arcane Focus or a tool as a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Focus Arcano o uno strumento come Focus da Incantatore',
    passiveBenefit: 'Fabrication: While in the Demiplane, you can take a Magic action to create a nonmagical object from nothing (max 5 feet, value ≤5 GP, wood/stone/clay/porcelain/glass/paper/nonprecious crystal or metal). Requires Long Rest before using again.',
    passiveBenefitIt: 'Fabbricazione: Nel Semipiano, puoi usare un\'azione Magica per creare un oggetto non magico dal nulla (max 5 piedi, valore ≤5 GP, legno/pietra/argilla/porcellana/vetro/carta/cristallo o metallo non prezioso). Richiede Riposo Lungo prima di riutilizzare.',
    empowerOptions: [
      {
        name: 'Arcane Resilience',
        nameIt: 'Resilienza Arcana',
        description: 'Magical runes appear on the Demiplane\'s walls. You gain Temporary HP equal to 5 × your level after spending an entire Long Rest in the Demiplane.',
        descriptionIt: 'Rune magiche appaiono sulle pareti del Semipiano. Ottieni PF Temporanei pari a 5 × il tuo livello dopo aver completato un Riposo Lungo nel Semipiano.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days',
        effectDurationIt: '7 giorni'
      }
    ]
  },
  {
    type: 'guildhall',
    name: 'Guildhall',
    nameIt: 'Sede della Gilda',
    icon: '🏛️',
    minLevel: 17,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['recruit'],
    description: 'A Guildhall comes with a guild (~50 members). Choose the type of guild when building. The guild master is you. Each turn, issue Recruit: Guild Assignment to have members perform their specialty.',
    hirelings: 1,
    prerequisite: 'Expertise in a skill',
    prerequisiteIt: 'Competenza Esperienza in una skill'
    // NOTA: Non ha recruitOptions perché il tipo di gilda si sceglie alla creazione
    // e l'ordine Recruit applica automaticamente l'assignment di quella gilda.
    // Vedi GUILD_DEFINITIONS per i dettagli di ogni tipo.
  },
  {
    type: 'sanctum',
    name: 'Sanctum',
    nameIt: 'Sanctum',
    icon: '🔮',
    minLevel: 17,
    baseCost: 0,
    buildTime: 0,
    size: 'roomy',
    orders: ['empower'],
    description: 'A Sanctum is a place of solace and healing.',
    hirelings: 4,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    prerequisiteIt: 'Capacità di usare un Simbolo Sacro o Focus Druidico come Focus da Incantatore',
    passiveBenefit: 'Sanctum Charm: After a Long Rest in your Bastion, gain a Charm that lets you cast Heal once without expending a spell slot. Lasts 7 days or until used. You can\'t gain this Charm again while you still have it. | Sanctum Recall: While the Sanctum exists, you always have Word of Recall prepared. When you cast it, you can make your Sanctum the destination. One creature arriving via this spell gains the benefit of a Heal spell.',
    passiveBenefitIt: 'Charm del Sanctum: Dopo un Riposo Lungo, ottieni un Charm che ti permette di lanciare Guarigione una volta senza slot. Dura 7 giorni o finché non lo usi. Non puoi riottenere il Charm finché lo hai. | Richiamo del Sanctum: Finché il Sanctum esiste, hai sempre Parola del Ritorno preparato. Quando lo lanci, puoi usare il Sanctum come destinazione. Una creatura che arriva riceve il beneficio di Guarigione.',
    empowerOptions: [
      {
        name: 'Fortifying Rites',
        nameIt: 'Riti Fortificanti',
        description: 'You inspire the hirelings to perform daily rites that benefit you or another character you name. The beneficiary doesn\'t need to be in the Bastion when the rites are performed. Each time the beneficiary finishes a Long Rest, they gain Temporary HP equal to your level. This effect lasts for 7 days.',
        descriptionIt: 'Ispiri gli hireling a eseguire riti giornalieri che beneficiano te o un altro personaggio che nomini. Il beneficiario non deve essere nel Bastion durante i riti. Ogni volta che il beneficiario completa un Riposo Lungo, ottiene PF Temporanei pari al tuo livello. L\'effetto dura 7 giorni.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days',
        effectDurationIt: '7 giorni'
      }
    ]
  },
  {
    type: 'war-room',
    name: 'War Room',
    nameIt: 'Sala di Guerra',
    icon: '📋',
    minLevel: 17,
    baseCost: 0,
    buildTime: 0,
    size: 'vast',
    orders: ['recruit'],
    description: 'The War Room is where you plan military actions in consultation with an inner circle of loyal lieutenants, each one a battle-hardened Veteran Warrior whose alignment matches yours. You start with two lieutenants but can add more. If your Bastion lacks facilities to house them, they secure accommodations nearby.',
    hirelings: 2, // 2+ lieutenants
    prerequisite: 'Fighting Style feature or Unarmored Defense feature',
    prerequisiteIt: 'Privilegio Stile di Combattimento o privilegio Difesa Senz\'Armatura',
    passiveBenefit: 'Lieutenants: You can have up to 10 lieutenants at any time. Assign names and personalities as you see fit. Lieutenants are hirelings, not Bastion Defenders. However, if your Bastion is attacked, each lieutenant housed in your Bastion reduces by 1 the number of dice you roll to determine Bastion Defender losses.',
    passiveBenefitIt: 'Luogotenenti: Puoi avere fino a 10 luogotenenti. Assegna nomi e personalità a piacere. I luogotenenti sono hireling, non Difensori. Tuttavia, se il Bastion è attaccato, ogni luogotenente ospitato riduce di 1 il numero di dadi tirati per determinare le perdite di Difensori.',
    recruitOptions: [
      {
        name: 'Recruit Lieutenant',
        nameIt: 'Recluta Luogotenente',
        description: 'You gain one new lieutenant. You can have up to 10 lieutenants at any time.',
        descriptionIt: 'Ottieni un nuovo luogotenente. Puoi avere fino a 10 luogotenenti.',
        daysRequired: 1,
        goldCost: 0
      },
      {
        name: 'Recruit Soldiers',
        nameIt: 'Recluta Soldati',
        description: 'Commission one or more of your lieutenants to assemble a small army. Each lieutenant can muster 100 Guards in 7 days to fight for your cause. Reduce that to 20 if you want them mounted on Riding Horses. It costs 1 GP per day to feed each guard and each horse. Wherever the army goes, it must be led by you or at least one of your lieutenants, or else it disbands immediately. The army also disbands if it goes 1 day without being fed. You can\'t issue this Recruit order again until your current army disbands or is destroyed.',
        descriptionIt: 'Commissiona a uno o più luogotenenti di assemblare un piccolo esercito. Ogni luogotenente può radunare 100 Guardie in 7 giorni. Riduci a 20 se le vuoi a cavallo. Costa 1 GP al giorno per nutrire ogni guardia e cavallo. Ovunque vada l\'esercito, deve essere guidato da te o da almeno un luogotenente, altrimenti si scioglie. Si scioglie anche se passa 1 giorno senza essere nutrito. Non puoi dare di nuovo questo ordine finché l\'esercito attuale non si scioglie o viene distrutto.',
        daysRequired: 1,
        goldCost: 0,
        effectDuration: '7 days to muster',
        effectDurationIt: '7 giorni per radunare'
      }
    ]
  }
];

// ============================================================
// MAIN INTERFACES
// ============================================================

export interface BastionOwner {
  id: string; // UUID
  name: string;
  level: number;
  class?: string;
  maxFacilities: number; // calcolato dal livello
  color?: string; // colore identificativo
  icon?: string; // emoji icona personalizzata
}

/**
 * Icone disponibili per i proprietari
 */
export const OWNER_ICONS = [
  '⚔️', // guerriero
  '🧙', // mago
  '🏹', // arciere
  '🗡️', // assassino
  '🛡️', // paladino
  '🎭', // bardo
  '🐺', // druido
  '⚡', // monaco
  '🔮', // stregone
  '📿', // chierico
  '🎯', // ranger
  '💀', // warlock
];

export interface BastionHireling {
  id: string;
  name: string;
  role: string; // descrizione libera
  facilityId: string; // a quale facility è assegnato
  salary?: number; // costo giornaliero (opzionale)
}

export interface BastionOrder {
  id: string;
  type: BastionOrderType;
  description: string;
  startedAt?: Date;
  completesAt: Date | string;
  startTurn: number; // turno di inizio
  turnsRequired: number; // turni bastion richiesti (default 1)
  status: OrderStatus;
  result?: string;
  goldCost?: number;
  goldEarned?: number;
  craftOption?: string; // nome dell'opzione craft selezionata
}

export interface BastionFacility {
  id: string;
  type: FacilityType;
  customName?: string; // nome personalizzato
  ownerId: string; // a quale PG appartiene
  size: FacilitySize;
  isBuilding: boolean;
  buildStarted?: Date;
  buildCompletes?: Date;
  currentOrder?: BastionOrder;
  orderHistory: BastionOrder[];
  notes?: string;
  guildType?: GuildType; // Solo per Guildhall: tipo di gilda scelto
  isEnlarged?: boolean; // true se la facility è stata espansa a Vast
}

export interface BastionEvent {
  id: string;
  turn: number;
  roll?: number; // risultato d100 principale
  subRoll?: number; // risultato sottotabella (1d8, 1d4, 1d100)
  type: 'all-is-well' | 'attack' | 'criminal-hireling' | 'opportunity' | 'friendly-visitors' | 
        'guest' | 'lost-hirelings' | 'magical-discovery' | 'refugees' | 'request-for-aid' | 'treasure' |
        'order-completed'; // Aggiunto: notifica completamento ordine
  title: string;
  description: string;
  mechanics?: string; // meccaniche specifiche dell'evento
  subTableResult?: string; // risultato della sottotabella
  outcome?: string;
  resolved: boolean;
  resolvedDate?: Date;
  date: Date;
  triggeringOwnerId?: string;
  facilityId?: string; // per eventi collegati a facility
  orderType?: BastionOrderType; // per eventi di ordine completato
  craftedItem?: string; // nome dell'oggetto creato
}

// Transazione Gold
export interface GoldTransaction {
  id: string;
  amount: number; // positivo = entrata, negativo = uscita
  reason: string;
  date: Date;
  bastionTurn: number;
  balanceAfter: number;
}

// Trofeo per Trophy Room
export interface Trophy {
  id: string;
  name: string;
  description?: string;
  acquiredFrom?: string;
  acquiredDate: Date;
  estimatedValue?: number;
  icon?: string;
}

// Bastion Defender (DMG 2024)
export interface BastionDefender {
  id: string;
  name: string;
  type: 'hired' | 'mercenary' | 'monster'; // assunto, mercenario (da Guest), mostro amichevole
  source?: string; // da dove proviene (es. "Guest Event", "Barracks")
  hiredDate: Date;
  monthlyCost?: number; // costo mensile (opzionale)
  notes?: string;
}

export interface Bastion {
  id?: number;
  name: string;
  location?: string;
  gold: number;
  currentTurn: number;
  turnStartDate: Date;
  owners: BastionOwner[];
  facilities: BastionFacility[];
  hirelings: BastionHireling[];
  defenders: BastionDefender[]; // Bastion Defenders
  events: BastionEvent[];
  goldHistory: GoldTransaction[];
  trophies: Trophy[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Calcola il numero massimo di facility per un PG in base al livello
 */
export function getMaxFacilitiesForLevel(level: number): number {
  if (level >= 17) return 8;
  if (level >= 13) return 7;
  if (level >= 9) return 6;
  if (level >= 5) return 4;
  return 0; // sotto lv 5 non si può avere un bastion
}

/**
 * Ottiene le facility disponibili per un dato livello
 */
export function getAvailableFacilities(level: number): FacilityDefinition[] {
  return FACILITY_DEFINITIONS.filter(f => f.minLevel <= level);
}

/**
 * Ottiene la definizione di una facility
 */
export function getFacilityDefinition(type: FacilityType): FacilityDefinition | undefined {
  return FACILITY_DEFINITIONS.find(f => f.type === type);
}

/**
 * Genera un UUID semplice
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Colori disponibili per i proprietari
 */
export const OWNER_COLORS = [
  '#e74c3c', // rosso
  '#3498db', // blu
  '#27ae60', // verde
  '#9b59b6', // viola
  '#f39c12', // arancione
  '#1abc9c', // teal
  '#e91e63', // rosa
  '#00bcd4', // cyan
  '#ff5722', // arancione scuro
  '#607d8b', // grigio blu
  '#8bc34a', // lime
  '#ffc107', // ambra
];

/**
 * Icone per tipi di ordini
 */
export const ORDER_ICONS: Record<BastionOrderType, string> = {
  'craft': '🔨',
  'empower': '✨',
  'harvest': '🌾',
  'recruit': '👥',
  'research': '📖',
  'trade': '💰',
  'none': '—'
};

/**
 * Nomi italiani per ordini
 */
export const ORDER_NAMES_IT: Record<BastionOrderType, string> = {
  'craft': 'Crea',
  'empower': 'Potenzia',
  'harvest': 'Raccogli',
  'recruit': 'Recluta',
  'research': 'Ricerca',
  'trade': 'Commercia',
  'none': 'Nessuno'
};

/**
 * Random Events - DMG 2024 Official Table (Chapter 8: Bastions, p.350-352)
 * d100: Bastion Events Table
 */
export interface RandomEventDefinition {
  id: string;
  type: 'all-is-well' | 'attack' | 'criminal-hireling' | 'opportunity' | 'friendly-visitors' | 
        'guest' | 'lost-hirelings' | 'magical-discovery' | 'refugees' | 'request-for-aid' | 'treasure';
  title: string;
  titleIt: string;
  description: string;
  descriptionIt: string;
  minRoll: number;
  maxRoll: number;
  mechanics?: string;
  subTable?: SubTableEntry[];
}

export interface SubTableEntry {
  roll: number;
  description: string;
  descriptionIt: string;
}

// ============================================================
// DMG 2024 OFFICIAL BASTION EVENTS TABLE (d100)
// ============================================================
export const BASTION_RANDOM_EVENTS: RandomEventDefinition[] = [
  // ============================================================
  // 01-50: ALL IS WELL (50%)
  // ============================================================
  { 
    id: 'all-is-well', 
    type: 'all-is-well', 
    title: 'All Is Well', 
    titleIt: 'Tutto Bene', 
    description: 'Nothing significant happens. Roll 1d8 for a flavour detail.',
    descriptionIt: 'Nulla di significativo accade. Tira 1d8 per un dettaglio di colore.',
    minRoll: 1, 
    maxRoll: 50,
    subTable: [
      { roll: 1, description: 'Accident reports are way down.', descriptionIt: 'I rapporti sugli incidenti sono diminuiti notevolmente.' },
      { roll: 2, description: 'The leak in the roof has been fixed.', descriptionIt: 'La perdita sul tetto è stata riparata.' },
      { roll: 3, description: 'No vermin infestations to report.', descriptionIt: 'Nessuna infestazione di parassiti da segnalare.' },
      { roll: 4, description: 'You-Know-Who lost their spectacles again.', descriptionIt: 'Sai-Chi ha perso di nuovo gli occhiali.' },
      { roll: 5, description: 'One of your hirelings adopted a stray dog.', descriptionIt: 'Uno dei tuoi hirelings ha adottato un cane randagio.' },
      { roll: 6, description: 'You received a lovely letter from a friend.', descriptionIt: 'Hai ricevuto una bella lettera da un amico.' },
      { roll: 7, description: 'Some practical joker has been putting rotten eggs in people\'s boots.', descriptionIt: 'Qualche burlone sta mettendo uova marce negli stivali della gente.' },
      { roll: 8, description: 'Someone thought they saw a ghost.', descriptionIt: 'Qualcuno pensava di aver visto un fantasma.' }
    ]
  },

  // ============================================================
  // 51-55: ATTACK (5%)
  // ============================================================
  { 
    id: 'attack', 
    type: 'attack', 
    title: 'Attack', 
    titleIt: 'Attacco',
    description: 'A hostile force attacks your Bastion but is defeated. Roll 6d6; for each die that rolls a 1, one Bastion Defender dies.',
    descriptionIt: 'Una forza ostile attacca il Bastion ma viene sconfitta. Tira 6d6; per ogni dado che fa 1, un Bastion Defender muore.',
    minRoll: 51, 
    maxRoll: 55,
    mechanics: 'Roll 6d6. Each 1 = 1 Bastion Defender dies. If 0 Defenders, a random special facility shuts down (can\'t be used next Bastion turn, then repaired free).'
  },

  // ============================================================
  // 56-58: CRIMINAL HIRELING (3%)
  // ============================================================
  { 
    id: 'criminal-hireling', 
    type: 'criminal-hireling', 
    title: 'Criminal Hireling', 
    titleIt: 'Hireling Criminale',
    description: 'One of your hirelings has a criminal past. Officials or bounty hunters arrive with a warrant.',
    descriptionIt: 'Uno dei tuoi hirelings ha un passato criminale. Arrivano ufficiali o cacciatori di taglie con un mandato.',
    minRoll: 56, 
    maxRoll: 58,
    mechanics: 'Pay 1d6 × 100 GP to keep the hireling, or they are arrested. If the facility loses its hirelings, it can\'t be used next Bastion turn (then replaced free).'
  },

  // ============================================================
  // 59-63: EXTRAORDINARY OPPORTUNITY (5%)
  // ============================================================
  { 
    id: 'extraordinary-opportunity', 
    type: 'opportunity', 
    title: 'Extraordinary Opportunity', 
    titleIt: 'Opportunità Straordinaria',
    description: 'Your Bastion can host a festival, fund research, or appease a noble. Work with the DM for details.',
    descriptionIt: 'Il tuo Bastion può ospitare un festival, finanziare una ricerca o compiacere un nobile. Lavora col DM per i dettagli.',
    minRoll: 59, 
    maxRoll: 63,
    mechanics: 'Pay 500 GP to seize the opportunity → gain recognition, DM rolls again on the table (reroll if this result). Decline = nothing happens.'
  },

  // ============================================================
  // 64-72: FRIENDLY VISITORS (9%)
  // ============================================================
  { 
    id: 'friendly-visitors', 
    type: 'friendly-visitors', 
    title: 'Friendly Visitors', 
    titleIt: 'Visitatori Amichevoli',
    description: 'Friendly visitors seek to use one of your special facilities. They offer gold for brief use.',
    descriptionIt: 'Visitatori amichevoli cercano di usare una delle tue facility speciali. Offrono oro per un uso breve.',
    minRoll: 64, 
    maxRoll: 72,
    mechanics: 'Visitors offer 1d6 × 100 GP for brief use of a facility. This doesn\'t interrupt any orders you\'ve issued.'
  },

  // ============================================================
  // 73-76: GUEST (4%)
  // ============================================================
  { 
    id: 'guest', 
    type: 'guest', 
    title: 'Guest', 
    titleIt: 'Ospite',
    description: 'A friendly guest comes to stay at your Bastion. Roll 1d4 for the type of guest.',
    descriptionIt: 'Un ospite amichevole viene a stare nel tuo Bastion. Tira 1d4 per il tipo di ospite.',
    minRoll: 73, 
    maxRoll: 76,
    subTable: [
      { roll: 1, description: 'Individual of great renown stays 7 days, gives letter of recommendation (Mark of Prestige).', descriptionIt: 'Persona di gran fama resta 7 giorni, ti dà una lettera di raccomandazione (Mark of Prestige).' },
      { roll: 2, description: 'Refugee seeks sanctuary for 7 days, then offers 1d6 × 100 GP.', descriptionIt: 'Rifugiato cerca santuario per 7 giorni, poi offre 1d6 × 100 GP.' },
      { roll: 3, description: 'Mercenary joins as Bastion Defender (free, stays until killed or dismissed).', descriptionIt: 'Mercenario si unisce come Bastion Defender (gratis, resta finché non muore o viene congedato).' },
      { roll: 4, description: 'Friendly monster (brass dragon/treant) defends if Bastion is attacked (no Defender losses).', descriptionIt: 'Mostro amichevole (drago di bronzo/treant) difende se il Bastion viene attaccato (nessuna perdita di Defender).' }
    ]
  },

  // ============================================================
  // 77-79: LOST HIRELINGS (3%)
  // ============================================================
  { 
    id: 'lost-hirelings', 
    type: 'lost-hirelings', 
    title: 'Lost Hirelings', 
    titleIt: 'Hirelings Persi',
    description: 'One of your special facilities (random) loses its hirelings. The facility can\'t be used next Bastion turn.',
    descriptionIt: 'Una delle tue facility speciali (casuale) perde i suoi hirelings. La facility non può essere usata al prossimo turno.',
    minRoll: 77, 
    maxRoll: 79,
    mechanics: 'Facility unusable next turn. Hirelings are replaced at no cost after that.'
  },

  // ============================================================
  // 80-83: MAGICAL DISCOVERY (4%)
  // ============================================================
  { 
    id: 'magical-discovery', 
    type: 'magical-discovery', 
    title: 'Magical Discovery', 
    titleIt: 'Scoperta Magica',
    description: 'Your hirelings discover or accidentally create an Uncommon magic item at no cost to you.',
    descriptionIt: 'I tuoi hirelings scoprono o creano accidentalmente un oggetto magico Non Comune gratuitamente.',
    minRoll: 80, 
    maxRoll: 83,
    mechanics: 'The magic item must be a Potion or Scroll.'
  },

  // ============================================================
  // 84-91: REFUGEES (8%)
  // ============================================================
  { 
    id: 'refugees', 
    type: 'refugees', 
    title: 'Refugees', 
    titleIt: 'Rifugiati',
    description: 'A group of 2d4 refugees seeks refuge from a monster attack, disaster, or calamity.',
    descriptionIt: 'Un gruppo di 2d4 rifugiati cerca rifugio da un attacco di mostri, disastro o calamità.',
    minRoll: 84, 
    maxRoll: 91,
    mechanics: 'If you have a basic facility large enough, they stay and offer 1d6 × 100 GP. They remain until they find a new home or the Bastion is attacked.'
  },

  // ============================================================
  // 92-98: REQUEST FOR AID (7%)
  // ============================================================
  { 
    id: 'request-for-aid', 
    type: 'request-for-aid', 
    title: 'Request for Aid', 
    titleIt: 'Richiesta di Aiuto',
    description: 'A local leader calls on your Bastion for help. Send Bastion Defenders to assist.',
    descriptionIt: 'Un leader locale chiede aiuto al tuo Bastion. Invia Bastion Defenders per assistere.',
    minRoll: 92, 
    maxRoll: 98,
    mechanics: 'Roll 1d6 per Defender sent. Total ≥ 10: problem solved, earn 1d6 × 100 GP. Total < 10: problem solved, reward halved, 1 Defender dies.'
  },

  // ============================================================
  // 99-00: TREASURE (2%)
  // ============================================================
  { 
    id: 'treasure', 
    type: 'treasure', 
    title: 'Treasure', 
    titleIt: 'Tesoro',
    description: 'Your Bastion acquires an art object or magic item. Roll 1d100 for the treasure type.',
    descriptionIt: 'Il tuo Bastion acquisisce un oggetto d\'arte o magico. Tira 1d100 per il tipo di tesoro.',
    minRoll: 99, 
    maxRoll: 100,
    subTable: [
      { roll: 40, description: '01-40: Roll on 25 GP Art Objects table', descriptionIt: '01-40: Tira sulla tabella Oggetti d\'Arte da 25 GP' },
      { roll: 63, description: '41-63: Roll on 250 GP Art Objects table', descriptionIt: '41-63: Tira sulla tabella Oggetti d\'Arte da 250 GP' },
      { roll: 73, description: '64-73: Roll on 750 GP Art Objects table', descriptionIt: '64-73: Tira sulla tabella Oggetti d\'Arte da 750 GP' },
      { roll: 75, description: '74-75: Roll on 2,500 GP Art Objects table', descriptionIt: '74-75: Tira sulla tabella Oggetti d\'Arte da 2.500 GP' },
      { roll: 90, description: '76-90: Common Magic Item (Arcana, Armaments, Implements, or Relics)', descriptionIt: '76-90: Oggetto Magico Comune (Arcana, Armamenti, Implementi o Reliquie)' },
      { roll: 98, description: '91-98: Uncommon Magic Item', descriptionIt: '91-98: Oggetto Magico Non Comune' },
      { roll: 100, description: '99-00: Rare Magic Item', descriptionIt: '99-00: Oggetto Magico Raro' }
    ]
  }
];

/**
 * Tira un evento casuale bastion (d100) - DMG 2024
 */
export function rollBastionEvent(): { roll: number; event: RandomEventDefinition; subRoll?: number } {
  const roll = Math.floor(Math.random() * 100) + 1;
  const event = BASTION_RANDOM_EVENTS.find(e => roll >= e.minRoll && roll <= e.maxRoll) 
    || BASTION_RANDOM_EVENTS[0];
  
  // Se l'evento ha una sottotabella, tira anche quella
  let subRoll: number | undefined;
  if (event.subTable) {
    if (event.type === 'all-is-well') {
      subRoll = Math.floor(Math.random() * 8) + 1; // 1d8
    } else if (event.type === 'guest') {
      subRoll = Math.floor(Math.random() * 4) + 1; // 1d4
    } else if (event.type === 'treasure') {
      subRoll = Math.floor(Math.random() * 100) + 1; // 1d100
    }
  }
  
  return { roll, event, subRoll };
}
