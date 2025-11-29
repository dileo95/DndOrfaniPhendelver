import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private platformId = inject(PLATFORM_ID);
  private swUpdate = inject(SwUpdate);
  private toast = inject(ToastService);

  constructor() {
    if (isPlatformBrowser(this.platformId) && this.swUpdate.isEnabled) {
      this.checkForUpdates();
    }
  }

  private checkForUpdates() {
    // Ascolta quando una nuova versione è pronta
    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(event => {
        console.log('🆕 Nuova versione disponibile:', event.latestVersion);
        this.notifyUpdate();
      });

    // Controlla aggiornamenti ogni 5 minuti
    setInterval(() => {
      this.swUpdate.checkForUpdate().catch(err => 
        console.error('Errore controllo aggiornamenti:', err)
      );
    }, 5 * 60 * 1000);
  }

  private async notifyUpdate() {
    // Imposta badge sull'icona PWA
    this.setBadge(1);

    // Mostra toast con azione per aggiornare
    this.toast.info(
      '🆕 Nuova versione disponibile!',
      0, // Persistente
      {
        label: 'Aggiorna',
        callback: () => this.applyUpdate()
      }
    );
  }

  /** Imposta il badge sull'icona PWA */
  private async setBadge(count: number) {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if ('setAppBadge' in navigator) {
        await (navigator as any).setAppBadge(count);
      }
    } catch (error) {
      console.warn('Badge API non supportata:', error);
    }
  }

  /** Rimuove il badge dall'icona PWA */
  async clearBadge() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if ('clearAppBadge' in navigator) {
        await (navigator as any).clearAppBadge();
      }
    } catch (error) {
      console.warn('Badge API non supportata:', error);
    }
  }

  /** Applica l'aggiornamento e ricarica l'app */
  async applyUpdate() {
    try {
      await this.swUpdate.activateUpdate();
      this.clearBadge();
      window.location.reload();
    } catch (error) {
      console.error('Errore durante l\'aggiornamento:', error);
      this.toast.error('Errore durante l\'aggiornamento. Ricarica manualmente.');
    }
  }

  /** Forza il controllo di nuovi aggiornamenti */
  async checkNow(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) return false;
    
    try {
      return await this.swUpdate.checkForUpdate();
    } catch (error) {
      console.error('Errore controllo aggiornamenti:', error);
      return false;
    }
  }
}
