import { Component, signal, ViewChild, ElementRef, afterNextRender, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { StoryParserService, TimelineEvent } from '../../services/story-parser.service';

type StoryArc = 'all' | 'dragon-busters' | 'prismeer' | 'asriel-backstory' | 'neverwinter';

@Component({
  selector: 'app-timeline',
  imports: [CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  @ViewChild('timelineSvg') timelineSvg!: ElementRef<SVGElement>;

  private router = inject(Router);
  private storyParser = inject(StoryParserService);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  events = signal<TimelineEvent[]>([]);
  activeFilter = signal<StoryArc>('all');
  selectedEvent = signal<TimelineEvent | null>(null);

  // Archi narrativi per filtro
  storyArcs = [
    { id: 'all' as StoryArc, label: '📚 Tutti gli Eventi', color: '#d4af37' },
    { id: 'dragon-busters' as StoryArc, label: '🐉 Dragon Busters', color: '#fb923c' },
    { id: 'prismeer' as StoryArc, label: '🎭 Prismeer', color: '#c084fc' },
    { id: 'asriel-backstory' as StoryArc, label: '⛓️ Backstory Asriel', color: '#60a5fa' },
    { id: 'neverwinter' as StoryArc, label: '⚔️ Neverwinter', color: '#4ade80' }
  ];

  constructor() {
    this.loadEvents();
    
    if (this.isBrowser) {
      afterNextRender(() => {
        this.initTimeline();
      });
    }
  }

  loadEvents() {
    const allEvents = this.storyParser.getTimelineEvents();
    this.events.set(allEvents);
  }

  async initTimeline() {
    if (!this.isBrowser || !this.timelineSvg) return;

    const d3 = await import('d3');
    const svg = d3.select(this.timelineSvg.nativeElement);
    const filteredEvents = this.getFilteredEvents();
    const width = 1200;
    const height = Math.max(800, filteredEvents.length * 100 + 100);

    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const margin = { top: 60, right: 50, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Timeline line
    const lineX = innerWidth / 2;
    
    // Gradient per la linea
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'timeline-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#fb923c');
    gradient.append('stop').attr('offset', '50%').attr('stop-color', '#d4af37');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#4ade80');

    g.append('line')
      .attr('x1', lineX)
      .attr('y1', 0)
      .attr('x2', lineX)
      .attr('y2', height - margin.top - margin.bottom)
      .attr('stroke', 'url(#timeline-gradient)')
      .attr('stroke-width', 6)
      .attr('stroke-linecap', 'round');

    // Events
    const eventGroups = g.selectAll('.event-group')
      .data(filteredEvents)
      .enter()
      .append('g')
      .attr('class', 'event-group')
      .attr('transform', (_d, i) => `translate(0, ${i * 100 + 20})`);

    // Event circles
    eventGroups.append('circle')
      .attr('cx', lineX)
      .attr('cy', 0)
      .attr('r', 14)
      .attr('fill', (d) => this.getEventColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))')
      .on('click', (_event, d) => this.selectEvent(d))
      .on('mouseover', function() {
        d3.select(this).transition().duration(200).attr('r', 18);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('r', 14);
      });

    // Icona nell'evento
    eventGroups.append('text')
      .attr('x', lineX)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .style('pointer-events', 'none')
      .text((d) => this.getEventIcon(d));

    // Event lines to cards
    eventGroups.append('line')
      .attr('x1', lineX)
      .attr('y1', 0)
      .attr('x2', (_d, i) => i % 2 === 0 ? lineX - 100 : lineX + 100)
      .attr('y2', 0)
      .attr('stroke', (d) => this.getEventColor(d))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3')
      .attr('opacity', 0.6);

    // Event cards
    const cardWidth = 420;
    const cardHeight = 80;
    
    const cards = eventGroups.append('g')
      .attr('transform', (_d, i) => {
        const x = i % 2 === 0 ? lineX - 100 - cardWidth : lineX + 100;
        return `translate(${x}, ${-cardHeight / 2})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => this.selectEvent(d));

    // Card background con bordo colorato
    cards.append('rect')
      .attr('width', cardWidth)
      .attr('height', cardHeight)
      .attr('rx', 10)
      .attr('fill', 'rgba(30, 20, 15, 0.95)')
      .attr('stroke', (d) => this.getEventColor(d))
      .attr('stroke-width', 2);

    // Barra colorata laterale
    cards.append('rect')
      .attr('width', 6)
      .attr('height', cardHeight)
      .attr('rx', 3)
      .attr('fill', (d) => this.getEventColor(d));

    // Event date
    cards.append('text')
      .attr('x', 20)
      .attr('y', 22)
      .attr('fill', (d) => this.getEventColor(d))
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d.date);

    // Event title
    cards.append('text')
      .attr('x', 20)
      .attr('y', 45)
      .attr('fill', 'white')
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .text((d) => this.truncateText(d.title, 45));

    // Event description
    cards.append('text')
      .attr('x', 20)
      .attr('y', 65)
      .attr('fill', 'rgba(255, 255, 255, 0.6)')
      .attr('font-size', '12px')
      .text((d) => this.truncateText(d.description, 55));

    // Location badge
    cards.filter((d) => !!d.location)
      .append('text')
      .attr('x', cardWidth - 15)
      .attr('y', 22)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(255, 255, 255, 0.5)')
      .attr('font-size', '11px')
      .text((d) => `📍 ${this.truncateText(d.location || '', 20)}`);
  }

  getFilteredEvents(): TimelineEvent[] {
    const events = this.events();
    const filter = this.activeFilter();
    
    if (filter === 'all') return events;
    
    // Filtra per arco narrativo basato sull'id dell'evento
    return events.filter(e => {
      switch (filter) {
        case 'dragon-busters':
          return e.id.startsWith('db-');
        case 'prismeer':
          return e.id.startsWith('pr-');
        case 'asriel-backstory':
          return e.id.startsWith('as-');
        case 'neverwinter':
          return e.id.startsWith('nw-');
        default:
          return true;
      }
    });
  }

  filterBy(filter: StoryArc) {
    this.activeFilter.set(filter);
    this.initTimeline();
  }

  selectEvent(event: TimelineEvent) {
    this.selectedEvent.set(event);
  }

  closeDetails() {
    this.selectedEvent.set(null);
  }

  getEventColor(event: TimelineEvent): string {
    // Colore basato sull'arco narrativo
    if (event.id.startsWith('db-')) return '#fb923c'; // Dragon Busters - arancione
    if (event.id.startsWith('pr-')) return '#c084fc'; // Prismeer - viola
    if (event.id.startsWith('as-')) return '#60a5fa'; // Asriel backstory - blu
    if (event.id.startsWith('nw-')) return '#4ade80'; // Neverwinter - verde
    return '#d4af37'; // Default oro
  }

  getEventIcon(event: TimelineEvent): string {
    if (event.id.startsWith('db-')) return '🐉';
    if (event.id.startsWith('pr-')) return '🎭';
    if (event.id.startsWith('as-')) return '⛓️';
    if (event.id.startsWith('nw-')) return '⚔️';
    return '📜';
  }

  getArcLabel(event: TimelineEvent): string {
    if (event.id.startsWith('db-')) return 'Dragon Busters';
    if (event.id.startsWith('pr-')) return 'I Bambini di Prismeer';
    if (event.id.startsWith('as-')) return 'Backstory Asriel';
    if (event.id.startsWith('nw-')) return 'Storia Attuale';
    return 'Generale';
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  goBack() {
    this.router.navigate(['/diary']);
  }
}
