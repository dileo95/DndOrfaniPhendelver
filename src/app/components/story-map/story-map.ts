import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, PLATFORM_ID, Inject, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { StoryParserService, StoryEntity, StoryRelation } from '../../services/story-parser.service';

type EntityFilter = 'all' | 'character' | 'location' | 'organization';
type StoryArc = 'all' | 'dragon-busters' | 'prismeer' | 'protagonists';

@Component({
  selector: 'app-story-map',
  imports: [CommonModule],
  templateUrl: './story-map.html',
  styleUrl: './story-map.scss',
})
export class StoryMap implements OnInit, OnDestroy {
  @ViewChild('mapSvg', { static: false }) mapSvg!: ElementRef<SVGSVGElement>;
  
  entities = signal<StoryEntity[]>([]);
  relations = signal<StoryRelation[]>([]);
  activeFilter = signal<EntityFilter>('all');
  activeArc = signal<StoryArc>('all');
  selectedNode = signal<StoryEntity | null>(null);
  connectedEntities = signal<StoryEntity[]>([]);
  
  // Zoom e navigazione
  currentZoom = signal<number>(1);
  searchQuery = signal<string>('');
  searchResults = signal<StoryEntity[]>([]);

  // Filtri per tipo di entità
  entityFilters = [
    { id: 'all' as EntityFilter, label: '🌐 Tutti', color: '#d4af37' },
    { id: 'character' as EntityFilter, label: '🧑 Personaggi', color: '#4ade80' },
    { id: 'location' as EntityFilter, label: '📍 Luoghi', color: '#60a5fa' },
    { id: 'organization' as EntityFilter, label: '🏛️ Organizzazioni', color: '#c084fc' }
  ];

  // Filtri per arco narrativo
  storyArcs = [
    { id: 'all' as StoryArc, label: '📚 Tutte le Saghe' },
    { id: 'dragon-busters' as StoryArc, label: '🐉 Dragon Busters' },
    { id: 'prismeer' as StoryArc, label: '🎭 Prismeer' },
    { id: 'protagonists' as StoryArc, label: '⚔️ Protagonisti' }
  ];

  private isBrowser: boolean;
  private simulation: any = null;
  private zoomBehavior: any = null;
  private svg: any = null;
  private container: any = null;
  private nodes: any[] = [];
  private width = 1400;
  private height = 900;

