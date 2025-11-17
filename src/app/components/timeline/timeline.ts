import { Component, signal, ViewChild, ElementRef, afterNextRender, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { StoryParserService, TimelineEvent } from '../../services/story-parser.service';

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
  activeFilter = signal<'all' | 'previous' | 'story'>('all');
  selectedEvent = signal<TimelineEvent | null>(null);

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
    const width = 1200;
    const height = Math.max(800, this.getFilteredEvents().length * 120);

    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const filteredEvents = this.getFilteredEvents();
    const margin = { top: 40, right: 50, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Timeline line
    const lineX = innerWidth / 2;
    g.append('line')
      .attr('x1', lineX)
      .attr('y1', 0)
      .attr('x2', lineX)
      .attr('y2', height - margin.top - margin.bottom)
      .attr('stroke', '#d4af37')
      .attr('stroke-width', 4);

    // Events
    const eventGroups = g.selectAll('.event-group')
      .data(filteredEvents)
      .enter()
      .append('g')
      .attr('class', 'event-group')
      .attr('transform', (_d, i) => `translate(0, ${i * 120})`);

    // Event circles
    eventGroups.append('circle')
      .attr('cx', lineX)
      .attr('cy', 0)
      .attr('r', 12)
      .attr('fill', (d) => this.getEventColor(d.chapter))
      .attr('stroke', '#d4af37')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => this.selectEvent(d));

    // Event lines to cards
    eventGroups.append('line')
      .attr('x1', lineX)
      .attr('y1', 0)
      .attr('x2', (_d, i) => i % 2 === 0 ? lineX - 80 : lineX + 80)
      .attr('y2', 0)
      .attr('stroke', 'rgba(212, 175, 55, 0.4)')
      .attr('stroke-width', 2);

    // Event cards
    const cardWidth = 400;
    const cardHeight = 100;
    
    const cards = eventGroups.append('g')
      .attr('transform', (_d, i) => {
        const x = i % 2 === 0 ? lineX - 80 - cardWidth : lineX + 80;
        return `translate(${x}, ${-cardHeight / 2})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => this.selectEvent(d));

    // Card background
    cards.append('rect')
      .attr('width', cardWidth)
      .attr('height', cardHeight)
      .attr('rx', 8)
      .attr('fill', 'rgba(44, 24, 16, 0.9)')
      .attr('stroke', '#d4af37')
      .attr('stroke-width', 2);

    // Event date
    cards.append('text')
      .attr('x', 15)
      .attr('y', 25)
      .attr('fill', '#d4af37')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text((d) => d.date);

    // Event title
    cards.append('text')
      .attr('x', 15)
      .attr('y', 50)
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text((d) => this.truncateText(d.title, 40));

    // Event description
    cards.append('text')
      .attr('x', 15)
      .attr('y', 70)
      .attr('fill', 'rgba(255, 255, 255, 0.7)')
      .attr('font-size', '13px')
      .text((d) => this.truncateText(d.description, 50));
  }

  getFilteredEvents(): TimelineEvent[] {
    const events = this.events();
    const filter = this.activeFilter();
    
    if (filter === 'all') return events;
    return events.filter(e => e.chapter === filter);
  }

  filterBy(filter: 'all' | 'previous' | 'story') {
    this.activeFilter.set(filter);
    this.initTimeline();
  }

  selectEvent(event: TimelineEvent) {
    this.selectedEvent.set(event);
  }

  closeDetails() {
    this.selectedEvent.set(null);
  }

  getEventColor(chapter: string): string {
    return chapter === 'previous' ? '#fb923c' : '#60a5fa';
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  goBack() {
    this.router.navigate(['/diary']);
  }
}
