import { Injectable } from '@angular/core';

export interface StoryEntity {
  id: string;
  name: string;
  type: 'character' | 'location' | 'event' | 'organization';
  description: string;
  importance: 1 | 2 | 3; // Dimensione nel grafo
  chapter: 'previous' | 'story';
}

export interface StoryRelation {
  source: string; // entity id
  target: string; // entity id
  type: 'knows' | 'located_at' | 'participated_in' | 'member_of' | 'allied_with' | 'enemy_of';
  description?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string; // "Anno X" o data specifica
  description: string;
  entities: string[]; // character names
  location?: string;
  chapter: 'previous' | 'story';
  order: number; // Per ordinamento
}

@Injectable({
  providedIn: 'root'
})
export class StoryParserService {
  
  // Database conoscenza manuale (da aggiornare quando aggiungi nuovi capitoli)
  private knownEntities: StoryEntity[] = [
    // Personaggi Principali
    { id: 'asriel', name: 'Asriel', type: 'character', description: 'Warlock umano, protagonista', importance: 3, chapter: 'previous' },
    { id: 'lyra', name: 'Lyra', type: 'character', description: 'Amica di Asriel nel laboratorio', importance: 2, chapter: 'previous' },
    { id: 'snickersnack', name: 'Snickersnack', type: 'character', description: 'Compagno di cella', importance: 2, chapter: 'previous' },
    { id: 'grazzt', name: "Graz'zt", type: 'character', description: 'Signore demone, patron di Asriel', importance: 3, chapter: 'previous' },
    { id: 'nova', name: 'Nova', type: 'character', description: 'Rivale di Asriel nel palazzo', importance: 2, chapter: 'previous' },
    { id: 'ravel', name: 'Ravel', type: 'character', description: 'Paladino Tiefling, amico di infanzia', importance: 3, chapter: 'previous' },
    { id: 'auryn', name: 'Auryn', type: 'character', description: 'Rogue Half-Elf', importance: 3, chapter: 'story' },
    { id: 'ruben', name: 'Ruben', type: 'character', description: 'Fighter Dwarf', importance: 3, chapter: 'story' },
    
    // Luoghi
    { id: 'orfanotrofio', name: 'Orfanotrofio', type: 'location', description: 'Dove Asriel è cresciuto', importance: 2, chapter: 'previous' },
    { id: 'laboratorio', name: 'Laboratorio Segreto', type: 'location', description: 'Luogo degli esperimenti', importance: 3, chapter: 'previous' },
    { id: 'palazzo-cristallo', name: 'Palazzo di Cristallo', type: 'location', description: 'Dimora di Grazzt', importance: 3, chapter: 'previous' },
    { id: 'phandalin', name: 'Phandalin', type: 'location', description: 'Villaggio iniziale', importance: 2, chapter: 'story' },
    { id: 'wave-echo-cave', name: 'Wave Echo Cave', type: 'location', description: 'Antica miniera', importance: 2, chapter: 'story' },
    
    // Eventi
    { id: 'rapimento', name: 'Il Rapimento', type: 'event', description: 'Asriel rapito dallorfanotrofio', importance: 3, chapter: 'previous' },
    { id: 'esperimenti', name: 'Gli Esperimenti', type: 'event', description: 'Anni di prigionia nel laboratorio', importance: 3, chapter: 'previous' },
    { id: 'patto', name: 'Il Patto con Grazzt', type: 'event', description: 'Asriel diventa warlock', importance: 3, chapter: 'previous' },
    { id: 'liberazione', name: 'La Liberazione', type: 'event', description: 'Grazzt lascia andare Asriel', importance: 2, chapter: 'previous' },
    { id: 'false-hydra', name: 'Incontro False Hydra', type: 'event', description: 'Battaglia contro mostro', importance: 2, chapter: 'story' },
    
    // Organizzazioni
    { id: 'org-tatuaggio', name: 'Organizzazione del Tatuaggio', type: 'organization', description: 'Responsabili rapimenti', importance: 3, chapter: 'previous' },
    { id: 'lords-alliance', name: "Lords' Alliance", type: 'organization', description: 'Alleanza delle città', importance: 2, chapter: 'story' },
    { id: 'zhentarim', name: 'Zhentarim', type: 'organization', description: 'Rete mercantile oscura', importance: 2, chapter: 'story' }
  ];

