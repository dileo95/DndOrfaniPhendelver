import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, CharacterSheet as Sheet, Weapon, Spell, CharacterClass, Currency, EquipmentItem, DeathSaves } from '../../services/database.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-character-sheet',
  imports: [CommonModule, FormsModule],
  templateUrl: './character-sheet.html',
  styleUrl: './character-sheet.scss',
})
export class CharacterSheet implements OnInit {
  character = signal<string>('');
  sheet = signal<Sheet | null>(null);
  editMode = signal(false);
  
  // Tab navigation
  activeTab: 'main' | 'combat' | 'spells' | 'inventory' | 'bio' = 'main';

  // Calcolati
  strModifier = computed(() => this.calcModifier(this.sheet()?.strength || 10));
  dexModifier = computed(() => this.calcModifier(this.sheet()?.dexterity || 10));
  conModifier = computed(() => this.calcModifier(this.sheet()?.constitution || 10));
  intModifier = computed(() => this.calcModifier(this.sheet()?.intelligence || 10));
  wisModifier = computed(() => this.calcModifier(this.sheet()?.wisdom || 10));
  chaModifier = computed(() => this.calcModifier(this.sheet()?.charisma || 10));

  // D&D Skills
  allSkills = [
    { name: 'Acrobatics', ability: 'DEX' },
    { name: 'Animal Handling', ability: 'WIS' },
    { name: 'Arcana', ability: 'INT' },
    { name: 'Athletics', ability: 'STR' },
    { name: 'Deception', ability: 'CHA' },
    { name: 'History', ability: 'INT' },
    { name: 'Insight', ability: 'WIS' },
    { name: 'Intimidation', ability: 'CHA' },
    { name: 'Investigation', ability: 'INT' },
    { name: 'Medicine', ability: 'WIS' },
    { name: 'Nature', ability: 'INT' },
    { name: 'Perception', ability: 'WIS' },
    { name: 'Performance', ability: 'CHA' },
    { name: 'Persuasion', ability: 'CHA' },
    { name: 'Religion', ability: 'INT' },
    { name: 'Sleight of Hand', ability: 'DEX' },
    { name: 'Stealth', ability: 'DEX' },
    { name: 'Survival', ability: 'WIS' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.character.set(this.route.snapshot.paramMap.get('character') || '');
    await this.loadSheet();
    
    // Se non esiste, crea scheda base
    if (!this.sheet()) {
      this.createDefaultSheet();
    }
  }

  async loadSheet() {
    const sheet = await this.db.getCharacterSheet(this.character());
    this.sheet.set(sheet || null);
  }

  createDefaultSheet() {
    const characterName = this.character();
    
    // Template base con tutti i nuovi campi
    let defaultSheet: Partial<Sheet> = {
      character: characterName,
      characterName: characterName.charAt(0).toUpperCase() + characterName.slice(1),
      playerName: '',
      
      // Stats
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      
      // Info base
      race: '',
      subrace: '',
      class: '',
      level: 1,
      classes: [],
      background: '',
      alignment: 'Neutral',
      experience: 0,
      inspiration: false,
      characterImage: '',
      
      // Combattimento
      armorClass: 10,
      initiative: 0,
      speed: 30,
      currentHP: 10,
      maxHP: 10,
      temporaryHP: 0,
      hitDice: '1d8',
      hitDiceRemaining: 1,
      deathSaves: { successes: 0, failures: 0 },
      
      // Proficiency
      proficiencyBonus: 2,
      savingThrows: [],
      skills: {},
      languages: ['Common'],
      armorProficiencies: [],
      weaponProficiencies: [],
      toolProficiencies: [],
      
      // Equipaggiamento
      weapons: [],
      armor: 'None',
      shield: '',
      equipment: [],
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      
      // Incantesimi
      spellcastingAbility: '',
      spellSaveDC: 0,
      spellAttackBonus: 0,
      spells: [],
      spellSlots: {},
      pactMagic: undefined,
      
      // Tratti e abilità
      features: [],
      traits: [],
      
      // Personalità
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      
      // Aspetto
      age: '',
      height: '',
      weight: '',
      eyes: '',
      skin: '',
      hair: '',
      appearance: '',
      
      // Backstory
      backstory: '',
      alliesAndOrganizations: '',
      additionalNotes: ''
    };

    // Schede predefinite per ogni personaggio
    if (characterName === 'asriel') {
      defaultSheet = {
        ...defaultSheet,
        characterName: 'Asriel',
        race: 'Human',
        subrace: 'Variant',
        class: 'Warlock',
        level: 5,
        classes: [{ name: 'Warlock', subclass: 'The Fiend', level: 5, hitDie: 8 }],
        background: 'Haunted One',
        alignment: 'Chaotic Good',
        experience: 6500,
        
        strength: 10,
        dexterity: 14,
        constitution: 12,
        intelligence: 13,
        wisdom: 10,
        charisma: 18,
        
        armorClass: 13,
        initiative: 2,
        speed: 30,
        maxHP: 35,
        currentHP: 35,
        hitDice: '5d8',
        hitDiceRemaining: 5,
        deathSaves: { successes: 0, failures: 0 },
        
        proficiencyBonus: 3,
        savingThrows: ['Wisdom', 'Charisma'],
        skills: { 'Arcana': 1, 'Deception': 1, 'Intimidation': 1, 'Investigation': 1 },
        languages: ['Common', 'Infernal', 'Abyssal'],
        armorProficiencies: ['Light Armor'],
        weaponProficiencies: ['Simple Weapons'],
        
        weapons: [
          { name: 'Eldritch Blast', damage: '2d10+8', damageType: 'Force', attackBonus: 7, properties: 'Cantrip, Range 120ft, 2 beams' },
          { name: 'Pact Blade (Longsword)', damage: '1d8+4', damageType: 'Slashing', attackBonus: 7, properties: 'Pact Weapon, Magical' }
        ],
        armor: 'Leather Armor (AC 11 + DEX)',
        currency: { cp: 0, sp: 15, ep: 0, gp: 45, pp: 0 },
        
        spellcastingAbility: 'Charisma',
        spellSaveDC: 15,
        spellAttackBonus: 7,
        pactMagic: { slotLevel: 3, slotsMax: 2, slotsCurrent: 2 },
        spells: [
          { name: 'Eldritch Blast', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 ft', components: 'V, S', duration: 'Instantaneous', description: 'Two beams of crackling energy. +4 damage each (Agonizing Blast)', prepared: true },
          { name: 'Minor Illusion', level: 0, school: 'Illusion', castingTime: '1 action', range: '30 ft', components: 'S, M', duration: '1 minute', description: 'Create a sound or image', prepared: true },
          { name: 'Hex', level: 1, school: 'Enchantment', castingTime: '1 bonus action', range: '90 ft', components: 'V, S, M', duration: 'Concentration, up to 1 hour', description: '+1d6 necrotic on hits, disadvantage on one ability check', prepared: true },
          { name: 'Armor of Agathys', level: 1, school: 'Abjuration', castingTime: '1 action', range: 'Self', components: 'V, S, M', duration: '1 hour', description: '5 temp HP per slot level, cold damage to attackers', prepared: true },
          { name: 'Hellish Rebuke', level: 1, school: 'Evocation', castingTime: '1 reaction', range: '60 ft', components: 'V, S', duration: 'Instantaneous', description: '2d10 fire damage on being hit', prepared: true },
          { name: 'Misty Step', level: 2, school: 'Conjuration', castingTime: '1 bonus action', range: 'Self', components: 'V', duration: 'Instantaneous', description: 'Teleport up to 30 feet', prepared: true },
          { name: 'Darkness', level: 2, school: 'Evocation', castingTime: '1 action', range: '60 ft', components: 'V, M', duration: 'Concentration, 10 minutes', description: 'Magical darkness, can see through it (Devil\'s Sight)', prepared: true },
          { name: 'Fireball', level: 3, school: 'Evocation', castingTime: '1 action', range: '150 ft', components: 'V, S, M', duration: 'Instantaneous', description: '8d6 fire damage, 20ft radius (The Fiend expanded)', prepared: true }
        ],
        
        features: [
          'Pact of the Blade - Create magical weapon',
          'Dark One\'s Blessing - Temp HP on kill = CHA + Warlock level',
          'Eldritch Invocations: Agonizing Blast, Devil\'s Sight, Thirsting Blade'
        ],
        traits: ['Bonus Feat (Human Variant)', 'Extra Skill'],
        
        personalityTraits: 'Haunted by the experiments that created me. I see omens in every event.',
        ideals: 'Power. Knowledge is the path to power and domination.',
        bonds: 'I have a dark pact with Graz\'zt that I must honor.',
        flaws: 'I am suspicious of strangers and expect the worst of people.',
        
        eyes: 'Golden with slitted pupils',
        hair: 'Black',
        skin: 'Pale',
        appearance: 'Tall and gaunt, with an unsettling presence',
        
        backstory: 'Subjected to dark experiments, Asriel escaped and made a pact with the demon lord Graz\'zt for power to seek revenge.',
        characterImage: './assets/img/asriel.png'
      };
    } else if (characterName === 'auryn') {
      defaultSheet = {
        ...defaultSheet,
        characterName: 'Auryn',
        race: 'Half-Elf',
        class: 'Rogue',
        level: 5,
        classes: [{ name: 'Rogue', subclass: 'Arcane Trickster', level: 5, hitDie: 8 }],
        background: 'Criminal',
        alignment: 'Chaotic Neutral',
        experience: 6500,
        
        strength: 10,
        dexterity: 18,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        charisma: 14,
        
        armorClass: 15,
        initiative: 4,
        speed: 30,
        maxHP: 38,
        currentHP: 38,
        hitDice: '5d8',
        hitDiceRemaining: 5,
        deathSaves: { successes: 0, failures: 0 },
        
        proficiencyBonus: 3,
        savingThrows: ['Dexterity', 'Intelligence'],
        skills: { 
          'Acrobatics': 2, 'Stealth': 2, 'Sleight of Hand': 1, 'Perception': 1,
          'Deception': 1, 'Investigation': 1
        },
        languages: ['Common', 'Elvish', 'Thieves\' Cant'],
        armorProficiencies: ['Light Armor'],
        weaponProficiencies: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
        toolProficiencies: ['Thieves\' Tools', 'Playing Cards'],
        
        weapons: [
          { name: 'Rapier', damage: '1d8+4', damageType: 'Piercing', attackBonus: 7, properties: 'Finesse' },
          { name: 'Shortbow', damage: '1d6+4', damageType: 'Piercing', attackBonus: 7, properties: 'Range 80/320' },
          { name: 'Dagger', damage: '1d4+4', damageType: 'Piercing', attackBonus: 7, properties: 'Finesse, Light, Thrown (20/60)' }
        ],
        armor: 'Studded Leather (AC 12 + DEX)',
        currency: { cp: 0, sp: 0, ep: 0, gp: 75, pp: 2 },
        
        spellcastingAbility: 'Intelligence',
        spellSaveDC: 12,
        spellAttackBonus: 4,
        spellSlots: { 1: { max: 3, current: 3 } },
        spells: [
          { name: 'Mage Hand', level: 0, school: 'Conjuration', castingTime: '1 action', range: '30 ft', components: 'V, S', duration: '1 minute', description: 'Invisible spectral hand (Legerdemain)', prepared: true },
          { name: 'Minor Illusion', level: 0, school: 'Illusion', castingTime: '1 action', range: '30 ft', components: 'S, M', duration: '1 minute', description: 'Create sound or image', prepared: true },
          { name: 'Find Familiar', level: 1, school: 'Conjuration', castingTime: '1 hour', range: '10 ft', components: 'V, S, M', duration: 'Instantaneous', description: 'Summon spirit familiar', prepared: true },
          { name: 'Disguise Self', level: 1, school: 'Illusion', castingTime: '1 action', range: 'Self', components: 'V, S', duration: '1 hour', description: 'Change appearance', prepared: true }
        ],
        
        features: [
          'Sneak Attack (3d6)',
          'Cunning Action - Dash, Disengage, Hide as bonus',
          'Uncanny Dodge - Halve damage as reaction',
          'Expertise - Stealth, Acrobatics (double proficiency)',
          'Mage Hand Legerdemain - Invisible, can pickpocket'
        ],
        traits: ['Darkvision 60ft', 'Fey Ancestry - Advantage vs charm, immune to sleep'],
        
        personalityTraits: 'I always have a plan for what to do when things go wrong.',
        ideals: 'Freedom. Chains are meant to be broken.',
        bonds: 'Someone I loved died because of a mistake I made.',
        flaws: 'When I see something valuable, I can\'t think about anything but how to steal it.',
        
        characterImage: './assets/img/auryn.png'
      };
    } else if (characterName === 'ravel') {
      defaultSheet = {
        ...defaultSheet,
        characterName: 'Ravel',
        race: 'Tiefling',
        class: 'Paladin',
        level: 5,
        classes: [{ name: 'Paladin', subclass: 'Oath of Devotion', level: 5, hitDie: 10 }],
        background: 'Soldier',
        alignment: 'Lawful Good',
        experience: 6500,
        
        strength: 18,
        dexterity: 10,
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 14,
        
        armorClass: 20,
        initiative: 0,
        speed: 30,
        maxHP: 47,
        currentHP: 47,
        hitDice: '5d10',
        hitDiceRemaining: 5,
        deathSaves: { successes: 0, failures: 0 },
        
        proficiencyBonus: 3,
        savingThrows: ['Wisdom', 'Charisma'],
        skills: { 'Athletics': 1, 'Intimidation': 1, 'Religion': 1, 'Persuasion': 1 },
        languages: ['Common', 'Infernal'],
        armorProficiencies: ['All Armor', 'Shields'],
        weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
        
        weapons: [
          { name: 'Longsword', damage: '1d8+4', damageType: 'Slashing', attackBonus: 7, properties: 'Versatile (1d10)' },
          { name: 'Javelin', damage: '1d6+4', damageType: 'Piercing', attackBonus: 7, properties: 'Range 30/120' }
        ],
        armor: 'Plate Armor (AC 18)',
        shield: 'Shield (+2 AC)',
        currency: { cp: 0, sp: 0, ep: 0, gp: 30, pp: 0 },
        
        spellcastingAbility: 'Charisma',
        spellSaveDC: 13,
        spellAttackBonus: 5,
        spellSlots: { 1: { max: 4, current: 4 }, 2: { max: 2, current: 2 } },
        spells: [
          { name: 'Divine Smite', level: 1, school: 'Evocation', castingTime: 'On hit', range: 'Self', components: '-', duration: 'Instantaneous', description: '+2d8 radiant (+1d8 per slot above 1st, +1d8 vs undead/fiend)', prepared: true },
          { name: 'Cure Wounds', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous', description: 'Heal 1d8+CHA per slot level', prepared: true },
          { name: 'Shield of Faith', level: 1, school: 'Abjuration', castingTime: '1 bonus action', range: '60 ft', components: 'V, S, M', duration: 'Concentration, 10 min', description: '+2 AC to target', prepared: true },
          { name: 'Protection from Evil and Good', level: 1, school: 'Abjuration', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: 'Concentration, 10 min', description: 'Oath spell - protection vs aberrations, celestials, etc.', prepared: true },
          { name: 'Sanctuary', level: 1, school: 'Abjuration', castingTime: '1 bonus action', range: '30 ft', components: 'V, S, M', duration: '1 minute', description: 'Oath spell - attackers must save or choose new target', prepared: true }
        ],
        
        features: [
          'Divine Sense - Detect celestials, fiends, undead',
          'Lay on Hands - Pool of 25 HP healing',
          'Fighting Style: Defense (+1 AC in armor)',
          'Divine Smite - Extra radiant damage on hit',
          'Divine Health - Immune to disease',
          'Extra Attack',
          'Sacred Weapon - +CHA to attack, weapon glows (Channel Divinity)',
          'Turn the Unholy - Turn fiends/undead (Channel Divinity)'
        ],
        traits: [
          'Hellish Resistance - Fire resistance',
          'Darkvision 60ft',
          'Infernal Legacy - Thaumaturgy cantrip'
        ],
        
        personalityTraits: 'I face problems head-on. A simple, direct solution is the best path to success.',
        ideals: 'Greater Good. My gifts are meant to be shared with all.',
        bonds: 'I would still lay down my life for the people I served with.',
        flaws: 'I made a terrible mistake in battle that cost many lives—I would do anything to keep that mistake secret.',
        
        characterImage: './assets/img/ravel.png'
      };
    } else if (characterName === 'ruben') {
      defaultSheet = {
        ...defaultSheet,
        characterName: 'Ruben',
        race: 'Dwarf',
        subrace: 'Hill Dwarf',
        class: 'Fighter',
        level: 5,
        classes: [{ name: 'Fighter', subclass: 'Champion', level: 5, hitDie: 10 }],
        background: 'Folk Hero',
        alignment: 'Neutral Good',
        experience: 6500,
        
        strength: 16,
        dexterity: 14,
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 10,
        
        armorClass: 18,
        initiative: 2,
        speed: 25,
        maxHP: 54, // 5d10 + 15 CON + 5 Hill Dwarf
        currentHP: 54,
        hitDice: '5d10',
        hitDiceRemaining: 5,
        deathSaves: { successes: 0, failures: 0 },
        
        proficiencyBonus: 3,
        savingThrows: ['Strength', 'Constitution'],
        skills: { 'Athletics': 1, 'Survival': 1, 'Animal Handling': 1, 'Perception': 1 },
        languages: ['Common', 'Dwarvish'],
        armorProficiencies: ['All Armor', 'Shields'],
        weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
        toolProficiencies: ['Smith\'s Tools', 'Vehicles (Land)'],
        
        weapons: [
          { name: 'Battleaxe', damage: '1d8+5', damageType: 'Slashing', attackBonus: 6, properties: 'Versatile (1d10), +2 Dueling' },
          { name: 'Handaxe', damage: '1d6+5', damageType: 'Slashing', attackBonus: 6, properties: 'Light, Thrown (20/60), +2 Dueling' },
          { name: 'Heavy Crossbow', damage: '1d10+2', damageType: 'Piercing', attackBonus: 5, properties: 'Range 100/400, Loading, Two-Handed' }
        ],
        armor: 'Chain Mail (AC 16)',
        shield: 'Shield (+2 AC)',
        currency: { cp: 50, sp: 30, ep: 0, gp: 20, pp: 0 },
        
        features: [
          'Fighting Style: Dueling (+2 damage one-handed)',
          'Second Wind - Bonus action heal 1d10+5, 1/short rest',
          'Action Surge - Extra action, 1/short rest',
          'Extra Attack - Attack twice per action',
          'Improved Critical - Crit on 19-20 (Champion)'
        ],
        traits: [
          'Darkvision 60ft',
          'Dwarven Resilience - Advantage vs poison, resistance to poison damage',
          'Stonecunning - History check on stonework',
          'Dwarven Toughness - +1 HP per level (Hill Dwarf)'
        ],
        
        personalityTraits: 'I judge people by their actions, not their words.',
        ideals: 'Sincerity. There\'s no good in pretending to be something I\'m not.',
        bonds: 'I protect those who cannot protect themselves.',
        flaws: 'I have trouble trusting my allies.',
        
        characterImage: './assets/img/ruben.png'
      };
    }

    this.sheet.set(defaultSheet as Sheet);
    this.editMode.set(true);
  }

  toggleEditMode() {
    this.editMode.set(!this.editMode());
  }

  async saveSheet() {
    if (!this.sheet()) return;

    await this.db.saveCharacterSheet(this.sheet()!);
    this.editMode.set(false);
    alert('Scheda salvata!');
  }

  calcModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  formatModifier(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  getSkillBonus(skillName: string): number {
    const sheet = this.sheet();
    if (!sheet) return 0;

    const skill = this.allSkills.find(s => s.name === skillName);
    if (!skill) return 0;

    let abilityMod = 0;
    switch (skill.ability) {
      case 'STR': abilityMod = this.strModifier(); break;
      case 'DEX': abilityMod = this.dexModifier(); break;
      case 'CON': abilityMod = this.conModifier(); break;
      case 'INT': abilityMod = this.intModifier(); break;
      case 'WIS': abilityMod = this.wisModifier(); break;
      case 'CHA': abilityMod = this.chaModifier(); break;
    }

    const proficient = sheet.skills[skillName] || 0;
    return abilityMod + (proficient * sheet.proficiencyBonus);
  }

  toggleSkillProficiency(skillName: string) {
    if (!this.editMode()) return;
    
    const sheet = this.sheet();
    if (!sheet) return;

    const currentProf = sheet.skills[skillName] || 0;
    sheet.skills[skillName] = currentProf === 0 ? 1 : (currentProf === 1 ? 2 : 0);
    this.sheet.set({ ...sheet });
  }

  addWeapon() {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.weapons.push({
      name: 'New Weapon',
      damage: '1d6',
      damageType: 'Slashing',
      attackBonus: 0
    });
    this.sheet.set({ ...sheet });
  }

  removeWeapon(index: number) {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.weapons.splice(index, 1);
    this.sheet.set({ ...sheet });
  }

  addSpell() {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.spells.push({
      name: 'New Spell',
      level: 0,
      school: 'Evocation',
      castingTime: '1 action',
      range: 'Self',
      components: 'V, S',
      duration: 'Instantaneous',
      description: ''
    });
    this.sheet.set({ ...sheet });
  }

  removeSpell(index: number) {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.spells.splice(index, 1);
    this.sheet.set({ ...sheet });
  }

  restoreHP(amount: number) {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.currentHP = Math.min(sheet.currentHP + amount, sheet.maxHP);
    this.sheet.set({ ...sheet });
    this.db.updateCharacterHP(sheet.character, sheet.currentHP, sheet.temporaryHP);
  }

  takeDamage(amount: number) {
    const sheet = this.sheet();
    if (!sheet) return;

    if (sheet.temporaryHP > 0) {
      const remainingDamage = amount - sheet.temporaryHP;
      sheet.temporaryHP = Math.max(0, sheet.temporaryHP - amount);
      if (remainingDamage > 0) {
        sheet.currentHP = Math.max(0, sheet.currentHP - remainingDamage);
      }
    } else {
      sheet.currentHP = Math.max(0, sheet.currentHP - amount);
    }

    this.sheet.set({ ...sheet });
    this.db.updateCharacterHP(sheet.character, sheet.currentHP, sheet.temporaryHP);
  }

  async longRest() {
    const sheet = this.sheet();
    if (!sheet) return;

    // Ripristina HP
    sheet.currentHP = sheet.maxHP;
    sheet.temporaryHP = 0;
    
    // Ripristina dadi vita (metà del totale, minimo 1)
    const totalHitDice = this.getTotalLevel();
    const diceToRestore = Math.max(1, Math.floor(totalHitDice / 2));
    sheet.hitDiceRemaining = Math.min(
      (sheet.hitDiceRemaining || 0) + diceToRestore,
      totalHitDice
    );
    
    // Reset death saves
    sheet.deathSaves = { successes: 0, failures: 0 };
    
    // Ripristina spell slots
    if (sheet.spellSlots) {
      for (const level in sheet.spellSlots) {
        sheet.spellSlots[level].current = sheet.spellSlots[level].max;
      }
    }
    
    // Ripristina pact magic slots
    if (sheet.pactMagic) {
      sheet.pactMagic.slotsCurrent = sheet.pactMagic.slotsMax;
    }

    this.sheet.set({ ...sheet });
    await this.db.saveCharacterSheet(sheet);
    alert('Long Rest completato! HP, spell slots e dadi vita ripristinati.');
  }

  goBack() {
    this.router.navigate([this.character(), 'home']);
  }

  async exportToPDF() {
    const sheet = this.sheet();
    if (!sheet) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colori D&D
    const goldColor: [number, number, number] = [139, 69, 19];
    const darkColor: [number, number, number] = [44, 24, 16];
    const textColor: [number, number, number] = [50, 50, 50];

    // ============ PAGINA 1: PRINCIPALE ============
    await this.generatePage1(pdf, sheet, margin, contentWidth, pageWidth, goldColor, darkColor, textColor);

    // ============ PAGINA 2: COMBATTIMENTO ============
    pdf.addPage();
    await this.generatePage2(pdf, sheet, margin, contentWidth, pageWidth, goldColor, darkColor, textColor);

    // ============ PAGINA 3: INCANTESIMI ============
    if (sheet.spells && sheet.spells.length > 0) {
      pdf.addPage();
      await this.generatePage3(pdf, sheet, margin, contentWidth, pageWidth, goldColor, darkColor, textColor);
    }

    // ============ PAGINA 4: INVENTARIO & BIO ============
    pdf.addPage();
    await this.generatePage4(pdf, sheet, margin, contentWidth, pageWidth, goldColor, darkColor, textColor);

    // Salva PDF
    pdf.save(`${sheet.character}_CharacterSheet.pdf`);
  }

  private async generatePage1(
    pdf: jsPDF, 
    sheet: Sheet, 
    margin: number, 
    contentWidth: number,
    pageWidth: number,
    goldColor: [number, number, number],
    darkColor: [number, number, number],
    textColor: [number, number, number]
  ) {
    let y = margin;

    // Header con nome e immagine
    pdf.setFillColor(...darkColor);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Avatar (se presente)
    if (sheet.characterImage) {
      try {
        const img = await this.loadImage(sheet.characterImage);
        pdf.addImage(img, 'PNG', margin, 8, 35, 35);
      } catch {
        // Avatar non caricato, continua senza
      }
    }
    
    // Nome e info
    const hasAvatar = !!sheet.characterImage;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(212, 175, 55);
    pdf.text(sheet.character?.toUpperCase() || 'PERSONAGGIO', hasAvatar ? 60 : margin, 22);
    
    pdf.setFontSize(12);
    pdf.setTextColor(200, 200, 200);
    const classStr = this.getClassString();
    pdf.text(`${sheet.race || 'Razza'} • ${classStr || sheet.class} • Livello ${this.getTotalLevel()}`, hasAvatar ? 60 : margin, 32);
    pdf.text(`Background: ${sheet.background || 'N/A'} • Allineamento: ${sheet.alignment || 'N/A'}`, hasAvatar ? 60 : margin, 40);

    y = 60;

    // XP Bar
    const xpPercent = sheet.experience ? Math.min((sheet.experience / this.getXPForNextLevel()) * 100, 100) : 0;
    pdf.setFillColor(60, 60, 60);
    pdf.rect(margin, y, contentWidth, 6, 'F');
    pdf.setFillColor(212, 175, 55);
    pdf.rect(margin, y, contentWidth * (xpPercent / 100), 6, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...textColor);
    pdf.text(`XP: ${sheet.experience || 0} / ${this.getXPForNextLevel()}`, margin + 2, y + 4);
    y += 12;

    // Caratteristiche (3x2)
    this.drawSectionHeader(pdf, 'CARATTERISTICHE', margin, y, contentWidth, goldColor);
    y += 10;
    
    const abilityWidth = (contentWidth - 10) / 3;
    const abilities = [
      { name: 'FOR', score: sheet.strength, mod: this.strModifier() },
      { name: 'DES', score: sheet.dexterity, mod: this.dexModifier() },
      { name: 'COS', score: sheet.constitution, mod: this.conModifier() },
      { name: 'INT', score: sheet.intelligence, mod: this.intModifier() },
      { name: 'SAG', score: sheet.wisdom, mod: this.wisModifier() },
      { name: 'CAR', score: sheet.charisma, mod: this.chaModifier() }
    ];

    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = margin + col * (abilityWidth + 5);
      const boxY = y + row * 28;
      
      pdf.setFillColor(250, 245, 235);
      pdf.setDrawColor(...goldColor);
      pdf.roundedRect(x, boxY, abilityWidth, 25, 2, 2, 'FD');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...goldColor);
      pdf.text(abilities[i].name, x + abilityWidth / 2, boxY + 6, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(...darkColor);
      pdf.text(this.formatModifier(abilities[i].mod), x + abilityWidth / 2, boxY + 16, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`(${abilities[i].score})`, x + abilityWidth / 2, boxY + 22, { align: 'center' });
    }
    y += 60;

    // Tiri Salvezza
    this.drawSectionHeader(pdf, 'TIRI SALVEZZA', margin, y, contentWidth, goldColor);
    y += 8;
    
    const savingThrows = sheet.savingThrows || [];
    const saves = [
      { name: 'Forza', mod: this.getSavingThrowBonus('strength'), prof: savingThrows.includes('strength') },
      { name: 'Destrezza', mod: this.getSavingThrowBonus('dexterity'), prof: savingThrows.includes('dexterity') },
      { name: 'Costituzione', mod: this.getSavingThrowBonus('constitution'), prof: savingThrows.includes('constitution') },
      { name: 'Intelligenza', mod: this.getSavingThrowBonus('intelligence'), prof: savingThrows.includes('intelligence') },
      { name: 'Saggezza', mod: this.getSavingThrowBonus('wisdom'), prof: savingThrows.includes('wisdom') },
      { name: 'Carisma', mod: this.getSavingThrowBonus('charisma'), prof: savingThrows.includes('charisma') }
    ];

    pdf.setFontSize(9);
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = margin + col * (contentWidth / 3);
      const saveY = y + row * 6;
      
      pdf.setTextColor(...textColor);
      pdf.setFont('helvetica', saves[i].prof ? 'bold' : 'normal');
      const profMark = saves[i].prof ? '●' : '○';
      pdf.text(`${profMark} ${saves[i].name}: ${this.formatModifier(saves[i].mod)}`, x, saveY);
    }
    y += 18;

    // Stats combattimento rapidi
    this.drawSectionHeader(pdf, 'COMBATTIMENTO', margin, y, contentWidth, goldColor);
    y += 10;
    
    const statWidth = contentWidth / 5;
    const combatStats = [
      { label: 'CA', value: sheet.armorClass?.toString() || '10' },
      { label: 'Iniziativa', value: this.formatModifier(sheet.initiative || 0) },
      { label: 'Velocità', value: `${sheet.speed || 30}` },
      { label: 'PF', value: `${sheet.currentHP}/${sheet.maxHP}` },
      { label: 'DV', value: sheet.hitDice || 'd8' }
    ];

    for (let i = 0; i < 5; i++) {
      const x = margin + i * statWidth;
      pdf.setFillColor(250, 245, 235);
      pdf.setDrawColor(...goldColor);
      pdf.roundedRect(x, y, statWidth - 3, 18, 2, 2, 'FD');
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(combatStats[i].label, x + (statWidth - 3) / 2, y + 5, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkColor);
      pdf.text(combatStats[i].value, x + (statWidth - 3) / 2, y + 14, { align: 'center' });
    }
    y += 25;

    // Abilità (Skills) - 2 colonne
    this.drawSectionHeader(pdf, 'ABILITÀ', margin, y, contentWidth, goldColor);
    y += 8;
    
    const halfWidth = contentWidth / 2;
    pdf.setFontSize(8);
    
    for (let i = 0; i < this.allSkills.length; i++) {
      const skill = this.allSkills[i];
      const col = i < 9 ? 0 : 1;
      const row = i < 9 ? i : i - 9;
      const x = margin + col * halfWidth;
      const skillY = y + row * 5;
      
      const skillLevel = sheet.skills?.[skill.name] || 0;
      const isProficient = skillLevel >= 1;
      pdf.setFont('helvetica', isProficient ? 'bold' : 'normal');
      pdf.setTextColor(...textColor);
      
      const profMark = skillLevel >= 2 ? '◆' : (isProficient ? '●' : '○');
      const bonus = this.getSkillBonus(skill.name);
      pdf.text(`${profMark} ${skill.name} (${skill.ability}): ${this.formatModifier(bonus)}`, x, skillY);
    }
    y += 50;

    // Competenze
    this.drawSectionHeader(pdf, 'COMPETENZE', margin, y, contentWidth, goldColor);
    y += 8;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...textColor);
    
    if (sheet.languages?.length) {
      pdf.text(`Linguaggi: ${sheet.languages.join(', ')}`, margin, y);
      y += 5;
    }
    if (sheet.armorProficiencies?.length) {
      pdf.text(`Armature: ${sheet.armorProficiencies.join(', ')}`, margin, y);
      y += 5;
    }
    if (sheet.weaponProficiencies?.length) {
      pdf.text(`Armi: ${sheet.weaponProficiencies.join(', ')}`, margin, y);
      y += 5;
    }
    if (sheet.toolProficiencies?.length) {
      pdf.text(`Strumenti: ${sheet.toolProficiencies.join(', ')}`, margin, y);
    }

    // Footer
    this.drawFooter(pdf, pageWidth, 1);
  }

  private async generatePage2(
    pdf: jsPDF, 
    sheet: Sheet, 
    margin: number, 
    contentWidth: number,
    pageWidth: number,
    goldColor: [number, number, number],
    darkColor: [number, number, number],
    textColor: [number, number, number]
  ) {
    let y = margin;

    // Header pagina
    pdf.setFillColor(...darkColor);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(212, 175, 55);
    pdf.text('COMBATTIMENTO', pageWidth / 2, 13, { align: 'center' });
    y = 30;

    // HP Dettagliato
    this.drawSectionHeader(pdf, 'PUNTI FERITA', margin, y, contentWidth, goldColor);
    y += 12;
    
    const hpBoxWidth = contentWidth / 4;
    const hpData = [
      { label: 'PF Attuali', value: sheet.currentHP?.toString() || '0' },
      { label: 'PF Massimi', value: sheet.maxHP?.toString() || '0' },
      { label: 'PF Temporanei', value: sheet.temporaryHP?.toString() || '0' },
      { label: 'Dadi Vita', value: `${sheet.hitDiceRemaining || 0}/${this.getTotalLevel()} ${sheet.hitDice}` }
    ];

    for (let i = 0; i < 4; i++) {
      const x = margin + i * hpBoxWidth;
      pdf.setFillColor(250, 245, 235);
      pdf.setDrawColor(...goldColor);
      pdf.roundedRect(x, y, hpBoxWidth - 3, 22, 2, 2, 'FD');
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(hpData[i].label, x + (hpBoxWidth - 3) / 2, y + 6, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkColor);
      pdf.text(hpData[i].value, x + (hpBoxWidth - 3) / 2, y + 17, { align: 'center' });
    }
    y += 30;

    // Death Saves
    this.drawSectionHeader(pdf, 'TIRI CONTRO MORTE', margin, y, contentWidth / 2 - 5, goldColor);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(...textColor);
    pdf.text(`Successi: ${sheet.deathSaves?.successes || 0}/3  ○ ○ ○`, margin, y);
    y += 6;
    pdf.text(`Fallimenti: ${sheet.deathSaves?.failures || 0}/3  ○ ○ ○`, margin, y);
    y += 12;

    // Armi
    this.drawSectionHeader(pdf, 'ARMI', margin, y, contentWidth, goldColor);
    y += 10;
    
    // Header tabella
    pdf.setFillColor(240, 235, 220);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkColor);
    pdf.text('Nome', margin + 2, y + 5);
    pdf.text('Attacco', margin + 70, y + 5);
    pdf.text('Danno', margin + 100, y + 5);
    pdf.text('Tipo', margin + 140, y + 5);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    if (sheet.weapons && sheet.weapons.length > 0) {
      for (const weapon of sheet.weapons) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y + 5, margin + contentWidth, y + 5);
        
        pdf.text(weapon.name || '', margin + 2, y + 4);
        pdf.text(`+${weapon.attackBonus || 0}`, margin + 70, y + 4);
        pdf.text(weapon.damage || '', margin + 100, y + 4);
        pdf.text(weapon.damageType || '', margin + 140, y + 4);
        y += 8;
      }
    } else {
      pdf.setTextColor(150, 150, 150);
      pdf.text('Nessuna arma registrata', margin + 2, y + 4);
      y += 8;
    }
    y += 10;

    // Armatura
    this.drawSectionHeader(pdf, 'PROTEZIONE', margin, y, contentWidth, goldColor);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(...textColor);
    pdf.text(`Armatura: ${sheet.armor || 'Nessuna'}`, margin, y);
    y += 6;
    pdf.text(`Scudo: ${sheet.shield ? 'Sì (+2 CA)' : 'No'}`, margin, y);
    y += 6;
    pdf.text(`Classe Armatura Totale: ${sheet.armorClass}`, margin, y);
    y += 15;

    // Tratti Razziali
    if (sheet.traits && sheet.traits.length > 0) {
      this.drawSectionHeader(pdf, 'TRATTI RAZZIALI', margin, y, contentWidth, goldColor);
      y += 10;
      
      pdf.setFontSize(9);
      for (const trait of sheet.traits) {
        const lines = pdf.splitTextToSize(`• ${trait}`, contentWidth);
        pdf.text(lines, margin, y);
        y += lines.length * 5;
      }
      y += 5;
    }

    // Privilegi di Classe
    if (sheet.features && sheet.features.length > 0) {
      this.drawSectionHeader(pdf, 'PRIVILEGI DI CLASSE', margin, y, contentWidth, goldColor);
      y += 10;
      
      pdf.setFontSize(9);
      for (const feature of sheet.features) {
        const lines = pdf.splitTextToSize(`• ${feature}`, contentWidth);
        pdf.text(lines, margin, y);
        y += lines.length * 5;
        
        if (y > 270) {
          // Evita overflow
          pdf.text('...e altri', margin, y);
          break;
        }
      }
    }

    this.drawFooter(pdf, pageWidth, 2);
  }

  private async generatePage3(
    pdf: jsPDF, 
    sheet: Sheet, 
    margin: number, 
    contentWidth: number,
    pageWidth: number,
    goldColor: [number, number, number],
    darkColor: [number, number, number],
    textColor: [number, number, number]
  ) {
    let y = margin;

    // Header pagina
    pdf.setFillColor(100, 50, 150);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text('INCANTESIMI', pageWidth / 2, 13, { align: 'center' });
    y = 30;

    // Statistiche Incantesimi
    this.drawSectionHeader(pdf, 'STATISTICHE INCANTATORE', margin, y, contentWidth, [100, 50, 150]);
    y += 12;

    const spellStatWidth = contentWidth / 4;
    const spellStats = [
      { label: 'Classe', value: sheet.class || 'N/A' },
      { label: 'Caratteristica', value: sheet.spellcastingAbility || 'N/A' },
      { label: 'CD Incantesimi', value: sheet.spellSaveDC?.toString() || '8' },
      { label: 'Mod. Attacco', value: this.formatModifier(sheet.spellAttackBonus || 0) }
    ];

    for (let i = 0; i < 4; i++) {
      const x = margin + i * spellStatWidth;
      pdf.setFillColor(240, 235, 250);
      pdf.setDrawColor(100, 50, 150);
      pdf.roundedRect(x, y, spellStatWidth - 3, 18, 2, 2, 'FD');
      
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(spellStats[i].label, x + (spellStatWidth - 3) / 2, y + 5, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 50, 150);
      pdf.text(spellStats[i].value, x + (spellStatWidth - 3) / 2, y + 14, { align: 'center' });
    }
    y += 25;

    // Slot Incantesimi
    if (sheet.spellSlots) {
      this.drawSectionHeader(pdf, 'SLOT INCANTESIMI', margin, y, contentWidth, [100, 50, 150]);
      y += 10;

      const slotWidth = contentWidth / 9;
      pdf.setFontSize(8);
      
      for (let lvl = 1; lvl <= 9; lvl++) {
        const slots = sheet.spellSlots[lvl as keyof typeof sheet.spellSlots];
        if (slots && slots.max > 0) {
          const x = margin + (lvl - 1) * slotWidth;
          
          pdf.setFillColor(240, 235, 250);
          pdf.setDrawColor(100, 50, 150);
          pdf.roundedRect(x, y, slotWidth - 2, 15, 1, 1, 'FD');
          
          pdf.setTextColor(100, 50, 150);
          pdf.text(`Lv${lvl}`, x + (slotWidth - 2) / 2, y + 5, { align: 'center' });
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${slots.current}/${slots.max}`, x + (slotWidth - 2) / 2, y + 12, { align: 'center' });
        }
      }
      y += 22;
    }

    // Lista Incantesimi per Livello
    this.drawSectionHeader(pdf, 'LISTA INCANTESIMI', margin, y, contentWidth, [100, 50, 150]);
    y += 10;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...textColor);

    // Raggruppa per livello
    const spellsByLevel: { [key: number]: Spell[] } = {};
    for (const spell of (sheet.spells || [])) {
      const lvl = spell.level || 0;
      if (!spellsByLevel[lvl]) spellsByLevel[lvl] = [];
      spellsByLevel[lvl].push(spell);
    }

    // Cantrips
    if (spellsByLevel[0]) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Trucchetti:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const cantripNames = spellsByLevel[0].map(s => s.name).join(', ');
      const cantripLines = pdf.splitTextToSize(cantripNames, contentWidth);
      pdf.text(cantripLines, margin, y);
      y += cantripLines.length * 4 + 3;
    }

    // Livelli 1-9
    for (let lvl = 1; lvl <= 9; lvl++) {
      if (spellsByLevel[lvl] && y < 260) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Livello ${lvl}:`, margin, y);
        y += 5;
        pdf.setFont('helvetica', 'normal');
        
        for (const spell of spellsByLevel[lvl]) {
          if (y > 270) break;
          const prepMark = spell.prepared ? '●' : '○';
          const spellText = `${prepMark} ${spell.name}${spell.ritual ? ' (R)' : ''}${spell.concentration ? ' (C)' : ''}`;
          pdf.text(spellText, margin + 3, y);
          y += 5;
        }
        y += 3;
      }
    }

    this.drawFooter(pdf, pageWidth, 3);
  }

  private async generatePage4(
    pdf: jsPDF, 
    sheet: Sheet, 
    margin: number, 
    contentWidth: number,
    pageWidth: number,
    goldColor: [number, number, number],
    darkColor: [number, number, number],
    textColor: [number, number, number]
  ) {
    let y = margin;

    // Header pagina
    pdf.setFillColor(...darkColor);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(212, 175, 55);
    pdf.text('INVENTARIO & BIOGRAFIA', pageWidth / 2, 13, { align: 'center' });
    y = 30;

    // Valuta
    this.drawSectionHeader(pdf, 'VALUTA', margin, y, contentWidth / 2, goldColor);
    y += 10;
    
    const currency = sheet.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    pdf.setFontSize(10);
    pdf.setTextColor(...textColor);
    pdf.text(`MR: ${currency.cp}  MA: ${currency.sp}  ME: ${currency.ep}  MO: ${currency.gp}  MP: ${currency.pp}`, margin, y);
    y += 10;

    // Capacità di carico
    const currentWeight = this.calculateTotalWeight();
    const maxCapacity = sheet.strength * 15;
    pdf.text(`Peso trasportato: ${currentWeight.toFixed(1)} / ${maxCapacity} lb`, margin, y);
    y += 12;

    // Inventario
    this.drawSectionHeader(pdf, 'OGGETTI', margin, y, contentWidth, goldColor);
    y += 10;

    pdf.setFontSize(8);
    const inventory = sheet.inventory || [];
    if (inventory.length > 0) {
      // Header tabella
      pdf.setFillColor(240, 235, 220);
      pdf.rect(margin, y, contentWidth, 6, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nome', margin + 2, y + 4);
      pdf.text('Qty', margin + 80, y + 4);
      pdf.text('Peso', margin + 100, y + 4);
      pdf.text('Tipo', margin + 125, y + 4);
      y += 8;
      
      pdf.setFont('helvetica', 'normal');
      for (const item of inventory) {
        if (y > 150) {
          pdf.text('...altri oggetti', margin + 2, y + 3);
          break;
        }
        
        const equipMark = item.equipped ? '◆' : '';
        const attuneMark = item.attuned ? '✦' : '';
        
        pdf.text(`${equipMark}${attuneMark} ${item.name}`, margin + 2, y + 3);
        pdf.text(`${item.quantity || 1}`, margin + 80, y + 3);
        pdf.text(`${item.weight || 0}`, margin + 100, y + 3);
        pdf.text(item.type || '', margin + 125, y + 3);
        y += 6;
      }
    } else if (sheet.equipment && sheet.equipment.length > 0) {
      // Fallback: mostra l'equipment semplice
      pdf.setFont('helvetica', 'normal');
      const equipText = sheet.equipment.join(', ');
      const lines = pdf.splitTextToSize(equipText, contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * 4;
    } else {
      pdf.text('Nessun oggetto registrato', margin, y);
    }
    y += 10;

    // Biografia
    y = Math.max(y, 160);
    this.drawSectionHeader(pdf, 'BIOGRAFIA', margin, y, contentWidth, goldColor);
    y += 10;

    pdf.setFontSize(9);
    pdf.setTextColor(...textColor);

    // Aspetto
    if (sheet.age || sheet.height || sheet.weight || sheet.eyes || sheet.hair || sheet.skin) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Aspetto:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const appearance = [
        sheet.age ? `Età: ${sheet.age}` : '',
        sheet.height ? `Altezza: ${sheet.height}` : '',
        sheet.weight ? `Peso: ${sheet.weight}` : '',
        sheet.eyes ? `Occhi: ${sheet.eyes}` : '',
        sheet.hair ? `Capelli: ${sheet.hair}` : '',
        sheet.skin ? `Pelle: ${sheet.skin}` : ''
      ].filter(x => x).join(' • ');
      const appLines = pdf.splitTextToSize(appearance, contentWidth);
      pdf.text(appLines, margin, y);
      y += appLines.length * 4 + 5;
    }

    // Tratti personalità
    if (sheet.personalityTraits) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tratti di Personalità:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(sheet.personalityTraits, contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * 4 + 3;
    }

    if (sheet.ideals) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ideali:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(sheet.ideals, contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * 4 + 3;
    }

    if (sheet.bonds) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Legami:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(sheet.bonds, contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * 4 + 3;
    }

    if (sheet.flaws) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Difetti:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(sheet.flaws, contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * 4 + 3;
    }

    // Background Story (se c'è spazio)
    if (sheet.backstory && y < 250) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Storia:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      const maxChars = 500;
      const storyText = sheet.backstory.length > maxChars 
        ? sheet.backstory.substring(0, maxChars) + '...' 
        : sheet.backstory;
      const lines = pdf.splitTextToSize(storyText, contentWidth);
      pdf.text(lines, margin, y);
    }

    this.drawFooter(pdf, pageWidth, 4);
  }

  private drawSectionHeader(
    pdf: jsPDF, 
    title: string, 
    x: number, 
    y: number, 
    width: number, 
    color: [number, number, number]
  ) {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.5);
    pdf.line(x, y + 4, x + width, y + 4);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...color);
    pdf.text(title, x, y + 2);
  }

  private drawFooter(pdf: jsPDF, pageWidth: number, pageNum: number) {
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Phendelver App - ${new Date().toLocaleDateString('it-IT')}`, 15, pageHeight - 8);
    pdf.text(`Pagina ${pageNum}`, pageWidth - 25, pageHeight - 8);
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  private calculateTotalWeight(): number {
    const sheet = this.sheet();
    if (!sheet?.inventory) return 0;
    return sheet.inventory.reduce((total, item) => {
      return total + (item.weight || 0) * (item.quantity || 1);
    }, 0);
  }
  
  private generateAbilityHTML(name: string, score: number, modifier: number): string {
    return `
      <div style="border: 2px solid #8B4513; padding: 8px; margin-bottom: 8px; text-align: center;">
        <div style="font-size: 10px; font-weight: bold;">${name}</div>
        <div style="font-size: 20px; font-weight: bold; color: #8B4513;">${this.formatModifier(modifier)}</div>
        <div style="font-size: 12px; margin-top: 4px;">(${score})</div>
      </div>
    `;
  }

  // === SPELL HELPERS ===
  
  /** Verifica se ci sono incantesimi di un certo livello */
  hasSpellsOfLevel(level: number): boolean {
    const sheet = this.sheet();
    if (!sheet?.spells) return false;
    return sheet.spells.some(sp => sp.level === level);
  }

  /** Ottiene gli incantesimi di un certo livello */
  getSpellsByLevel(level: number): Spell[] {
    const sheet = this.sheet();
    if (!sheet?.spells) return [];
    return sheet.spells.filter(sp => sp.level === level);
  }

  /** Rimuove un incantesimo per nome */
  removeSpellByName(name: string) {
    const sheet = this.sheet();
    if (!sheet?.spells) return;
    
    const index = sheet.spells.findIndex(sp => sp.name === name);
    if (index > -1) {
      sheet.spells.splice(index, 1);
      this.sheet.set({ ...sheet });
    }
  }

  // === PROFICIENCY STRING HELPERS ===
  
  getLanguagesString(): string {
    return this.sheet()?.languages?.join(', ') || '';
  }
  
  setLanguages(value: string) {
    const sheet = this.sheet();
    if (!sheet) return;
    sheet.languages = value.split(',').map(l => l.trim()).filter(l => l);
    this.sheet.set({ ...sheet });
  }
  
  getArmorProfString(): string {
    return this.sheet()?.armorProficiencies?.join(', ') || '';
  }
  
  setArmorProficiencies(value: string) {
    const sheet = this.sheet();
    if (!sheet) return;
    sheet.armorProficiencies = value.split(',').map(l => l.trim()).filter(l => l);
    this.sheet.set({ ...sheet });
  }
  
  getWeaponProfString(): string {
    return this.sheet()?.weaponProficiencies?.join(', ') || '';
  }
  
  setWeaponProficiencies(value: string) {
    const sheet = this.sheet();
    if (!sheet) return;
    sheet.weaponProficiencies = value.split(',').map(l => l.trim()).filter(l => l);
    this.sheet.set({ ...sheet });
  }
  
  getToolProfString(): string {
    return this.sheet()?.toolProficiencies?.join(', ') || '';
  }
  
  setToolProficiencies(value: string) {
    const sheet = this.sheet();
    if (!sheet) return;
    sheet.toolProficiencies = value.split(',').map(l => l.trim()).filter(l => l);
    this.sheet.set({ ...sheet });
  }

  // === MULTICLASS HELPERS ===
  
  /** Calcola il livello totale del personaggio (somma di tutte le classi) */
  getTotalLevel(): number {
    const sheet = this.sheet();
    if (!sheet?.classes || sheet.classes.length === 0) {
      return sheet?.level || 1;
    }
    return sheet.classes.reduce((total, c) => total + c.level, 0);
  }

  /** Calcola il proficiency bonus basato sul livello totale */
  calculateProficiencyBonus(): number {
    const level = this.getTotalLevel();
    return Math.floor((level - 1) / 4) + 2;
  }

  /** Stringa formattata delle classi (es. "Warlock 5 / Sorcerer 2") */
  getClassString(): string {
    const sheet = this.sheet();
    if (!sheet?.classes || sheet.classes.length === 0) {
      return sheet?.class || '';
    }
    return sheet.classes.map(c => {
      let str = `${c.name} ${c.level}`;
      if (c.subclass) str = `${c.name} (${c.subclass}) ${c.level}`;
      return str;
    }).join(' / ');
  }

  /** Aggiunge una nuova classe (per multiclasse) */
  addClass() {
    const sheet = this.sheet();
    if (!sheet) return;

    if (!sheet.classes) {
      sheet.classes = [];
    }

    sheet.classes.push({
      name: 'New Class',
      level: 1,
      hitDie: 8
    });
    
    // Aggiorna livello totale
    sheet.level = this.getTotalLevel();
    sheet.proficiencyBonus = this.calculateProficiencyBonus();
    
    this.sheet.set({ ...sheet });
  }

  /** Rimuove una classe */
  removeClass(index: number) {
    const sheet = this.sheet();
    if (!sheet?.classes) return;

    sheet.classes.splice(index, 1);
    sheet.level = sheet.classes.length > 0 ? this.getTotalLevel() : 1;
    sheet.proficiencyBonus = this.calculateProficiencyBonus();
    
    this.sheet.set({ ...sheet });
  }

  // === DEATH SAVES ===

  /** Aggiunge un successo ai death saves */
  addDeathSaveSuccess() {
    const sheet = this.sheet();
    if (!sheet) return;

    if (!sheet.deathSaves) {
      sheet.deathSaves = { successes: 0, failures: 0 };
    }

    if (sheet.deathSaves.successes < 3) {
      sheet.deathSaves.successes++;
      
      // 3 successi = stabilizzato
      if (sheet.deathSaves.successes >= 3) {
        this.resetDeathSaves();
        sheet.currentHP = 1;
        alert('Personaggio stabilizzato! 🎉');
      }
      
      this.sheet.set({ ...sheet });
    }
  }

  /** Aggiunge un fallimento ai death saves */
  addDeathSaveFailure() {
    const sheet = this.sheet();
    if (!sheet) return;

    if (!sheet.deathSaves) {
      sheet.deathSaves = { successes: 0, failures: 0 };
    }

    if (sheet.deathSaves.failures < 3) {
      sheet.deathSaves.failures++;
      
      // 3 fallimenti = morte
      if (sheet.deathSaves.failures >= 3) {
        alert('Il personaggio è morto! 💀');
      }
      
      this.sheet.set({ ...sheet });
    }
  }

  /** Reset death saves */
  resetDeathSaves() {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.deathSaves = { successes: 0, failures: 0 };
    this.sheet.set({ ...sheet });
  }

  // === HIT DICE ===

  /** Usa un dado vita durante short rest */
  useHitDie() {
    const sheet = this.sheet();
    if (!sheet) return;

    if (!sheet.hitDiceRemaining || sheet.hitDiceRemaining <= 0) {
      alert('Non hai dadi vita disponibili!');
      return;
    }

    // Determina il tipo di dado vita dalla prima classe
    let hitDie = 8;
    if (sheet.classes && sheet.classes.length > 0) {
      hitDie = sheet.classes[0].hitDie;
    }

    // Tira il dado + CON modifier
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const healing = Math.max(1, roll + this.conModifier());
    
    sheet.hitDiceRemaining--;
    sheet.currentHP = Math.min(sheet.currentHP + healing, sheet.maxHP);
    
    this.sheet.set({ ...sheet });
    alert(`Hai tirato ${roll} + ${this.conModifier()} CON = ${healing} HP recuperati!`);
  }

  /** Short rest - permette di usare dadi vita */
  async shortRest() {
    const sheet = this.sheet();
    if (!sheet) return;

    // Ripristina risorse short rest (come Action Surge, Second Wind, ecc.)
    // L'utente può usare hit dice manualmente
    
    await this.db.saveCharacterSheet(sheet);
    alert('Short Rest completato! Puoi usare i dadi vita per recuperare HP.');
  }

  // === INVENTORY & CURRENCY ===

  /** Aggiunge un oggetto all'inventario */
  addInventoryItem() {
    const sheet = this.sheet();
    if (!sheet) return;

    if (!sheet.inventory) {
      sheet.inventory = [];
    }

    sheet.inventory.push({
      name: 'New Item',
      quantity: 1,
      weight: 0,
      description: '',
      equipped: false
    });
    
    this.sheet.set({ ...sheet });
  }

  /** Rimuove un oggetto dall'inventario */
  removeInventoryItem(index: number) {
    const sheet = this.sheet();
    if (!sheet?.inventory) return;

    sheet.inventory.splice(index, 1);
    this.sheet.set({ ...sheet });
  }

  /** Calcola il peso totale dell'inventario */
  getTotalWeight(): number {
    const sheet = this.sheet();
    if (!sheet?.inventory) return 0;

    return sheet.inventory.reduce((total, item) => {
      return total + (item.weight || 0) * item.quantity;
    }, 0);
  }

  /** Calcola la capacità di carico (STR x 15) */
  getCarryingCapacity(): number {
    const sheet = this.sheet();
    if (!sheet) return 0;
    return sheet.strength * 15;
  }

  /** Converte valuta (tutto in pezzi d'oro) */
  getTotalGold(): number {
    const sheet = this.sheet();
    if (!sheet?.currency) return 0;

    const { cp = 0, sp = 0, ep = 0, gp = 0, pp = 0 } = sheet.currency;
    return (cp / 100) + (sp / 10) + (ep / 2) + gp + (pp * 10);
  }

  // === EXPERIENCE & LEVELING ===

  /** Esperienza necessaria per il prossimo livello */
  getXPForNextLevel(): number {
    const xpTable: { [key: number]: number } = {
      1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
      6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
      11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
      16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
    };
    
    const level = this.getTotalLevel();
    const nextLevel = Math.min(level + 1, 20);
    return xpTable[nextLevel] || 355000;
  }

  /** Percentuale di progresso verso il prossimo livello */
  getXPProgress(): number {
    const sheet = this.sheet();
    if (!sheet) return 0;

    const level = this.getTotalLevel();
    if (level >= 20) return 100;

    const xpTable: { [key: number]: number } = {
      1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
      6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
      11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
      16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
    };

    const currentLevelXP = xpTable[level] || 0;
    const nextLevelXP = xpTable[level + 1] || 355000;
    const currentXP = sheet.experience || 0;

    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  /** Aggiunge esperienza */
  addExperience(amount: number) {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.experience = (sheet.experience || 0) + amount;
    
    // Controlla se può salire di livello
    const xpForNext = this.getXPForNextLevel();
    if (sheet.experience >= xpForNext && this.getTotalLevel() < 20) {
      alert(`Hai abbastanza XP per salire di livello! (${sheet.experience}/${xpForNext})`);
    }
    
    this.sheet.set({ ...sheet });
  }

  // === SPELL SLOTS (Pact Magic) ===

  /** Usa uno spell slot pact magic */
  usePactSlot() {
    const sheet = this.sheet();
    if (!sheet?.pactMagic) return;

    if (sheet.pactMagic.slotsCurrent > 0) {
      sheet.pactMagic.slotsCurrent--;
      this.sheet.set({ ...sheet });
    } else {
      alert('Non hai slot pact magic disponibili!');
    }
  }

  /** Ripristina spell slot pact magic (short rest) */
  restorePactSlots() {
    const sheet = this.sheet();
    if (!sheet?.pactMagic) return;

    sheet.pactMagic.slotsCurrent = sheet.pactMagic.slotsMax;
    this.sheet.set({ ...sheet });
  }

  /** Usa uno spell slot normale */
  useSpellSlot(level: number) {
    const sheet = this.sheet();
    if (!sheet?.spellSlots?.[level]) return;

    if (sheet.spellSlots[level].current > 0) {
      sheet.spellSlots[level].current--;
      this.sheet.set({ ...sheet });
    } else {
      alert(`Non hai slot di livello ${level} disponibili!`);
    }
  }

  // === SAVING THROWS ===

  /** Verifica se il personaggio è competente in un saving throw */
  hasSavingThrowProficiency(ability: string): boolean {
    const sheet = this.sheet();
    if (!sheet?.savingThrows) return false;
    return sheet.savingThrows.includes(ability);
  }

  /** Calcola bonus saving throw */
  getSavingThrowBonus(ability: string): number {
    let mod = 0;
    switch (ability) {
      case 'Strength': mod = this.strModifier(); break;
      case 'Dexterity': mod = this.dexModifier(); break;
      case 'Constitution': mod = this.conModifier(); break;
      case 'Intelligence': mod = this.intModifier(); break;
      case 'Wisdom': mod = this.wisModifier(); break;
      case 'Charisma': mod = this.chaModifier(); break;
    }
    
    if (this.hasSavingThrowProficiency(ability)) {
      mod += this.sheet()?.proficiencyBonus || 0;
    }
    
    return mod;
  }

  /** Toggle saving throw proficiency */
  toggleSavingThrow(ability: string) {
    if (!this.editMode()) return;
    
    const sheet = this.sheet();
    if (!sheet) return;

    if (!sheet.savingThrows) {
      sheet.savingThrows = [];
    }

    const index = sheet.savingThrows.indexOf(ability);
    if (index > -1) {
      sheet.savingThrows.splice(index, 1);
    } else {
      sheet.savingThrows.push(ability);
    }
    
    this.sheet.set({ ...sheet });
  }

  // === INSPIRATION ===

  /** Toggle inspirazione */
  toggleInspiration() {
    const sheet = this.sheet();
    if (!sheet) return;

    sheet.inspiration = !sheet.inspiration;
    this.sheet.set({ ...sheet });
  }

  /** Usa inspirazione (reroll) */
  useInspiration() {
    const sheet = this.sheet();
    if (!sheet?.inspiration) {
      alert('Non hai ispirazione!');
      return;
    }

    sheet.inspiration = false;
    this.sheet.set({ ...sheet });
    alert('Ispirazione usata! Puoi ritirare un d20.');
  }


}
