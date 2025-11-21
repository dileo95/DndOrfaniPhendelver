import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, CharacterSheet as Sheet, Weapon, Spell } from '../../services/database.service';
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
    let defaultSheet: Partial<Sheet> = {
      character: characterName,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      race: '',
      class: '',
      level: 1,
      background: '',
      alignment: 'Neutral',
      armorClass: 10,
      initiative: 0,
      speed: 30,
      currentHP: 10,
      maxHP: 10,
      temporaryHP: 0,
      hitDice: '1d8',
      proficiencyBonus: 2,
      savingThrows: [],
      skills: {},
      weapons: [],
      armor: 'None',
      equipment: [],
      spells: [],
      features: [],
      traits: []
    };

    // Schede predefinite per ogni personaggio
    if (characterName === 'asriel') {
      defaultSheet = {
        ...defaultSheet,
        race: 'Human',
        class: 'Warlock',
        level: 5,
        background: 'Haunted One',
        alignment: 'Chaotic Good',
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
        proficiencyBonus: 3,
        savingThrows: ['Wisdom', 'Charisma'],
        weapons: [
          { name: 'Eldritch Blast', damage: '1d10+4', damageType: 'Force', attackBonus: 7, properties: 'Cantrip, Range 120ft' },
          { name: 'Pact Blade', damage: '1d8+4', damageType: 'Slashing', attackBonus: 7, properties: 'Pact Weapon' }
        ],
        armor: 'Leather Armor',
        spellcastingAbility: 'Charisma',
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: [
          { name: 'Eldritch Blast', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 ft', components: 'V, S', duration: 'Instantaneous', description: 'A beam of crackling energy' },
          { name: 'Hex', level: 1, school: 'Enchantment', castingTime: '1 bonus action', range: '90 ft', components: 'V, S, M', duration: 'Concentration, up to 1 hour', description: 'You place a curse on a creature' },
          { name: 'Armor of Agathys', level: 1, school: 'Abjuration', castingTime: '1 action', range: 'Self', components: 'V, S, M', duration: '1 hour', description: 'Protective magical force surrounds you' },
          { name: 'Misty Step', level: 2, school: 'Conjuration', castingTime: '1 bonus action', range: 'Self', components: 'V', duration: 'Instantaneous', description: 'Teleport up to 30 feet' }
        ],
        spellSlots: {
          1: { max: 2, current: 2 },
          2: { max: 2, current: 2 },
          3: { max: 0, current: 0 }
        },
        features: ['Pact of the Blade', 'Eldritch Invocations: Agonizing Blast, Thirsting Blade'],
        traits: ['Haunted by experiments', 'Pact with Grazzt']
      };
    } else if (characterName === 'auryn') {
      defaultSheet = {
        ...defaultSheet,
        race: 'Half-Elf',
        class: 'Rogue',
        level: 5,
        background: 'Criminal',
        alignment: 'Chaotic Neutral',
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
        proficiencyBonus: 3,
        savingThrows: ['Dexterity', 'Intelligence'],
        weapons: [
          { name: 'Rapier', damage: '1d8+4', damageType: 'Piercing', attackBonus: 7, properties: 'Finesse' },
          { name: 'Shortbow', damage: '1d6+4', damageType: 'Piercing', attackBonus: 7, properties: 'Range 80/320' }
        ],
        armor: 'Studded Leather',
        features: ['Sneak Attack (3d6)', 'Cunning Action', 'Uncanny Dodge', 'Expertise'],
        traits: ['Darkvision', 'Fey Ancestry']
      };
    } else if (characterName === 'ravel') {
      defaultSheet = {
        ...defaultSheet,
        race: 'Tiefling',
        class: 'Paladin',
        level: 5,
        background: 'Soldier',
        alignment: 'Lawful Good',
        strength: 18,
        dexterity: 10,
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 14,
        armorClass: 18,
        initiative: 0,
        speed: 30,
        maxHP: 47,
        currentHP: 47,
        hitDice: '5d10',
        proficiencyBonus: 3,
        savingThrows: ['Wisdom', 'Charisma'],
        weapons: [
          { name: 'Longsword', damage: '1d8+4', damageType: 'Slashing', attackBonus: 7, properties: 'Versatile (1d10)' },
          { name: 'Javelin', damage: '1d6+4', damageType: 'Piercing', attackBonus: 7, properties: 'Range 30/120' }
        ],
        armor: 'Plate Armor + Shield',
        spellcastingAbility: 'Charisma',
        spellSaveDC: 13,
        spellAttackBonus: 5,
        spells: [
          { name: 'Divine Smite', level: 1, school: 'Evocation', castingTime: 'When you hit', range: 'Self', components: 'V', duration: 'Instantaneous', description: 'Deal extra 2d8 radiant damage' },
          { name: 'Cure Wounds', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous', description: 'Heal 1d8 + CHA modifier' }
        ],
        spellSlots: {
          1: { max: 4, current: 4 },
          2: { max: 2, current: 2 }
        },
        features: ['Divine Sense', 'Lay on Hands', 'Fighting Style: Defense', 'Divine Smite', 'Extra Attack'],
        traits: ['Resistance to Fire', 'Darkvision', 'Infernal Legacy']
      };
    } else if (characterName === 'ruben') {
      defaultSheet = {
        ...defaultSheet,
        race: 'Dwarf',
        class: 'Fighter',
        level: 5,
        background: 'Folk Hero',
        alignment: 'Neutral Good',
        strength: 16,
        dexterity: 14,
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 10,
        armorClass: 17,
        initiative: 2,
        speed: 25,
        maxHP: 49,
        currentHP: 49,
        hitDice: '5d10',
        proficiencyBonus: 3,
        savingThrows: ['Strength', 'Constitution'],
        weapons: [
          { name: 'Battleaxe', damage: '1d8+3', damageType: 'Slashing', attackBonus: 6, properties: 'Versatile (1d10)' },
          { name: 'Handaxe', damage: '1d6+3', damageType: 'Slashing', attackBonus: 6, properties: 'Light, Thrown (20/60)' }
        ],
        armor: 'Chain Mail + Shield',
        features: ['Second Wind', 'Action Surge', 'Extra Attack', 'Fighting Style: Dueling'],
        traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning']
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

    sheet.currentHP = sheet.maxHP;
    sheet.temporaryHP = 0;
    
    // Restore spell slots
    if (sheet.spellSlots) {
      for (const level in sheet.spellSlots) {
        sheet.spellSlots[level].current = sheet.spellSlots[level].max;
      }
    }

    this.sheet.set({ ...sheet });
    await this.db.saveCharacterSheet(sheet);
    alert('Long Rest completato! HP e spell slots ripristinati.');
  }

  goBack() {
    this.router.navigate([this.character(), 'home']);
  }

  async exportToPDF() {
    const sheet = this.sheet();
    if (!sheet) return;

    // Creo HTML invisibile con layout D&D
    const printDiv = document.createElement('div');
    printDiv.style.position = 'absolute';
    printDiv.style.left = '-9999px';
    printDiv.style.width = '794px'; // A4 width in px at 96dpi
    printDiv.style.height = '1123px'; // A4 height
    printDiv.style.backgroundColor = 'white';
    printDiv.style.padding = '40px';
    printDiv.style.fontFamily = 'Arial, sans-serif';
    
    printDiv.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #8B4513; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 32px; color: #8B4513;">${sheet.character.toUpperCase()}</h1>
        <p style="margin: 5px 0; font-size: 16px; color: #555;">${sheet.race} ${sheet.class} - Livello ${sheet.level}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 20px;">
        <!-- Colonna Sinistra: Caratteristiche -->
        <div>
          <h3 style="border-bottom: 2px solid #8B4513; margin-bottom: 10px;">CARATTERISTICHE</h3>
          ${this.generateAbilityHTML('FORZA', sheet.strength, this.strModifier())}
          ${this.generateAbilityHTML('DESTREZZA', sheet.dexterity, this.dexModifier())}
          ${this.generateAbilityHTML('COSTITUZIONE', sheet.constitution, this.conModifier())}
          ${this.generateAbilityHTML('INTELLIGENZA', sheet.intelligence, this.intModifier())}
          ${this.generateAbilityHTML('SAGGEZZA', sheet.wisdom, this.wisModifier())}
          ${this.generateAbilityHTML('CARISMA', sheet.charisma, this.chaModifier())}
        </div>
        
        <!-- Colonna Centrale -->
        <div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="border: 2px solid #8B4513; padding: 10px; text-align: center;">
              <div style="font-size: 11px;">CLASSE ARMATURA</div>
              <div style="font-size: 24px; font-weight: bold;">${sheet.armorClass}</div>
            </div>
            <div style="border: 2px solid #8B4513; padding: 10px; text-align: center;">
              <div style="font-size: 11px;">INIZIATIVA</div>
              <div style="font-size: 24px; font-weight: bold;">${this.formatModifier(sheet.initiative)}</div>
            </div>
            <div style="border: 2px solid #8B4513; padding: 10px; text-align: center;">
              <div style="font-size: 11px;">VELOCITÀ</div>
              <div style="font-size: 24px; font-weight: bold;">${sheet.speed}</div>
            </div>
          </div>
          
          <div style="border: 2px solid #8B4513; padding: 15px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 11px;">PUNTI FERITA MASSIMI</div>
              <div style="font-size: 18px; font-weight: bold;">${sheet.maxHP}</div>
            </div>
            <div style="text-align: center; border: 3px solid #8B4513; padding: 20px; margin-bottom: 10px;">
              <div style="font-size: 36px; font-weight: bold; color: #8B4513;">${sheet.currentHP}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 10px;">PF TEMPORANEI</div>
              <div style="font-size: 14px;">${sheet.temporaryHP}</div>
            </div>
          </div>
          
          <h4 style="border-bottom: 1px solid #8B4513;">ARMI</h4>
          ${sheet.weapons?.map(w => `
            <div style="font-size: 11px; margin-bottom: 5px;">
              <strong>${w.name}</strong> - +${w.attackBonus} colpire, ${w.damage}
            </div>
          `).join('') || ''}
        </div>
        
        <!-- Colonna Destra: Skills -->
        <div>
          <h3 style="border-bottom: 2px solid #8B4513; margin-bottom: 10px;">ABILITÀ</h3>
          <div style="font-size: 10px;">
            ${this.allSkills.map(skill => `
              <div style="margin-bottom: 3px;">
                <span style="font-weight: bold;">${this.formatModifier(this.getSkillBonus(skill.name))}</span> 
                ${skill.name} (${skill.ability})
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <h4 style="border-bottom: 1px solid #8B4513;">TRATTI & CARATTERISTICHE</h4>
        <div style="font-size: 11px;">
          ${sheet.features?.map(f => `• ${f}`).join('<br>') || ''}
        </div>
      </div>
      
      <div style="position: absolute; bottom: 10px; right: 10px; font-size: 9px; color: #999;">
        Phendelver App - Generated ${new Date().toLocaleDateString()}
      </div>
    `;
    
    document.body.appendChild(printDiv);

    try {
      const canvas = await html2canvas(printDiv, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${sheet.character}_CharacterSheet.pdf`);
      
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      alert('Errore durante la generazione del PDF');
    } finally {
      document.body.removeChild(printDiv);
    }
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


}
