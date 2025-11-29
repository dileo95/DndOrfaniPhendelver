import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast toast-{{ toast.type }}"
          [class.toast-visible]="true"
          [class.toast-persistent]="toast.duration === 0"
        >
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          @if (toast.action) {
            <button class="toast-action" (click)="handleAction(toast)">
              {{ toast.action.label }}
            </button>
          }
          <button class="toast-close" (click)="toastService.remove(toast.id); $event.stopPropagation()">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      color: #f5f5f5;
      font-family: 'Cinzel', serif;
      font-size: 14px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out forwards;
      opacity: 0;
      transform: translateX(100%);
    }

    .toast-visible {
      opacity: 1;
      transform: translateX(0);
    }

    .toast-persistent {
      border-width: 2px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2);
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      line-height: 1.4;
      word-break: break-word;
    }

    .toast-action {
      background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
      border: none;
      color: #1a1a2e;
      font-family: 'Cinzel', serif;
      font-size: 12px;
      font-weight: bold;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .toast-action:hover {
      background: linear-gradient(135deg, #e5c04a 0%, #c9a73f 100%);
      transform: scale(1.05);
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 20px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: #fff;
    }

    .toast-success {
      border-color: rgba(39, 174, 96, 0.5);
      background: linear-gradient(135deg, #1a2e1a 0%, #163e2a 100%);
    }

    .toast-error {
      border-color: rgba(231, 76, 60, 0.5);
      background: linear-gradient(135deg, #2e1a1a 0%, #3e1616 100%);
    }

    .toast-warning {
      border-color: rgba(241, 196, 15, 0.5);
      background: linear-gradient(135deg, #2e2a1a 0%, #3e3216 100%);
    }

    .toast-info {
      border-color: rgba(52, 152, 219, 0.5);
      background: linear-gradient(135deg, #1a1a2e 0%, #162e3e 100%);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        font-size: 13px;
        padding: 12px 14px;
      }

      .toast-action {
        font-size: 11px;
        padding: 5px 10px;
      }
    }
  `]
})
export class ToastContainer {
  toastService = inject(ToastService);

  handleAction(toast: Toast) {
    if (toast.action) {
      toast.action.callback();
    }
    this.toastService.remove(toast.id);
  }
}
