import { Component, OnInit, signal, computed, ViewChild, ElementRef, HostListener, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, PlayerNote } from '../../services/database.service';
import { StoryParserService, StoryEntity } from '../../services/story-parser.service';

type SortOption = 'newest' | 'oldest' | 'alphabetical';
type ViewMode = 'grid' | 'list';

// Colori disponibili per le note
export const NOTE_COLORS = [
  { id: 'gold', label: 'Oro', hex: '#d4af37' },
  { id: 'red', label: 'Rosso', hex: '#c0392b' },
  { id: 'blue', label: 'Blu', hex: '#2980b9' },
  { id: 'green', label: 'Verde', hex: '#27ae60' },
  { id: 'purple', label: 'Viola', hex: '#8e44ad' },
  { id: 'orange', label: 'Arancione', hex: '#d35400' }
];

@Component({
  selector: 'app-player-notes',
  imports: [CommonModule, FormsModule],
  templateUrl: './player-notes.html',
  styleUrl: './player-notes.scss'
})
export class PlayerNotes implements OnInit {
  private platformId = inject(PLATFORM_ID);
  @ViewChild('contentTextarea') contentTextarea!: ElementRef<HTMLTextAreaElement>;
  
  character = signal<string>('');
  notes = signal<PlayerNote[]>([]);
  
  // Ricerca e filtri
  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  selectedColor = signal<string>('');
  sortBy = signal<SortOption>('newest');
  
  // Form per nuova nota
  showForm = signal(false);
  editingNote = signal<PlayerNote | null>(null);
  noteTitle = signal('');
  noteContent = signal('');
  noteTags = signal('');
  noteColor = signal('gold');
  showPreview = signal(false);
  
  // Link entità story-map
  noteLinkedEntities = signal<string[]>([]);
  entitySearchQuery = signal('');
  showEntitySelector = signal(false);
  selectedEntityPreview = signal<StoryEntity | null>(null);
  
  // Espandi/Comprimi cards
  expandedNotes = signal<Set<number>>(new Set());
  maxPreviewLength = 150; // caratteri prima di troncare
  
  // Mobile UX
  isMobile = signal(false);
  viewMode = signal<ViewMode>('grid');
  swipedNoteId = signal<number | null>(null);
  private touchStartX = 0;
  private touchStartY = 0;
  
  // Colori disponibili
  colors = NOTE_COLORS;
  
