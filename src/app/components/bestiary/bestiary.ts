import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BestiaryService, Creature } from '../../services/bestiary.service';

@Component({
  selector: 'app-bestiary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bestiary.html',
  styleUrl: './bestiary.scss'
})
export class Bestiary {
  private bestiaryService = inject(BestiaryService);
  private router = inject(Router);

  // Filtri
  searchQuery = signal('');
  selectedType = signal<string>('all');
  selectedSubtype = signal<string>('all');

  // Creature selezionata per dettagli
  selectedCreature = signal<Creature | null>(null);

  // Tipi disponibili
  types = [
    { value: 'all', label: 'Tutti' },
    { value: 'humanoid', label: '🧑 Umanoidi' },
    { value: 'beast', label: '🐺 Bestie' },
    { value: 'undead', label: '💀 Non Morti' },
    { value: 'giant', label: '🗿 Giganti' },
    { value: 'monstrosity', label: '👹 Mostruosità' },
    { value: 'dragon', label: '🐉 Draghi' },
  ];

  // Sottotipi draghi
  dragonSubtypes = [
    { value: 'all', label: 'Tutti i Draghi' },
    { value: 'chromatic', label: '🔥 Cromatici (Malvagi)' },
    { value: 'metallic', label: '✨ Metallici (Buoni)' },
  ];

  // Creature filtrate
  filteredCreatures = computed(() => {
    let creatures = this.bestiaryService.getAllCreatures();
    
    // Filtro per tipo
    const type = this.selectedType();
    if (type !== 'all') {
      creatures = creatures.filter(c => c.type === type);
    }

    // Filtro per sottotipo (solo draghi)
    const subtype = this.selectedSubtype();
    if (type === 'dragon' && subtype !== 'all') {
      creatures = creatures.filter(c => c.subtype === subtype);
    }

    // Filtro per ricerca
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      creatures = creatures.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    // Ordina per CR
    return this.bestiaryService.sortByCR(creatures);
  });

  // Mostra sottotipi solo per draghi
  showDragonSubtypes = computed(() => this.selectedType() === 'dragon');

  selectCreature(creature: Creature) {
    this.selectedCreature.set(creature);
  }

  closeDetails() {
    this.selectedCreature.set(null);
  }

  goBack() {
    this.router.navigate(['/diary']);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      humanoid: '🧑',
      beast: '🐺',
      undead: '💀',
      giant: '🗿',
      monstrosity: '👹',
      dragon: '🐉'
    };
    return icons[type] || '❓';
  }

  getSizeLabel(size: string): string {
    const labels: Record<string, string> = {
      tiny: 'Minuscola',
      small: 'Piccola',
      medium: 'Media',
      large: 'Grande',
      huge: 'Enorme',
      gargantuan: 'Colossale'
    };
    return labels[size] || size;
  }

  getCRColor(cr: string): string {
    const crNum = this.bestiaryService.crToNumber(cr);
    if (crNum <= 0.5) return '#27ae60';  // Verde - facile
    if (crNum <= 2) return '#f1c40f';    // Giallo - medio
    if (crNum <= 5) return '#e67e22';    // Arancione - difficile
    if (crNum <= 10) return '#e74c3c';   // Rosso - molto difficile
    return '#8e44ad';                     // Viola - letale
  }

  getModifier(score: number): string {
    return this.bestiaryService.formatModifier(score);
  }

  hexToRgba(hex: number, alpha: number): string {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
