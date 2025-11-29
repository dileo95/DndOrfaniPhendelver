import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService } from '../../services/voice.service';

@Component({
  selector: 'app-voice-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (voice.isSupported()) {
      <button 
        class="voice-button"
        [class.listening]="voice.isListening()"
        [class.has-character]="voice.currentCharacter()"
        (click)="voice.toggle()"
        [title]="voice.isListening() ? 'Clicca per disattivare' : 'Clicca per attivare comandi vocali'"
      >
        @if (voice.isListening()) {
          <span class="mic-icon listening">🎤</span>
          <span class="pulse"></span>
        } @else {
          <span class="mic-icon">🎙️</span>
        }
      </button>
      
      @if (voice.isListening() && voice.lastCommand()) {
        <div class="last-command">
          "{{ voice.lastCommand() }}"
        </div>
      }
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 80px;
      left: 20px;
      z-index: 999;
    }

    .voice-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid rgba(212, 175, 55, 0.4);
      background: rgba(44, 24, 16, 0.9);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .voice-button:hover {
      transform: scale(1.1);
      border-color: #d4af37;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }

    .voice-button.listening {
      background: linear-gradient(135deg, #cc0000, #ff3333);
      border-color: #ff6666;
      animation: glow 1.5s ease-in-out infinite;
    }

    .voice-button.has-character {
      border-color: rgba(212, 175, 55, 0.6);
    }

    .mic-icon {
      font-size: 24px;
      filter: grayscale(50%);
      transition: filter 0.3s;
    }

    .mic-icon.listening {
      filter: none;
      animation: bounce 0.5s ease-in-out infinite alternate;
    }

    .pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 0, 0, 0.3);
      animation: pulse 1.5s ease-out infinite;
    }

    .last-command {
      position: absolute;
      bottom: 65px;
      left: 0;
      background: rgba(0, 0, 0, 0.85);
      color: #d4af37;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      border: 1px solid rgba(212, 175, 55, 0.3);
      animation: fadeIn 0.3s ease;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.5;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }

    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.5), 0 0 20px rgba(255, 0, 0, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.5);
      }
    }

    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-3px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile */
    @media (max-width: 768px) {
      :host {
        bottom: 100px;
        left: 15px;
      }

      .voice-button {
        width: 48px;
        height: 48px;
      }

      .mic-icon {
        font-size: 20px;
      }
    }
  `]
})
export class VoiceButton {
  voice = inject(VoiceService);
}
