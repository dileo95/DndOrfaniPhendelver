import { Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { KeyboardService, KeyboardShortcut } from '../../services/keyboard.service';

@Component({
  selector: 'app-keyboard-help-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>⌨️ Scorciatoie Tastiera</h2>
            <button class="close-btn" (click)="close()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="shortcuts-section">
              <h3>🌐 Navigazione Globale</h3>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <kbd>H</kbd>
                  <span>Vai alla Home</span>
                </div>
                <div class="shortcut-item">
                  <kbd>D</kbd>
                  <span>Apri Dice Roller</span>
                </div>
                <div class="shortcut-item">
                  <kbd>S</kbd>
                  <span>Apri Scheda</span>
                </div>
                <div class="shortcut-item">
                  <kbd>C</kbd>
                  <span>Apri Combat</span>
                </div>
                <div class="shortcut-item">
                  <kbd>N</kbd>
                  <span>Apri Note</span>
                </div>
                <div class="shortcut-item">
                  <kbd>ESC</kbd>
                  <span>Chiudi / Indietro</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Shift</kbd> + <kbd>?</kbd>
                  <span>Mostra questo aiuto</span>
                </div>
              </div>
            </div>

            <div class="shortcuts-section">
              <h3>🎲 Dice Roller</h3>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <kbd>Space</kbd>
                  <span>Lancia il dado</span>
                </div>
                <div class="shortcut-item">
                  <kbd>1</kbd>-<kbd>7</kbd>
                  <span>Seleziona dado (d4-d100)</span>
                </div>
                <div class="shortcut-item">
                  <kbd>A</kbd>
                  <span>Tira con Vantaggio</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Z</kbd>
                  <span>Tira con Svantaggio</span>
                </div>
              </div>
            </div>

            <div class="shortcuts-section">
              <h3>⚔️ Combat</h3>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <kbd>1</kbd>
                  <span>Attacco con arma</span>
                </div>
                <div class="shortcut-item">
                  <kbd>2</kbd>
                  <span>Lancia magia</span>
                </div>
                <div class="shortcut-item">
                  <kbd>3</kbd>
                  <span>Difendi</span>
                </div>
                <div class="shortcut-item">
                  <kbd>4</kbd>
                  <span>Usa Pozione</span>
                </div>
                <div class="shortcut-item">
                  <kbd>R</kbd>
                  <span>Riposo</span>
                </div>
              </div>
            </div>

            <div class="shortcuts-section">
              <h3>📋 Scheda Personaggio</h3>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <kbd>E</kbd>
                  <span>Attiva/Disattiva modifica</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>S</kbd>
                  <span>Salva scheda</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <p class="tip">💡 Le scorciatoie funzionano quando non stai scrivendo in un campo di testo</p>
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
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: linear-gradient(145deg, #2a1810, #1a0f0a);
      border: 2px solid #d4af37;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);

      h2 {
        margin: 0;
        color: #d4af37;
        font-size: 1.4rem;
      }

      .close-btn {
        background: transparent;
        border: none;
        color: #d4af37;
        font-size: 24px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background: rgba(212, 175, 55, 0.2);
        }
      }
    }

    .modal-body {
      padding: 16px 20px;
    }

    .shortcuts-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      h3 {
        color: #f5e6c8;
        font-size: 1.1rem;
        margin: 0 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      }
    }

    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      border: 1px solid rgba(212, 175, 55, 0.15);

      span {
        color: #c9b896;
        font-size: 0.9rem;
      }
    }

    kbd {
      background: linear-gradient(180deg, #3a2820, #2a1810);
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 4px;
      padding: 4px 8px;
      font-family: monospace;
      font-size: 0.85rem;
      color: #d4af37;
      min-width: 24px;
      text-align: center;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
    }

    .modal-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(212, 175, 55, 0.3);
      
      .tip {
        margin: 0;
        color: #8a7a5a;
        font-size: 0.85rem;
        text-align: center;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 600px) {
      .modal-content {
        width: 95%;
        max-height: 90vh;
      }

      .shortcuts-grid {
        grid-template-columns: 1fr;
      }

      .modal-header h2 {
        font-size: 1.2rem;
      }
    }
  `]
})
export class KeyboardHelpModal implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private keyboard = inject(KeyboardService);
  
  isOpen = signal(false);
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Ascolta l'evento custom per aprire il modal
      document.addEventListener('keyboard-shortcuts-help', this.handleOpenEvent);
    }
  }
  
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('keyboard-shortcuts-help', this.handleOpenEvent);
    }
  }
  
  private handleOpenEvent = () => {
    this.isOpen.set(true);
    this.keyboard.setModalOpen(true);
    this.keyboard.setModalCloseCallback(() => this.close());
  };
  
  close(): void {
    this.isOpen.set(false);
    this.keyboard.setModalOpen(false);
  }
}
