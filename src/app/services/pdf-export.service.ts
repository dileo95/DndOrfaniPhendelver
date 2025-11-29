import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import { CharacterSheet, Spell, Weapon } from './database.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private toast = inject(ToastService);

  // Colori tema D&D
  private colors = {
    gold: '#d4af37',
    darkBrown: '#2c1810',
    parchment: '#f4e4bc',
    red: '#8b0000',
    black: '#1a1a1a'
  };

  /** Esporta la scheda personaggio in PDF */
  async exportCharacterSheet(sheet: CharacterSheet): Promise<void> {
    try {
      this.toast.info('📄 Generazione PDF in corso...');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Pagina 1: Info principali e statistiche
      this.drawPage1(pdf, sheet);

      // Pagina 2: Incantesimi e equipaggiamento
      pdf.addPage();
      this.drawPage2(pdf, sheet);

      // Pagina 3: Background e note
      pdf.addPage();
      this.drawPage3(pdf, sheet);

      // Salva il PDF
      const fileName = `${sheet.characterName || sheet.character}_scheda.pdf`;
      pdf.save(fileName);

      this.toast.success(`✅ PDF "${fileName}" scaricato!`);
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      this.toast.error('❌ Errore durante la generazione del PDF');
    }
  }

  // ========== PAGINA 1: INFO E STATISTICHE ==========
  private drawPage1(pdf: jsPDF, sheet: CharacterSheet) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header con titolo
    this.drawHeader(pdf, sheet);

    let y = 45;

    // Info base
    this.drawSection(pdf, 'Informazioni Base', 10, y, pageWidth - 20, 40);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    
    const infoLines = [
      `Razza: ${sheet.race}${sheet.subrace ? ` (${sheet.subrace})` : ''}`,
      `Classe: ${this.formatClasses(sheet)}`,
      `Background: ${sheet.background || 'N/A'}`,
      `Allineamento: ${sheet.alignment || 'N/A'}`,
      `Livello: ${sheet.level} | XP: ${sheet.experience || 0}`,
      `Giocatore: ${sheet.playerName || 'N/A'}`
    ];

    infoLines.forEach((line, i) => {
      pdf.text(line, 15, y + 6 + (i * 5));
    });

    y += 45;

    // Statistiche
    this.drawSection(pdf, 'Caratteristiche', 10, y, pageWidth - 20, 35);
    y += 8;

    const stats = [
      { name: 'FOR', value: sheet.strength },
      { name: 'DES', value: sheet.dexterity },
      { name: 'COS', value: sheet.constitution },
      { name: 'INT', value: sheet.intelligence },
      { name: 'SAG', value: sheet.wisdom },
      { name: 'CAR', value: sheet.charisma }
    ];

    const statWidth = (pageWidth - 40) / 6;
    stats.forEach((stat, i) => {
      const x = 15 + (i * statWidth);
      this.drawStatBox(pdf, stat.name, stat.value, x, y + 5, statWidth - 5);
    });

    y += 40;

    // Combattimento
    this.drawSection(pdf, 'Combattimento', 10, y, pageWidth - 20, 45);
    y += 8;

    const combatInfo = [
      ['Classe Armatura', sheet.armorClass.toString()],
      ['Iniziativa', `+${sheet.initiative}`],
      ['Velocità', `${sheet.speed} ft`],
      ['PF Attuali', `${sheet.currentHP}/${sheet.maxHP}`],
      ['PF Temporanei', sheet.temporaryHP?.toString() || '0'],
      ['Dadi Vita', sheet.hitDice],
      ['Bonus Competenza', `+${sheet.proficiencyBonus}`]
    ];

    combatInfo.forEach((info, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 15 + (col * 60);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(info[0], x, y + 6 + (row * 12));
      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      pdf.text(info[1], x, y + 11 + (row * 12));
    });

    y += 50;

    // Armi
    if (sheet.weapons && sheet.weapons.length > 0) {
      this.drawSection(pdf, 'Armi', 10, y, pageWidth - 20, 10 + sheet.weapons.length * 8);
      y += 8;

      sheet.weapons.forEach((weapon, i) => {
        pdf.setFontSize(9);
        pdf.setTextColor(50, 50, 50);
        const weaponLine = `${weapon.name}: ${weapon.damage} ${weapon.damageType} (+${weapon.attackBonus})`;
        pdf.text(weaponLine, 15, y + 5 + (i * 6));
      });
    }
  }

  // ========== PAGINA 2: INCANTESIMI E EQUIPAGGIAMENTO ==========
  private drawPage2(pdf: jsPDF, sheet: CharacterSheet) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    this.drawPageHeader(pdf, 'Incantesimi & Equipaggiamento', sheet);

    let y = 30;

    // Spell Slots
    if (sheet.spellSlots) {
      this.drawSection(pdf, 'Slot Incantesimo', 10, y, pageWidth - 20, 25);
      y += 10;

      pdf.setFontSize(9);
      let slotText = '';
      for (let level = 1; level <= 9; level++) {
        const slot = sheet.spellSlots[level];
        if (slot && slot.max > 0) {
          slotText += `Liv ${level}: ${slot.current}/${slot.max}  `;
        }
      }
      pdf.text(slotText || 'Nessuno slot disponibile', 15, y + 5);

      if (sheet.spellcastingAbility) {
        pdf.text(`Abilità: ${sheet.spellcastingAbility} | CD: ${sheet.spellSaveDC} | Bonus: +${sheet.spellAttackBonus}`, 15, y + 11);
      }

      y += 25;
    }

    // Lista incantesimi
    if (sheet.spells && sheet.spells.length > 0) {
      const spellsByLevel = this.groupSpellsByLevel(sheet.spells);
      
      for (const [level, spells] of Object.entries(spellsByLevel)) {
        const levelName = level === '0' ? 'Trucchetti' : `Livello ${level}`;
        const sectionHeight = 10 + spells.length * 5;
        
        if (y + sectionHeight > 270) {
          pdf.addPage();
          this.drawPageHeader(pdf, 'Incantesimi (continua)', sheet);
          y = 30;
        }

        this.drawSection(pdf, levelName, 10, y, pageWidth - 20, sectionHeight);
        y += 10;

        spells.forEach((spell, i) => {
          pdf.setFontSize(8);
          const prepared = spell.prepared ? '●' : '○';
          const concentration = spell.concentration ? ' [C]' : '';
          const ritual = spell.ritual ? ' [R]' : '';
          pdf.text(`${prepared} ${spell.name}${concentration}${ritual}`, 15, y + (i * 4.5));
        });

        y += spells.length * 5 + 5;
      }
    }

    // Equipaggiamento
    if (y > 200) {
      pdf.addPage();
      this.drawPageHeader(pdf, 'Equipaggiamento', sheet);
      y = 30;
    }

    this.drawSection(pdf, 'Equipaggiamento', 10, y, pageWidth - 20, 50);
    y += 10;

    pdf.setFontSize(9);
    pdf.text(`Armatura: ${sheet.armor || 'Nessuna'}`, 15, y);
    if (sheet.shield) {
      pdf.text(`Scudo: ${sheet.shield}`, 15, y + 5);
    }

    y += 12;

    // Inventario
    if (sheet.inventory && sheet.inventory.length > 0) {
      sheet.inventory.slice(0, 15).forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 15 + (col * 90);
        pdf.setFontSize(8);
        const equipped = item.equipped ? '⚔️' : '';
        pdf.text(`${equipped} ${item.name} x${item.quantity}`, x, y + (row * 4.5));
      });
    } else if (sheet.equipment && sheet.equipment.length > 0) {
      sheet.equipment.slice(0, 15).forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 15 + (col * 90);
        pdf.setFontSize(8);
        pdf.text(item, x, y + (row * 4.5));
      });
    }

    // Valuta
    if (sheet.currency) {
      y += 40;
      this.drawSection(pdf, 'Valuta', 10, y, pageWidth - 20, 15);
      y += 10;
      pdf.setFontSize(9);
      const currencyText = `MR: ${sheet.currency.cp} | MA: ${sheet.currency.sp} | ME: ${sheet.currency.ep} | MO: ${sheet.currency.gp} | MP: ${sheet.currency.pp}`;
      pdf.text(currencyText, 15, y);
    }
  }

  // ========== PAGINA 3: BACKGROUND E NOTE ==========
  private drawPage3(pdf: jsPDF, sheet: CharacterSheet) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    this.drawPageHeader(pdf, 'Background & Personalità', sheet);

    let y = 30;

    // Tratti personalità
    if (sheet.personalityTraits || sheet.ideals || sheet.bonds || sheet.flaws) {
      this.drawSection(pdf, 'Personalità', 10, y, pageWidth - 20, 50);
      y += 10;

      pdf.setFontSize(8);
      if (sheet.personalityTraits) {
        pdf.text(`Tratti: ${this.wrapText(sheet.personalityTraits, 80)}`, 15, y);
        y += 10;
      }
      if (sheet.ideals) {
        pdf.text(`Ideali: ${this.wrapText(sheet.ideals, 80)}`, 15, y);
        y += 10;
      }
      if (sheet.bonds) {
        pdf.text(`Legami: ${this.wrapText(sheet.bonds, 80)}`, 15, y);
        y += 10;
      }
      if (sheet.flaws) {
        pdf.text(`Difetti: ${this.wrapText(sheet.flaws, 80)}`, 15, y);
        y += 10;
      }

      y += 10;
    }

    // Aspetto fisico
    const hasAppearance = sheet.age || sheet.height || sheet.weight || sheet.eyes || sheet.hair;
    if (hasAppearance) {
      this.drawSection(pdf, 'Aspetto Fisico', 10, y, pageWidth - 20, 25);
      y += 10;

      pdf.setFontSize(8);
      const appearance = [
        sheet.age ? `Età: ${sheet.age}` : '',
        sheet.height ? `Altezza: ${sheet.height}` : '',
        sheet.weight ? `Peso: ${sheet.weight}` : '',
        sheet.eyes ? `Occhi: ${sheet.eyes}` : '',
        sheet.hair ? `Capelli: ${sheet.hair}` : '',
        sheet.skin ? `Pelle: ${sheet.skin}` : ''
      ].filter(Boolean).join(' | ');
      
      pdf.text(appearance, 15, y);
      y += 25;
    }

    // Features e Traits
    if (sheet.features && sheet.features.length > 0) {
      const featuresHeight = Math.min(60, 10 + sheet.features.length * 5);
      this.drawSection(pdf, 'Capacità & Tratti', 10, y, pageWidth - 20, featuresHeight);
      y += 10;

      pdf.setFontSize(8);
      sheet.features.slice(0, 10).forEach((feature, i) => {
        pdf.text(`• ${this.wrapText(feature, 90)}`, 15, y + (i * 5));
      });

      y += featuresHeight + 5;
    }

    // Backstory
    if (sheet.backstory) {
      if (y > 200) {
        pdf.addPage();
        this.drawPageHeader(pdf, 'Storia del Personaggio', sheet);
        y = 30;
      }

      this.drawSection(pdf, 'Backstory', 10, y, pageWidth - 20, 60);
      y += 10;

      pdf.setFontSize(8);
      const lines = pdf.splitTextToSize(sheet.backstory, pageWidth - 30);
      pdf.text(lines.slice(0, 12), 15, y);
    }

    // Footer
    this.drawFooter(pdf);
  }

  // ========== HELPER METHODS ==========
  
  private drawHeader(pdf: jsPDF, sheet: CharacterSheet) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Sfondo header
    pdf.setFillColor(44, 24, 16);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Bordo oro
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1);
    pdf.line(0, 40, pageWidth, 40);

    // Nome personaggio
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(24);
    pdf.text(sheet.characterName || sheet.character, pageWidth / 2, 20, { align: 'center' });

    // Sottotitolo
    pdf.setFontSize(12);
    const subtitle = `${sheet.race} ${this.formatClasses(sheet)} - Livello ${sheet.level}`;
    pdf.text(subtitle, pageWidth / 2, 32, { align: 'center' });
  }

  private drawPageHeader(pdf: jsPDF, title: string, sheet: CharacterSheet) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFillColor(44, 24, 16);
    pdf.rect(0, 0, pageWidth, 20, 'F');

    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.5);
    pdf.line(0, 20, pageWidth, 20);

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(14);
    pdf.text(title, 10, 13);

    pdf.setFontSize(10);
    pdf.text(sheet.characterName || sheet.character, pageWidth - 10, 13, { align: 'right' });
  }

  private drawSection(pdf: jsPDF, title: string, x: number, y: number, width: number, height: number) {
    // Sfondo sezione
    pdf.setFillColor(250, 245, 235);
    pdf.setDrawColor(180, 160, 130);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, width, height, 2, 2, 'FD');

    // Titolo sezione
    pdf.setFillColor(44, 24, 16);
    pdf.roundedRect(x + 5, y - 3, pdf.getTextWidth(title) + 10, 7, 1, 1, 'F');
    
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(10);
    pdf.text(title, x + 10, y + 1.5);
  }

  private drawStatBox(pdf: jsPDF, name: string, value: number, x: number, y: number, width: number) {
    const modifier = Math.floor((value - 10) / 2);
    const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

    // Box
    pdf.setFillColor(44, 24, 16);
    pdf.roundedRect(x, y, width, 22, 2, 2, 'F');

    // Nome stat
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(8);
    pdf.text(name, x + width / 2, y + 5, { align: 'center' });

    // Valore
    pdf.setFontSize(14);
    pdf.text(value.toString(), x + width / 2, y + 13, { align: 'center' });

    // Modificatore
    pdf.setFontSize(10);
    pdf.text(modText, x + width / 2, y + 19, { align: 'center' });
  }

  private drawFooter(pdf: jsPDF) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.text('Generato da Phendelver App', pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text(new Date().toLocaleDateString('it-IT'), pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  private formatClasses(sheet: CharacterSheet): string {
    if (sheet.classes && sheet.classes.length > 0) {
      return sheet.classes.map(c => `${c.name}${c.subclass ? ` (${c.subclass})` : ''} ${c.level}`).join(' / ');
    }
    return sheet.class || 'N/A';
  }

  private groupSpellsByLevel(spells: Spell[]): { [level: string]: Spell[] } {
    return spells.reduce((acc, spell) => {
      const level = spell.level.toString();
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {} as { [level: string]: Spell[] });
  }

  private wrapText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