  constructor(
    private router: Router,
    private storyParser: StoryParserService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      afterNextRender(() => {
        this.initMap();
      });
    }
  }

  ngOnInit() {
    this.entities.set(this.storyParser.getEntities());
    this.relations.set(this.storyParser.getRelations());
  }

  ngOnDestroy() {
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }
  }

  async initMap() {
    if (!this.isBrowser || !this.mapSvg) return;

    // Ferma simulazione precedente
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }

    const d3 = await import('d3');
    this.svg = d3.select(this.mapSvg.nativeElement);

    this.svg.attr('width', this.width).attr('height', this.height);
    this.svg.selectAll('*').remove();

    // Copia profonda dei dati
    this.nodes = this.getFilteredEntities().map(e => ({ ...e }));
    const links: any[] = this.getFilteredRelations(this.getFilteredEntities()).map(r => ({
      ...r,
      source: r.source,
      target: r.target
    }));

    if (this.nodes.length === 0) return;

    // Container per zoom/pan
    this.container = this.svg.append('g').attr('class', 'container');

    // Zoom behavior
    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event: any) => {
        this.container.attr('transform', event.transform);
        this.currentZoom.set(event.transform.k);
      });

    this.svg.call(this.zoomBehavior);

    // Gruppi SVG dentro il container
    const linkGroup = this.container.append('g').attr('class', 'links');
    const nodeGroup = this.container.append('g').attr('class', 'nodes');
    const labelGroup = this.container.append('g').attr('class', 'labels');

    // Disegna link
    const link = linkGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d: any) => this.getLinkColor(d.type))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Disegna nodi come gruppi
    const node = nodeGroup.selectAll('g')
      .data(this.nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Cerchio del nodo
    node.append('circle')
      .attr('r', (d: any) => d.importance * 10 + 15)
      .attr('fill', (d: any) => this.getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Icona del nodo
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', 'white')
      .attr('font-size', (d: any) => `${10 + d.importance * 3}px`)
      .style('pointer-events', 'none')
      .text((d: any) => this.getNodeIcon(d));

    // Click sui nodi
    node.on('click', (event: any, d: any) => {
      event.stopPropagation();
      this.selectNode(d);
    });

    // Double click per centrare sul nodo
    node.on('dblclick', (event: any, d: any) => {
      event.stopPropagation();
      this.centerOnNode(d, d3);
    });

    // Label
    const label = labelGroup.selectAll('text')
      .data(this.nodes)
      .join('text')
      .text((d: any) => this.truncateName(d.name, 18))
      .attr('font-size', 11)
      .attr('fill', '#fff')
      .attr('dx', (d: any) => d.importance * 10 + 20)
      .attr('dy', 4)
      .style('pointer-events', 'none');

    // Simulazione
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.importance * 10 + 25));

    // Aggiorna posizioni
    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });

    // Drag - usa filter per distinguere dal pan
    const simulation = this.simulation;
    node.call(d3.drag<any, any>()
      .on('start', function(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
    );

    // Salva riferimento a d3 per i metodi di zoom
    (this as any)._d3 = d3;
  }

  // Metodi di zoom
  async zoomIn() {
    if (!this.svg || !this.zoomBehavior) return;
    const d3 = (this as any)._d3 || await import('d3');
    this.svg.transition().duration(300).call(
      this.zoomBehavior.scaleBy, 1.3
    );
  }

  async zoomOut() {
    if (!this.svg || !this.zoomBehavior) return;
    const d3 = (this as any)._d3 || await import('d3');
    this.svg.transition().duration(300).call(
      this.zoomBehavior.scaleBy, 0.7
    );
  }

  async resetZoom() {
    if (!this.svg || !this.zoomBehavior) return;
    const d3 = (this as any)._d3 || await import('d3');
    this.svg.transition().duration(500).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity
    );
  }

  async fitToScreen() {
    if (!this.svg || !this.zoomBehavior || this.nodes.length === 0) return;
    const d3 = (this as any)._d3 || await import('d3');

    // Calcola bounding box dei nodi
    const xExtent = d3.extent(this.nodes, (d: any) => d.x) as [number, number];
    const yExtent = d3.extent(this.nodes, (d: any) => d.y) as [number, number];
    
    const padding = 50;
    const dx = xExtent[1] - xExtent[0] + padding * 2;
    const dy = yExtent[1] - yExtent[0] + padding * 2;
    const x = (xExtent[0] + xExtent[1]) / 2;
    const y = (yExtent[0] + yExtent[1]) / 2;
    
    const scale = Math.min(0.9, Math.min(this.width / dx, this.height / dy));
    const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.svg.transition().duration(500).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );
  }

  private async centerOnNode(node: any, d3?: any) {
    if (!this.svg || !this.zoomBehavior) return;
    d3 = d3 || (this as any)._d3 || await import('d3');
    
    const scale = 1.5;
    const x = this.width / 2 - node.x * scale;
    const y = this.height / 2 - node.y * scale;

    this.svg.transition().duration(500).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity.translate(x, y).scale(scale)
    );
  }

  // Ricerca
  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(query);
    
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    const results = this.getFilteredEntities().filter(e => 
      e.name.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query)
    ).slice(0, 8);
    
    this.searchResults.set(results);
  }

  async focusOnNode(entity: StoryEntity) {
    this.searchQuery.set('');
    this.searchResults.set([]);
    
    // Trova il nodo corrispondente
    const node = this.nodes.find(n => n.id === entity.id);
    if (node) {
      await this.centerOnNode(node);
      this.selectNode(node);
    }
  }

  getNodeColor(type: StoryEntity['type']): string {
    const colors = {
      character: '#4ade80',  // Verde
      location: '#60a5fa',   // Blu
      event: '#fb923c',      // Arancione
      organization: '#c084fc' // Viola
    };
    return colors[type] || '#d4af37';
  }

  private getLinkColor(type: StoryRelation['type']): string {
    const colors: Record<string, string> = {
      knows: '#888',
      located_at: '#60a5fa',
      participated_in: '#fb923c',
      member_of: '#c084fc',
      allied_with: '#4ade80',
      enemy_of: '#ef4444',
      family: '#f472b6'
    };
    return colors[type] || '#888';
  }

  getNodeIcon(entity: StoryEntity): string {
    // Icone personalizzate per personaggi importanti
    const specialIcons: Record<string, string> = {
      'tiamat': '🐲',
      'grazzt': '😈',
      'tasha': '🧙‍♀️',
      'jabberwock': '👹'
    };
    
    if (specialIcons[entity.id]) return specialIcons[entity.id];

    const icons = {
      character: '🧑',
      location: '📍',
      event: '⚔️',
      organization: '🏛️'
    };
    return icons[entity.type] || '•';
  }

  private truncateName(name: string, maxLength: number): string {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  }

  getFilteredEntities(): StoryEntity[] {
    let entities = this.entities();
    const typeFilter = this.activeFilter();
    const arcFilter = this.activeArc();
    
    // Filtra per tipo
    if (typeFilter !== 'all') {
      entities = entities.filter(e => e.type === typeFilter);
    }
    
    // Filtra per arco narrativo
    if (arcFilter !== 'all') {
      entities = entities.filter(e => {
        switch (arcFilter) {
          case 'dragon-busters':
            return this.isDragonBustersEntity(e);
          case 'prismeer':
            return this.isPrismeerEntity(e);
          case 'protagonists':
            return this.isProtagonistEntity(e);
          default:
            return true;
        }
      });
    }
    
    return entities;
  }

  private isDragonBustersEntity(entity: StoryEntity): boolean {
    const dbIds = ['fascal', 'drosda', 'valinor', 'mylo', 'runara', 'aidron', 'fondifaville', 
      'sharruth', 'sara-glizoz', 'falco', 'harbin-wester', 'silkas', 'criovenn', 'doldur', 
      'rezmir', 'neronvhine', 'lord-neverember', 'garaele', 'tiamat', 'dragon-busters', 
      'culto-drago', 'zhentarim', 'arpisti', 'sonno-drago', 'phandalin', 'guglia-ghiacciata', 
      'waterdeep', 'skyreach', 'tempio-tiamat'];
    return dbIds.includes(entity.id);
  }

  private isPrismeerEntity(entity: StoryEntity): boolean {
    const prIds = ['arhabal', 'nioh', 'shion', 'bowie', 'strego', 'lumen', 'bavlorna', 
      'belladonna', 'endelyn', 'vansel', 'champy', 'will', 'lamorna', 'zarak', 'kelek', 
      'zargash', 'tasha', 'jabberwock', 'circo-stregolumen', 'prismeer', 'quivi', 'ivi', 
      'mantoscuro', 'altrove', 'madrecorno', 'palazzo-desideri', 'congrega-clessidra', 
      'lega-malvagita', 'valinor'];
    return prIds.includes(entity.id);
  }

  private isProtagonistEntity(entity: StoryEntity): boolean {
    const protIds = ['asriel', 'auryn', 'ravel', 'ruben', 'gundren', 'jonah', 'frank', 
      'elizabeth', 'grazzt', 'lyra', 'snickersnack', 'nova', 'neverwinter', 'rockguard', 
      'biblioteca-neverwinter', 'orfanotrofio', 'laboratorio', 'palazzo-cristallo', 
      'org-tatuaggio'];
    return protIds.includes(entity.id);
  }

  getFilteredRelations(entities: StoryEntity[]): StoryRelation[] {
    const entityIds = new Set(entities.map(e => e.id));
    return this.relations().filter(r => 
      entityIds.has(r.source) && entityIds.has(r.target)
    );
  }

  filterByType(type: EntityFilter) {
    this.activeFilter.set(type);
    this.initMap();
  }

  filterByArc(arc: StoryArc) {
    this.activeArc.set(arc);
    this.initMap();
  }

  selectNode(node: StoryEntity) {
    this.selectedNode.set(node);
    // Trova entità connesse
    const relations = this.storyParser.getRelationsForEntity(node.id);
    const connectedIds = relations.map(r => r.source === node.id ? r.target : r.source);
    const connected = this.entities().filter(e => connectedIds.includes(e.id));
    this.connectedEntities.set(connected);
  }

  closeDetails() {
    this.selectedNode.set(null);
    this.connectedEntities.set([]);
  }

  getNodeTypeLabel(type: StoryEntity['type']): string {
    const labels = {
      character: 'Personaggio',
      location: 'Luogo',
      event: 'Evento',
      organization: 'Organizzazione'
    };
    return labels[type] || type;
  }

  getRelationLabel(type: StoryRelation['type']): string {
    const labels: Record<string, string> = {
      knows: 'Conosce',
      located_at: 'Si trova a',
      participated_in: 'Ha partecipato a',
      member_of: 'Membro di',
      allied_with: 'Alleato con',
      enemy_of: 'Nemico di',
      family: 'Famiglia'
    };
    return labels[type] || type;
  }

  goBack() {
    this.router.navigate(['/diary']);
  }
}
