import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from './toast.service';

export interface SyncStatus {
  lastSyncTime: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private platformId = inject(PLATFORM_ID);
  private toast = inject(ToastService);

  // Stato online/offline
  isOnline = signal(true);
  
  // Stato sincronizzazione
  syncStatus = signal<SyncStatus>({
    lastSyncTime: null,
    pendingChanges: 0,
    isSyncing: false
  });

  // Computed per stato complessivo
  connectionStatus = computed(() => {
    if (!this.isOnline()) return 'offline';
    if (this.syncStatus().isSyncing) return 'syncing';
    if (this.syncStatus().pendingChanges > 0) return 'pending';
    return 'online';
  });

  // Icona per lo stato
  statusIcon = computed(() => {
    switch (this.connectionStatus()) {
      case 'offline': return '📴';
      case 'syncing': return '🔄';
      case 'pending': return '⏳';
      case 'online': return '🟢';
      default: return '❓';
    }
  });

  // Testo per lo stato
  statusText = computed(() => {
    switch (this.connectionStatus()) {
      case 'offline': return 'Offline';
      case 'syncing': return 'Sincronizzazione...';
      case 'pending': return `${this.syncStatus().pendingChanges} modifiche in attesa`;
      case 'online': return 'Online';
      default: return 'Sconosciuto';
    }
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeOnlineDetection();
      this.loadSyncStatus();
    }
  }

  private initializeOnlineDetection() {
    // Imposta stato iniziale
    this.isOnline.set(navigator.onLine);

    // Ascolta eventi online/offline
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.toast.success('🌐 Connessione ripristinata!');
      this.attemptSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      this.toast.warning('📴 Sei offline. Le modifiche saranno salvate localmente.');
    });
  }

  private loadSyncStatus() {
    try {
      const stored = localStorage.getItem('phendelver_sync_status');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.syncStatus.set({
          ...parsed,
          lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null,
          isSyncing: false
        });
      }
    } catch (e) {
      console.error('Errore caricamento sync status:', e);
    }
  }

  private saveSyncStatus() {
    try {
      localStorage.setItem('phendelver_sync_status', JSON.stringify(this.syncStatus()));
    } catch (e) {
      console.error('Errore salvataggio sync status:', e);
    }
  }

  /** Registra una modifica pendente */
  registerPendingChange() {
    this.syncStatus.update(status => ({
      ...status,
      pendingChanges: status.pendingChanges + 1
    }));
    this.saveSyncStatus();
  }

  /** Segna che una modifica è stata sincronizzata */
  markChangesSynced(count: number = 1) {
    this.syncStatus.update(status => ({
      ...status,
      pendingChanges: Math.max(0, status.pendingChanges - count),
      lastSyncTime: new Date()
    }));
    this.saveSyncStatus();
  }

  /** Tenta la sincronizzazione quando torna online */
  async attemptSync() {
    const status = this.syncStatus();
    if (status.pendingChanges === 0 || status.isSyncing) return;

    this.syncStatus.update(s => ({ ...s, isSyncing: true }));

    try {
      // In futuro qui puoi aggiungere la logica di sync con un backend
      // Per ora, i dati sono già in IndexedDB, quindi li consideriamo sincronizzati
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula sync
      
      const pendingCount = status.pendingChanges;
      this.syncStatus.update(s => ({
        ...s,
        pendingChanges: 0,
        lastSyncTime: new Date(),
        isSyncing: false
      }));
      
      this.toast.success(`✅ ${pendingCount} modifiche sincronizzate!`);
      this.saveSyncStatus();
    } catch (error) {
      console.error('Errore sincronizzazione:', error);
      this.syncStatus.update(s => ({ ...s, isSyncing: false }));
      this.toast.error('❌ Errore durante la sincronizzazione');
    }
  }

  /** Resetta lo stato di sincronizzazione */
  resetSyncStatus() {
    this.syncStatus.set({
      lastSyncTime: null,
      pendingChanges: 0,
      isSyncing: false
    });
    this.saveSyncStatus();
  }

  /** Formatta l'ultimo sync per la UI */
  getLastSyncFormatted(): string {
    const lastSync = this.syncStatus().lastSyncTime;
    if (!lastSync) return 'Mai sincronizzato';
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ora';
    if (minutes < 60) return `${minutes} min fa`;
    if (hours < 24) return `${hours} ore fa`;
    return `${days} giorni fa`;
  }
}