  // Inject StoryParserService
  private storyParser = inject(StoryParserService);

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  private checkMobile() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth <= 768);
      // Auto switch to list on mobile
      if (window.innerWidth <= 480) {
        this.viewMode.set('list');
      }
    }
  }

  // Computed: tutti i tag unici dalle note
  allTags = computed(() => {
    const tags = new Set<string>();
    this.notes().forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  // Computed: tutte le entità disponibili dalla story-map
  allEntities = computed(() => {
    return this.storyParser.getEntities();
  });

  // Computed: entità filtrate per ricerca nel selettore
  filteredEntities = computed(() => {
    const query = this.entitySearchQuery().toLowerCase().trim();
    const linked = this.noteLinkedEntities();
    let entities = this.allEntities().filter(e => !linked.includes(e.id));
    
    if (query) {
      entities = entities.filter(e => 
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    }
    return entities.slice(0, 10); // Limita a 10 risultati
  });

  // Computed: note filtrate e ordinate
  filteredNotes = computed(() => {
    let result = this.notes();
    
    // Filtro per ricerca testo
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }
    
    // Filtro per tag selezionati
    const selectedTags = this.selectedTags();
    if (selectedTags.length > 0) {
      result = result.filter(note => 
        selectedTags.some(tag => note.tags?.includes(tag))
      );
    }
    
    // Filtro per colore
    const selectedColor = this.selectedColor();
    if (selectedColor) {
      result = result.filter(note => note.color === selectedColor);
    }
    
    // Ordinamento
    const sortOption = this.sortBy();
    result = [...result].sort((a, b) => {
      // Prima le note pinnate
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Poi ordina normalmente
      switch (sortOption) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return result;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.character.set(this.route.snapshot.paramMap.get('character') || '');
    this.checkMobile();
    await this.loadNotes();
  }

  async loadNotes() {
    const notes = await this.db.getNotesByCharacter(this.character());
    this.notes.set(notes);
  }

  openNewNoteForm() {
    this.showForm.set(true);
    this.editingNote.set(null);
    this.noteTitle.set('');
    this.noteContent.set('');
    this.noteTags.set('');
    this.noteColor.set('gold');
    this.noteLinkedEntities.set([]);
    this.entitySearchQuery.set('');
    this.showEntitySelector.set(false);
  }

  openEditForm(note: PlayerNote) {
    this.showForm.set(true);
    this.editingNote.set(note);
    this.noteTitle.set(note.title);
    this.noteContent.set(note.content);
    this.noteTags.set(note.tags?.join(', ') || '');
    this.noteColor.set(note.color || 'gold');
    this.noteLinkedEntities.set(note.linkedEntities || []);
    this.entitySearchQuery.set('');
    this.showEntitySelector.set(false);
  }

  async saveNote() {
    const title = this.noteTitle().trim();
    const content = this.noteContent().trim();
    
    if (!title || !content) {
      alert('Titolo e contenuto sono obbligatori');
      return;
    }

    const tags = this.noteTags()
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const color = this.noteColor();
    const linkedEntities = this.noteLinkedEntities();

    if (this.editingNote()) {
      // Modifica nota esistente
      await this.db.updateNote(this.editingNote()!.id!, {
        title,
        content,
        tags,
        color,
        linkedEntities
      });
    } else {
      // Nuova nota
      await this.db.addNote({
        character: this.character(),
        title,
        content,
        tags,
        color,
        pinned: false,
        linkedEntities
      });
    }

    this.closeForm();
    await this.loadNotes();
  }

  async deleteNote(note: PlayerNote) {
    if (confirm(`Eliminare la nota "${note.title}"?`)) {
      await this.db.deleteNote(note.id!);
      await this.loadNotes();
    }
  }

  closeForm() {
    this.showForm.set(false);
    this.editingNote.set(null);
    this.noteTitle.set('');
    this.noteContent.set('');
    this.noteTags.set('');
    this.noteColor.set('gold');
    this.showPreview.set(false);
  }

  // ========== MARKDOWN SUPPORT ==========
  
  // Inserisce markdown nel textarea
  insertMarkdown(prefix: string, suffix: string = '') {
    const textarea = this.contentTextarea?.nativeElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.noteContent();
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    this.noteContent.set(newText);
    
    // Riposiziona cursore
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + prefix.length + selectedText.length + suffix.length : start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Toolbar actions
  insertBold() { this.insertMarkdown('**', '**'); }
  insertItalic() { this.insertMarkdown('*', '*'); }
  insertHeading() { this.insertMarkdown('## '); }
  insertList() { this.insertMarkdown('- '); }
  insertNumberedList() { this.insertMarkdown('1. '); }
  insertLink() { this.insertMarkdown('[', '](url)'); }
  insertQuote() { this.insertMarkdown('> '); }
  insertCode() { this.insertMarkdown('`', '`'); }
  insertHr() { this.insertMarkdown('\n---\n'); }

  // Parse markdown to HTML
  parseMarkdown(text: string): string {
    if (!text) return '';
    
    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Bold & Italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr>')
      // Blockquote
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered list
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Ordered list
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    // Wrap consecutive li in ul
    html = html.replace(/(<li>.*?<\/li>)(<br>)?/g, '$1');
    
    return html;
  }

  // ========== ESPANDI/COMPRIMI ==========
  
  toggleExpand(noteId: number) {
    const current = this.expandedNotes();
    const newSet = new Set(current);
    if (newSet.has(noteId)) {
      newSet.delete(noteId);
    } else {
      newSet.add(noteId);
    }
    this.expandedNotes.set(newSet);
  }

  isExpanded(noteId: number): boolean {
    return this.expandedNotes().has(noteId);
  }

  shouldTruncate(content: string): boolean {
    return content.length > this.maxPreviewLength;
  }

  getPreviewContent(content: string): string {
    if (content.length <= this.maxPreviewLength) {
      return content;
    }
    // Tronca alla parola più vicina
    const truncated = content.substring(0, this.maxPreviewLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  expandAll() {
    const allIds = new Set(this.filteredNotes().map(n => n.id!));
    this.expandedNotes.set(allIds);
  }

  collapseAll() {
    this.expandedNotes.set(new Set());
  }

  // Toggle pin nota
  async togglePin(note: PlayerNote) {
    await this.db.updateNote(note.id!, {
      pinned: !note.pinned
    });
    await this.loadNotes();
  }

  // Cambia colore nota veloce
  async changeNoteColor(note: PlayerNote, color: string) {
    await this.db.updateNote(note.id!, { color });
    await this.loadNotes();
  }

  // Ottieni colore hex
  getColorHex(colorId: string): string {
    return NOTE_COLORS.find(c => c.id === colorId)?.hex || '#d4af37';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Gestione filtri
  toggleTag(tag: string) {
    const current = this.selectedTags();
    if (current.includes(tag)) {
      this.selectedTags.set(current.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...current, tag]);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedTags.set([]);
    this.selectedColor.set('');
    this.sortBy.set('newest');
  }

  hasActiveFilters(): boolean {
    return this.searchQuery().length > 0 || 
           this.selectedTags().length > 0 || 
           this.selectedColor().length > 0 ||
           this.sortBy() !== 'newest';
  }

  // ========== MOBILE UX ==========
  
  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  // Swipe handlers
  onTouchStart(event: TouchEvent, noteId: number) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent, note: PlayerNote) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const diffX = this.touchStartX - touchEndX;
    const diffY = Math.abs(this.touchStartY - touchEndY);
    
    // Solo swipe orizzontale (non verticale)
    if (Math.abs(diffX) > 60 && diffY < 50) {
      if (diffX > 0) {
        // Swipe left - mostra azioni
        this.swipedNoteId.set(note.id!);
      } else {
        // Swipe right - nascondi azioni
        this.swipedNoteId.set(null);
      }
    }
  }

  isNoteSwiped(noteId: number): boolean {
    return this.swipedNoteId() === noteId;
  }

  closeSwipeActions() {
    this.swipedNoteId.set(null);
  }

  // Quick actions from swipe
  async quickPin(note: PlayerNote) {
    await this.togglePin(note);
    this.closeSwipeActions();
  }

  async quickDelete(note: PlayerNote) {
    if (confirm(`Eliminare "${note.title}"?`)) {
      await this.db.deleteNote(note.id!);
      await this.loadNotes();
    }
    this.closeSwipeActions();
  }

  quickEdit(note: PlayerNote) {
    this.closeSwipeActions();
    this.openEditForm(note);
  }

  // ========== ENTITY LINKING ==========
  
  toggleEntitySelector() {
    this.showEntitySelector.set(!this.showEntitySelector());
    if (this.showEntitySelector()) {
      this.entitySearchQuery.set('');
    }
  }

  addLinkedEntity(entityId: string) {
    const current = this.noteLinkedEntities();
    if (!current.includes(entityId)) {
      this.noteLinkedEntities.set([...current, entityId]);
    }
    this.entitySearchQuery.set('');
  }

  removeLinkedEntity(entityId: string) {
    this.noteLinkedEntities.set(
      this.noteLinkedEntities().filter(id => id !== entityId)
    );
  }

  getEntityById(entityId: string): StoryEntity | undefined {
    return this.allEntities().find(e => e.id === entityId);
  }

  getEntityIcon(type: StoryEntity['type']): string {
    const icons: Record<StoryEntity['type'], string> = {
      character: '🧑',
      location: '📍',
      event: '📅',
      organization: '🏛️'
    };
    return icons[type] || '📌';
  }

  getEntityColor(type: StoryEntity['type']): string {
    const colors: Record<StoryEntity['type'], string> = {
      character: '#4ade80',
      location: '#60a5fa',
      event: '#f472b6',
      organization: '#a78bfa'
    };
    return colors[type] || '#d4af37';
  }

  showEntityPreview(entity: StoryEntity) {
    this.selectedEntityPreview.set(entity);
  }

  closeEntityPreview() {
    this.selectedEntityPreview.set(null);
  }

  goBack() {
    this.router.navigate([this.character(), 'home']);
  }
}
