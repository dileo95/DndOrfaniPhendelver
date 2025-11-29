import { Injectable, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  callback: () => void;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon: string;
  duration: number;
  action?: ToastAction;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  private icons: Record<Toast['type'], string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  show(message: string, type: Toast['type'] = 'info', duration = 3000, action?: ToastAction): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      icon: this.icons[type],
      duration,
      action
    };

    this.toasts.update(t => [...t, toast]);

    // Auto-remove dopo la durata (0 = persistente, richiede click manuale)
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  success(message: string, duration = 3000, action?: ToastAction): void {
    this.show(message, 'success', duration, action);
  }

  error(message: string, duration = 4000, action?: ToastAction): void {
    this.show(message, 'error', duration, action);
  }

  warning(message: string, duration = 3500, action?: ToastAction): void {
    this.show(message, 'warning', duration, action);
  }

  info(message: string, duration = 3000, action?: ToastAction): void {
    this.show(message, 'info', duration, action);
  }

  remove(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