  private knownRelations: StoryRelation[] = [
    // Asriel relations
    { source: 'asriel', target: 'orfanotrofio', type: 'located_at', description: 'Cresciuto qui' },
    { source: 'asriel', target: 'lyra', type: 'knows', description: 'Amici nel laboratorio' },
    { source: 'asriel', target: 'snickersnack', type: 'knows', description: 'Compagni di cella' },
    { source: 'asriel', target: 'laboratorio', type: 'located_at', description: 'Prigioniero' },
    { source: 'asriel', target: 'grazzt', type: 'knows', description: 'Warlock patron' },
    { source: 'asriel', target: 'palazzo-cristallo', type: 'located_at', description: 'Prigioniero' },
    { source: 'asriel', target: 'nova', type: 'enemy_of', description: 'Rivalità' },
    { source: 'asriel', target: 'ravel', type: 'allied_with', description: 'Amico di infanzia' },
    
    // Eventi relations
    { source: 'rapimento', target: 'orfanotrofio', type: 'located_at', description: 'Da qui' },
    { source: 'rapimento', target: 'laboratorio', type: 'located_at', description: 'Verso qui' },
    { source: 'rapimento', target: 'org-tatuaggio', type: 'participated_in', description: 'Responsabili' },
    { source: 'esperimenti', target: 'laboratorio', type: 'located_at' },
    { source: 'esperimenti', target: 'org-tatuaggio', type: 'participated_in' },
    { source: 'patto', target: 'grazzt', type: 'participated_in' },
    { source: 'patto', target: 'palazzo-cristallo', type: 'located_at' },
    
    // Lyra relations
    { source: 'lyra', target: 'laboratorio', type: 'located_at' },
    { source: 'lyra', target: 'esperimenti', type: 'participated_in' },
    
    // Party relations
    { source: 'asriel', target: 'auryn', type: 'allied_with', description: 'Party member' },
    { source: 'asriel', target: 'ruben', type: 'allied_with', description: 'Party member' },
    { source: 'auryn', target: 'ruben', type: 'allied_with', description: 'Party member' },
    { source: 'ravel', target: 'auryn', type: 'allied_with', description: 'Party member' },
    { source: 'ravel', target: 'ruben', type: 'allied_with', description: 'Party member' },
    
    // Story relations
    { source: 'false-hydra', target: 'phandalin', type: 'located_at' },
    { source: 'asriel', target: 'false-hydra', type: 'participated_in' }
  ];

