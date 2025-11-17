import { Component, OnInit, ViewChild, ElementRef, signal, PLATFORM_ID, Inject, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { StoryParserService, StoryEntity, StoryRelation } from '../../services/story-parser.service';

@Component({
  selector: 'app-story-map',
  imports: [CommonModule],
  templateUrl: './story-map.html',
  styleUrl: './story-map.scss',
})
export class StoryMap implements OnInit {
  @ViewChild('mapSvg', { static: false }) mapSvg!: ElementRef<SVGSVGElement>;
  
  entities = signal<StoryEntity[]>([]);
  relations = signal<StoryRelation[]>([]);
  activeFilter = signal<'all' | 'character' | 'location' | 'event' | 'organization'>('all');
  selectedNode = signal<StoryEntity | null>(null);

  private isBrowser: boolean;

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

  async initMap() {
    if (!this.isBrowser || !this.mapSvg) {
      console.log('Skipping D3 initialization - not in browser or SVG not ready');
      return;
    }

    // Dynamic import D3 only in browser
    const d3Module = await import('d3');
    const d3 = d3Module;

    const svg = d3.select(this.mapSvg.nativeElement);
    const width = 1200;
    const height = 800;

    svg.attr('width', width).attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    const filteredEntities = this.getFilteredEntities();
    const filteredRelations = this.getFilteredRelations(filteredEntities);

    // Create simulation
    const simulation = d3.forceSimulation(filteredEntities as any)
      .force('link', d3.forceLink(filteredRelations as any)
        .id((d: any) => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(filteredRelations)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(filteredEntities)
      .join('circle')
      .attr('r', (d: StoryEntity) => d.importance * 12)
      .attr('fill', (d: StoryEntity) => this.getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(this.drag(simulation, d3) as any)
      .on('click', (_event: any, d: StoryEntity) => this.selectNode(d));

    // Draw labels
    const label = svg.append('g')
      .selectAll('text')
      .data(filteredEntities)
      .join('text')
      .text((d: StoryEntity) => d.name)
      .attr('font-size', 12)
      .attr('dx', 15)
      .attr('dy', 4)
      .attr('fill', '#ffffff')
      .style('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  }

  private drag(simulation: any, d3: any) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  private getNodeColor(type: StoryEntity['type']): string {
    const colors = {
      character: '#4CAF50',
      location: '#2196F3',
      event: '#FF9800',
      organization: '#9C27B0'
    };
    return colors[type] || '#757575';
  }

  private getFilteredEntities(): StoryEntity[] {
    const filter = this.activeFilter();
    if (filter === 'all') return this.entities();
    return this.entities().filter(e => e.type === filter);
  }

  private getFilteredRelations(entities: StoryEntity[]): StoryRelation[] {
    const entityIds = new Set(entities.map(e => e.id));
    return this.relations().filter(r => 
      entityIds.has(r.source) && entityIds.has(r.target)
    );
  }

  filterBy(type: 'all' | 'character' | 'location' | 'event' | 'organization') {
    this.activeFilter.set(type);
    this.initMap();
  }

  selectNode(node: StoryEntity) {
    this.selectedNode.set(node);
  }

  closeDetails() {
    this.selectedNode.set(null);
  }

  getNodeTypeIcon(type: StoryEntity['type']): string {
    const icons = {
      character: '🧑',
      location: '📍',
      event: '⚔️',
      organization: '🏛️'
    };
    return icons[type] || '•';
  }

  goBack() {
    this.router.navigate(['/diary']);
  }
}
