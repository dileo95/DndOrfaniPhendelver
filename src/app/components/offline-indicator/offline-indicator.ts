import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../services/offline.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-indicator" 
         [class]="'status-' + offline.connectionStatus()"
         [title]="getTooltip()">
      <span class="status-icon">{{ offline.statusIcon() }}</span>
      <span class="status-text">{{ offline.statusText() }}</span>
      
      @if (offline.connectionStatus() === 'offline') {
        <div class="offline-banner">
          I dati vengono salvati localmente. 
          La sincronizzazione avverrà quando tornerai online.
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 9999;
    }

    .offline-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-family: 'MorrisRoman', serif;
      transition: all 0.3s ease;
      cursor: default;
      position: relative;
      backdrop-filter: blur(5px);
    }

    .status-icon {
      font-size: 1rem;
    }

    .status-text {
      white-space: nowrap;
    }

    /* Stati */
    .status-online {
      background: rgba(39, 174, 96, 0.2);
      color: #27ae60;
      border: 1px solid rgba(39, 174, 96, 0.3);
    }

    .status-offline {
      background: rgba(231, 76, 60, 0.2);
      color: #e74c3c;
      border: 1px solid rgba(231, 76, 60, 0.3);
    }

    .status-syncing {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
      border: 1px solid rgba(52, 152, 219, 0.3);
    }

    .status-syncing .status-icon {
      animation: spin 1s linear infinite;
    }

    .status-pending {
      background: rgba(241, 196, 15, 0.2);
      color: #f1c40f;
      border: 1px solid rgba(241, 196, 15, 0.3);
    }

    .offline-banner {
      position: absolute;
      bottom: 100%;
      right: 0;
      margin-bottom: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(30, 20, 10, 0.95);
      border: 1px solid #d4af37;
      border-radius: 8px;
      color: #d4af37;
      font-size: 0.75rem;
      white-space: normal;
      max-width: 220px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .offline-banner::before {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 15px;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #d4af37;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 600px) {
      .status-text {
        display: none;
      }
      
      .offline-indicator {
        padding: 0.25rem 0.5rem;
      }
    }
  `]
})
export class OfflineIndicator {
  offline = inject(OfflineService);

  getTooltip(): string {
    const lastSync = this.offline.getLastSyncFormatted();
    return `Ultimo sync: ${lastSync}`;
  }
}
