import { Injectable, signal, computed } from '@angular/core';
import { StoryEntity, StoryParserService } from './story-parser.service';

@Injectable({
  providedIn: 'root'
})
export class EntityHighlightService {
  // Entità selezionata per la preview
  private _selectedEntity = signal<StoryEntity | null>(null);
  
  selectedEntity = computed(() => this._selectedEntity());

  constructor(private storyParser: StoryParserService) {
    // Aggiungi event listener globale per i click sulle entità
    this.setupGlobalClickListener();
  }

  private setupGlobalClickListener(): void {
    // Solo nel browser
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('story-entity-link')) {
          event.preventDefault();
          const entityId = target.getAttribute('data-entity-id');
          if (entityId) {
            this.showEntityPreview(entityId);
          }
        }
      });
    }
  }

  /**
   * Processa il contenuto HTML e aggiunge link cliccabili alle entità conosciute
   */
  processContent(htmlContent: string): string {
    const entities = this.storyParser.getEntities();
    
    // Ordina le entità per lunghezza del nome (decrescente) per evitare match parziali
    const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);
    
    // Crea una mappa per tracciare le sostituzioni
    const placeholders: Map<string, string> = new Map();
    let placeholderIndex = 0;
    
    // Prima, estrai tutti i tag HTML e sostituiscili con placeholder
    let processedContent = htmlContent;
    const tagPattern = /<[^>]+>/g;
    const tags: string[] = [];
    
    processedContent = processedContent.replace(tagPattern, (match) => {
      const placeholder = `__TAG_${tags.length}__`;
      tags.push(match);
      return placeholder;
    });

    // Ora processa le entità nel testo pulito
    for (const entity of sortedEntities) {
      const nameVariants = this.getNameVariants(entity);
      
      for (const variant of nameVariants) {
        // Escapa caratteri speciali regex
        const escapedName = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Pattern che cerca parole intere
        const pattern = new RegExp(`\\b(${escapedName})\\b`, 'gi');

        processedContent = processedContent.replace(pattern, (match) => {
          // Verifica se non è già stato processato
          if (match.includes('__ENTITY_')) {
            return match;
          }
          const placeholder = `__ENTITY_${placeholderIndex}__`;
          placeholders.set(placeholder, this.createEntityLink(entity, match));
          placeholderIndex++;
          return placeholder;
        });
      }
    }

    // Ripristina i tag HTML
    tags.forEach((tag, index) => {
      processedContent = processedContent.replace(`__TAG_${index}__`, tag);
    });

    // Ripristina le entità
    placeholders.forEach((link, placeholder) => {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), link);
    });

    return processedContent;
  }

  /**
   * Genera varianti del nome per il matching
   */
  private getNameVariants(entity: StoryEntity): string[] {
    const variants: string[] = [entity.name];
    
    // Aggiungi il primo nome se il nome è composto
    const nameParts = entity.name.split(' ');
    if (nameParts.length > 1) {
      // Per personaggi, usa il primo nome
      if (entity.type === 'character') {
        variants.push(nameParts[0]);
      }
    }

    // Gestisci nomi con alias (es. "Tasha / Iggvilw / Zybilna")
    if (entity.name.includes('/')) {
      const aliases = entity.name.split('/').map(n => n.trim());
      variants.push(...aliases);
    }

    // Gestisci soprannomi tra parentesi (es. "Snickersnack (Snack)")
    const parenMatch = entity.name.match(/\(([^)]+)\)/);
    if (parenMatch) {
      variants.push(parenMatch[1]);
      variants.push(entity.name.replace(/\s*\([^)]+\)/, '').trim());
    }

    return variants;
  }

  /**
   * Crea il link HTML per un'entità
   */
  private createEntityLink(entity: StoryEntity, displayName: string): string {
    const color = this.getEntityColor(entity.type);
    const icon = this.getEntityIcon(entity.type);
    
    return `<span class="story-entity-link" data-entity-id="${entity.id}" style="color: ${color}; cursor: pointer; border-bottom: 1px dashed ${color}; font-weight: 600;" title="${entity.description}">${icon} ${displayName}</span>`;
  }

  /**
   * Mostra la preview di un'entità
   */
  showEntityPreview(entityId: string): void {
    const entities = this.storyParser.getEntities();
    const entity = entities.find(e => e.id === entityId);
    if (entity) {
      this._selectedEntity.set(entity);
    }
  }

  /**
   * Chiude la preview
   */
  closeEntityPreview(): void {
    this._selectedEntity.set(null);
  }

  /**
   * Colore per tipo di entità
   */
  getEntityColor(type: StoryEntity['type']): string {
    switch (type) {
      case 'character': return '#e74c3c';
      case 'location': return '#27ae60';
      case 'organization': return '#9b59b6';
      case 'event': return '#f39c12';
      default: return '#888888';
    }
  }

  /**
   * Icona per tipo di entità
   */
  getEntityIcon(type: StoryEntity['type']): string {
    switch (type) {
      case 'character': return '👤';
      case 'location': return '📍';
      case 'organization': return '🏛️';
      case 'event': return '📅';
      default: return '❓';
    }
  }
}