  private timelineEvents: TimelineEvent[] = [
    { id: 'evt-1', title: 'Nascita di Asriel', date: 'Anno 0', description: 'Asriel nasce da genitori sconosciuti', entities: ['Asriel'], chapter: 'previous', order: 1 },
    { id: 'evt-2', title: 'Abbandono', date: 'Anno 0 - Giorno 1', description: 'Lasciato davanti alle porte dellorfanotrofio', entities: ['Asriel'], location: 'Orfanotrofio', chapter: 'previous', order: 2 },
    { id: 'evt-3', title: 'Amicizia con Ravel', date: 'Anno 8', description: 'Conosce Ravel che lo protegge dagli altri orfani', entities: ['Asriel', 'Ravel'], location: 'Orfanotrofio', chapter: 'previous', order: 3 },
    { id: 'evt-4', title: 'Il Rapimento', date: 'Anno 13', description: 'Viene rapito dallorfanotrofio in piena notte', entities: ['Asriel'], location: 'Orfanotrofio', chapter: 'previous', order: 4 },
    { id: 'evt-5', title: 'Primo Giorno nel Laboratorio', date: 'Anno 13 - Giorno 1', description: 'Si sveglia in una cella. Conosce Lyra e Snickersnack', entities: ['Asriel', 'Lyra', 'Snickersnack'], location: 'Laboratorio Segreto', chapter: 'previous', order: 5 },
    { id: 'evt-6', title: 'Gli Esperimenti', date: 'Anno 13-16', description: 'Anni di prigionia e esperimenti. Sviluppa poteri curativi', entities: ['Asriel', 'Lyra', 'Snickersnack'], location: 'Laboratorio Segreto', chapter: 'previous', order: 6 },
    { id: 'evt-7', title: 'Tentativo di Fuga', date: 'Anno 16', description: 'Piano di fuga fallito. Viene separato da Lyra e Snack', entities: ['Asriel', 'Lyra', 'Snickersnack'], location: 'Laboratorio Segreto', chapter: 'previous', order: 7 },
    { id: 'evt-8', title: 'Il Patto', date: 'Anno 16', description: "Graz'zt appare e offre un patto. Asriel accetta pur di uscire", entities: ['Asriel', "Graz'zt"], location: 'Laboratorio Segreto', chapter: 'previous', order: 8 },
    { id: 'evt-9', title: 'Prigionia nel Palazzo', date: 'Anno 16-18', description: "Vive nel palazzo di cristallo di Graz'zt. Rivalità con Nova", entities: ['Asriel', "Graz'zt", 'Nova'], location: 'Palazzo di Cristallo', chapter: 'previous', order: 9 },
    { id: 'evt-10', title: 'La Liberazione', date: 'Anno 18', description: "Graz'zt lo lascia andare con un patto: tornare dopo la vendetta", entities: ['Asriel', "Graz'zt"], location: 'Palazzo di Cristallo', chapter: 'previous', order: 10 },
    { id: 'evt-11', title: 'Inizio Avventura', date: 'Anno 18 - Presente', description: 'Viaggia alla ricerca del laboratorio e di un modo per liberarsi dal patto', entities: ['Asriel'], location: 'Faerun', chapter: 'previous', order: 11 },
    { id: 'evt-12', title: 'Arrivo a Phandalin', date: 'Campagna - Sessione 1', description: 'Il party arriva al villaggio', entities: ['Asriel', 'Auryn', 'Ravel', 'Ruben'], location: 'Phandalin', chapter: 'story', order: 12 },
    { id: 'evt-13', title: 'Battaglia False Hydra', date: 'Campagna - Sessione 3', description: 'Combattimento epico contro il mostro', entities: ['Asriel', 'Auryn', 'Ravel', 'Ruben'], location: 'Phandalin', chapter: 'story', order: 13 }
  ];

  constructor() {}

  getEntities(): StoryEntity[] {
    return [...this.knownEntities];
  }

  getRelations(): StoryRelation[] {
    return [...this.knownRelations];
  }

  getTimelineEvents(): TimelineEvent[] {
    return [...this.timelineEvents].sort((a, b) => a.order - b.order);
  }

  getEntitiesByType(type: StoryEntity['type']): StoryEntity[] {
    return this.knownEntities.filter(e => e.type === type);
  }

  getEntitiesByChapter(chapter: 'previous' | 'story'): StoryEntity[] {
    return this.knownEntities.filter(e => e.chapter === chapter);
  }

  getRelationsForEntity(entityId: string): StoryRelation[] {
    return this.knownRelations.filter(r => r.source === entityId || r.target === entityId);
  }

  getTimelineByChapter(chapter: 'previous' | 'story'): TimelineEvent[] {
    return this.timelineEvents
      .filter(e => e.chapter === chapter)
      .sort((a, b) => a.order - b.order);
  }

  // Metodo per aggiungere nuove entità manualmente
  addEntity(entity: Omit<StoryEntity, 'id'>): string {
    const id = entity.name.toLowerCase().replace(/\s+/g, '-');
    this.knownEntities.push({ ...entity, id });
    return id;
  }

  addRelation(relation: StoryRelation): void {
    this.knownRelations.push(relation);
  }

  addTimelineEvent(event: Omit<TimelineEvent, 'id'>): string {
    const id = `evt-${Date.now()}`;
    this.timelineEvents.push({ ...event, id });
    return id;
  }
}
