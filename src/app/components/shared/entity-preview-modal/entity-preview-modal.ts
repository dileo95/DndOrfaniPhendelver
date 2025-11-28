import { Component, input, output, computed } from '@angular/core';
import { StoryEntity, StoryParserService } from '../../../services/story-parser.service';

@Component({
  selector: 'app-entity-preview-modal',
  standalone: true,
  imports: [],
  templateUrl: './entity-preview-modal.html',
  styleUrl: './entity-preview-modal.scss'
})
export class EntityPreviewModal {
  entity = input.required<StoryEntity | null>();
  close = output<void>();

  constructor(private storyParser: StoryParserService) {}

  // Calcola l'icona in base al tipo
  entityIcon = computed(() => {
    const entity = this.entity();
    if (!entity) return '❓';
    
    switch (entity.type) {
      case 'character': return '👤';
      case 'location': return '📍';
      case 'organization': return '🏛️';
      case 'event': return '📅';
      default: return '❓';
    }
  });

  // Calcola il colore in base al tipo
  entityColor = computed(() => {
    const entity = this.entity();
    if (!entity) return '#888888';
    
    switch (entity.type) {
      case 'character': return '#e74c3c';
      case 'location': return '#27ae60';
      case 'organization': return '#9b59b6';
      case 'event': return '#f39c12';
      default: return '#888888';
    }
  });

  // Traduzione tipo entità
  entityTypeLabel = computed(() => {
    const entity = this.entity();
    if (!entity) return '';
    
    switch (entity.type) {
      case 'character': return 'Personaggio';
      case 'location': return 'Luogo';
      case 'organization': return 'Organizzazione';
      case 'event': return 'Evento';
      default: return 'Altro';
    }
  });

  // Traduzione capitolo
  chapterLabel = computed(() => {
    const entity = this.entity();
    if (!entity) return '';
    
    return entity.chapter === 'previous' ? 'Eventi Passati' : 'Storia Attuale';
  });

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('entity-preview-overlay')) {
      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
