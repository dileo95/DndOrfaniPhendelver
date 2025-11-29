import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService, VoiceCommand } from '../../services/voice.service';

@Component({
  selector: 'app-voice-help-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">×</button>
          
          <h2>🎤 Comandi Vocali</h2>
          <p class="subtitle">
            Clicca sul microfono e pronuncia un comando. 
            @if (!voice.currentCharacter()) {
              <span class="warning">⚠️ Alcuni comandi richiedono un personaggio selezionato.</span>
            }
          </p>

          <!-- Tabs -->
          <div class="tabs">
            <button 
              [class.active]="activeTab() === 'dice'"
              (click)="activeTab.set('dice')"
            >🎲 Dadi</button>
            <button 
              [class.active]="activeTab() === 'info'"
              (click)="activeTab.set('info')"
            >📊 Info</button>
            <button 
              [class.active]="activeTab() === 'navigation'"
              (click)="activeTab.set('navigation')"
            >🧭 Navigazione</button>
            <button 
              [class.active]="activeTab() === 'combat'"
              (click)="activeTab.set('combat')"
            >⚔️ Combattimento</button>
            <button 
              [class.active]="activeTab() === 'utility'"
              (click)="activeTab.set('utility')"
            >🔧 Utility</button>
          </div>

          <!-- Commands List -->
          <div class="commands-list">
            @for (cmd of getFilteredCommands(); track cmd.action) {
              <div class="command-item" [class.requires-character]="cmd.requiresCharacter">
                <div class="command-patterns">
                  @for (pattern of cmd.patterns.slice(0, 2); track pattern) {
                    <span class="pattern">"{{ pattern }}"</span>
                  }
                </div>
                <div class="command-description">
                  {{ cmd.description }}
                  @if (cmd.requiresCharacter) {
                    <span class="badge">👤</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Tips -->
          <div class="tips">
            <h4>💡 Suggerimenti</h4>
            <ul>
              <li>Parla chiaramente e a volume normale</li>
              <li>I comandi con 👤 richiedono un personaggio selezionato</li>
              <li>Puoi dire "stop" o "basta" per disattivare l'ascolto</li>
              <li>L'app risponde anche vocalmente ai tuoi comandi!</li>
            </ul>
          </div>

          <!-- Try it -->
          <div class="try-section">
            <p>Prova subito!</p>
            <button class="try-btn" (click)="startListening()">
              @if (voice.isListening()) {
                🔴 In ascolto...
              } @else {
                🎤 Attiva microfono
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
      border: 2px solid #d4af37;
      border-radius: 1rem;
      max-width: 700px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.5rem;
      position: relative;
      animation: slideUp 0.3s ease;
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(212, 175, 55, 0.2);
      border: 2px solid rgba(212, 175, 55, 0.4);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 1.3rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #d4af37;
      color: #1a0f0a;
    }

    h2 {
      color: #d4af37;
      font-family: 'MorrisRoman', serif;
      font-size: 1.8rem;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .warning {
      color: #ff9900;
      display: block;
      margin-top: 0.5rem;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }

    .tabs button {
      padding: 0.5rem 1rem;
      background: rgba(44, 24, 16, 0.6);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 2rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tabs button:hover {
      background: rgba(74, 47, 31, 0.8);
      border-color: #d4af37;
    }

    .tabs button.active {
      background: #d4af37;
      color: #1a0f0a;
      border-color: #d4af37;
    }

    .commands-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .command-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 0.5rem;
      border-left: 3px solid #d4af37;
    }

    .command-item.requires-character {
      border-left-color: #ff9900;
    }

    .command-patterns {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pattern {
      background: rgba(212, 175, 55, 0.2);
      color: #d4af37;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.85rem;
      font-family: monospace;
    }

    .command-description {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      text-align: right;
    }

    .badge {
      margin-left: 0.5rem;
      font-size: 0.8rem;
    }

    .tips {
      background: rgba(0, 0, 0, 0.2);
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .tips h4 {
      color: #d4af37;
      margin: 0 0 0.5rem 0;
    }

    .tips ul {
      margin: 0;
      padding-left: 1.5rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .tips li {
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .try-section {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
    }

    .try-section p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
    }

    .try-btn {
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #d4af37, #b8942d);
      border: none;
      border-radius: 2rem;
      color: #1a0f0a;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .try-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile */
    @media (max-width: 600px) {
      .modal-content {
        padding: 1rem;
      }

      h2 {
        font-size: 1.4rem;
      }

      .tabs button {
        padding: 0.4rem 0.7rem;
        font-size: 0.75rem;
      }

      .command-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .command-description {
        text-align: left;
      }

      .commands-list {
        max-height: 200px;
      }
    }
  `]
})
export class VoiceHelpModal {
  voice = inject(VoiceService);
  
  isOpen = signal(false);
  activeTab = signal<'dice' | 'info' | 'navigation' | 'combat' | 'utility'>('dice');

  constructor() {
    // Registra callback per aprire questo modale
    this.voice.registerAction('show_help_modal', () => this.open());
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  getFilteredCommands(): VoiceCommand[] {
    return this.voice.commands.filter(cmd => cmd.category === this.activeTab());
  }

  startListening() {
    if (!this.voice.isListening()) {
      this.voice.start();
    }
  }
}
