import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, PlayerNote } from '../../services/database.service';

@Component({
  selector: 'app-player-notes',
  imports: [CommonModule, FormsModule],
  templateUrl: './player-notes.html',
  styleUrl: './player-notes.scss'
})
export class PlayerNotes implements OnInit {
  character = signal<string>('');
  notes = signal<PlayerNote[]>([]);
  
  // Form per nuova nota
  showForm = signal(false);
  editingNote = signal<PlayerNote | null>(null);
  noteTitle = signal('');
  noteContent = signal('');
  noteTags = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.character.set(this.route.snapshot.paramMap.get('character') || '');
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
  }

  openEditForm(note: PlayerNote) {
    this.showForm.set(true);
    this.editingNote.set(note);
    this.noteTitle.set(note.title);
    this.noteContent.set(note.content);
    this.noteTags.set(note.tags?.join(', ') || '');
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

    if (this.editingNote()) {
      // Modifica nota esistente
      await this.db.updateNote(this.editingNote()!.id!, {
        title,
        content,
        tags
      });
    } else {
      // Nuova nota
      await this.db.addNote({
        character: this.character(),
        title,
        content,
        tags
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

  goBack() {
    this.router.navigate([this.character(), 'home']);
  }
}
