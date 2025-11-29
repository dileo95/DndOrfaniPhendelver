import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  scope?: 'global' | 'combat' | 'dice' | 'sheet' | 'modal';
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private activeScope: string = 'global';
  private modalOpen = false;
  private enabled = true;
  
  // Callback per chiusura modali
  private closeModalCallback: (() => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initKeyboardListener();
      this.trackRouteChanges();
      this.registerDefaultShortcuts();
    }
  }

  private initKeyboardListener(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.enabled) return;
      
      // Non intercettare se si sta scrivendo in un input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Permetti solo ESC negli input
        if (event.key !== 'Escape') return;
      }
      
      this.handleKeyPress(event);
    });
  }

  private trackRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      
      // Determina lo scope in base alla route
      if (url.includes('/combat')) {
        this.activeScope = 'combat';
      } else if (url.includes('/dadi')) {
        this.activeScope = 'dice';
      } else if (url.includes('/scheda')) {
        this.activeScope = 'sheet';
      } else {
        this.activeScope = 'global';
      }
    });
  }

  private registerDefaultShortcuts(): void {
    // === SHORTCUTS GLOBALI ===
    
    // ESC - Chiudi modal/torna indietro
    this.register({
      key: 'Escape',
      description: 'Chiudi modale / Torna indietro',
      scope: 'global',
      action: () => {
        if (this.modalOpen && this.closeModalCallback) {
          this.closeModalCallback();
        } else {
          // Naviga indietro
          window.history.back();
        }
      }
    });

    // ? - Mostra aiuto shortcuts
    this.register({
      key: '?',
      shift: true,
      description: 'Mostra scorciatoie tastiera',
      scope: 'global',
      action: () => {
        this.showShortcutsHelp();
      }
    });

    // H - Vai alla home
    this.register({
      key: 'h',
      description: 'Vai alla Home',
      scope: 'global',
      action: () => {
        const currentUrl = this.router.url;
        const match = currentUrl.match(/^\/([^\/]+)/);
        if (match) {
          this.router.navigate([match[1], 'home']);
        }
      }
    });

    // D - Vai ai dadi
    this.register({
      key: 'd',
      description: 'Apri Dice Roller',
      scope: 'global',
      action: () => {
        const currentUrl = this.router.url;
        const match = currentUrl.match(/^\/([^\/]+)/);
        if (match) {
          this.router.navigate([match[1], 'dadi']);
        }
      }
    });

    // S - Vai alla scheda
    this.register({
      key: 's',
      description: 'Apri Scheda Personaggio',
      scope: 'global',
      action: () => {
        const currentUrl = this.router.url;
        const match = currentUrl.match(/^\/([^\/]+)/);
        if (match) {
          this.router.navigate([match[1], 'scheda']);
        }
      }
    });

    // C - Vai al combat
    this.register({
      key: 'c',
      description: 'Apri Combat',
      scope: 'global',
      action: () => {
        const currentUrl = this.router.url;
        const match = currentUrl.match(/^\/([^\/]+)/);
        if (match) {
          this.router.navigate([match[1], 'combat']);
        }
      }
    });

    // N - Vai alle note
    this.register({
      key: 'n',
      description: 'Apri Note',
      scope: 'global',
      action: () => {
        const currentUrl = this.router.url;
        const match = currentUrl.match(/^\/([^\/]+)/);
        if (match) {
          this.router.navigate([match[1], 'note']);
        }
      }
    });

    // === SHORTCUTS DICE ===
    
    // Space/Enter - Lancia dado
    this.register({
      key: ' ',
      description: 'Lancia il dado',
      scope: 'dice',
      action: () => {
        const rollBtn = document.querySelector('.roll-btn.normal') as HTMLButtonElement;
        if (rollBtn && !rollBtn.disabled) {
          rollBtn.click();
        }
      }
    });

    // 1-7 - Seleziona tipo dado
    ['4', '6', '8', '10', '12', '20', '100'].forEach((sides, index) => {
      this.register({
        key: String(index + 1),
        description: `Seleziona d${sides}`,
        scope: 'dice',
        action: () => {
          const diceButtons = document.querySelectorAll('.dice-option') as NodeListOf<HTMLButtonElement>;
          if (diceButtons[index]) {
            diceButtons[index].click();
          }
        }
      });
    });

    // A - Vantaggio
    this.register({
      key: 'a',
      description: 'Tira con Vantaggio',
      scope: 'dice',
      action: () => {
        const advBtn = document.querySelector('.roll-btn.advantage') as HTMLButtonElement;
        if (advBtn && !advBtn.disabled) {
          advBtn.click();
        }
      }
    });

    // Z - Svantaggio
    this.register({
      key: 'z',
      description: 'Tira con Svantaggio',
      scope: 'dice',
      action: () => {
        const disBtn = document.querySelector('.roll-btn.disadvantage') as HTMLButtonElement;
        if (disBtn && !disBtn.disabled) {
          disBtn.click();
        }
      }
    });

    // === SHORTCUTS COMBAT ===

    // 1 - Attacco arma
    this.register({
      key: '1',
      description: 'Attacco con arma',
      scope: 'combat',
      action: () => {
        const weaponBtn = document.querySelector('.action-weapon') as HTMLButtonElement;
        if (weaponBtn && !weaponBtn.disabled) {
          weaponBtn.click();
        }
      }
    });

    // 2 - Magia
    this.register({
      key: '2',
      description: 'Lancia magia',
      scope: 'combat',
      action: () => {
        const spellBtn = document.querySelector('.action-spell') as HTMLButtonElement;
        if (spellBtn && !spellBtn.disabled) {
          spellBtn.click();
        }
      }
    });

    // 3 - Difendi
    this.register({
      key: '3',
      description: 'Azione Difesa',
      scope: 'combat',
      action: () => {
        const defendBtn = document.querySelector('.action-defend') as HTMLButtonElement;
        if (defendBtn && !defendBtn.disabled) {
          defendBtn.click();
        }
      }
    });

    // 4 - Pozione
    this.register({
      key: '4',
      description: 'Usa Pozione',
      scope: 'combat',
      action: () => {
        const potionBtn = document.querySelector('.action-potion') as HTMLButtonElement;
        if (potionBtn && !potionBtn.disabled) {
          potionBtn.click();
        }
      }
    });

    // R - Riposo
    this.register({
      key: 'r',
      description: 'Riposo',
      scope: 'combat',
      action: () => {
        const restBtn = document.querySelector('.action-rest') as HTMLButtonElement;
        if (restBtn) {
          restBtn.click();
        }
      }
    });

    // === SHORTCUTS SHEET ===

    // E - Edit mode
    this.register({
      key: 'e',
      description: 'Attiva/Disattiva modifica',
      scope: 'sheet',
      action: () => {
        const editBtn = document.querySelector('.edit-toggle') as HTMLButtonElement;
        if (editBtn) {
          editBtn.click();
        }
      }
    });

    // Ctrl+S - Salva
    this.register({
      key: 's',
      ctrl: true,
      description: 'Salva scheda',
      scope: 'sheet',
      action: () => {
        const saveBtn = document.querySelector('.save-btn') as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.click();
        }
      }
    });
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const key = this.getShortcutKey(event);
    const shortcut = this.shortcuts.get(key);
    
    if (!shortcut) return;
    
    // Verifica scope
    if (shortcut.scope && shortcut.scope !== 'global' && shortcut.scope !== this.activeScope) {
      // Se c'è un modal aperto, permetti solo shortcuts globali
      if (this.modalOpen && shortcut.scope !== 'modal') return;
      return;
    }
    
    // Previeni azione default del browser
    event.preventDefault();
    event.stopPropagation();
    
    // Esegui l'azione
    shortcut.action();
  }

  private getShortcutKey(event: KeyboardEvent): string {
    let key = '';
    if (event.ctrlKey || event.metaKey) key += 'ctrl+';
    if (event.altKey) key += 'alt+';
    if (event.shiftKey && event.key.length === 1) key += 'shift+';
    key += event.key.toLowerCase();
    return key;
  }

  /** Registra una nuova shortcut */
  register(shortcut: KeyboardShortcut): void {
    let key = '';
    if (shortcut.ctrl) key += 'ctrl+';
    if (shortcut.alt) key += 'alt+';
    if (shortcut.shift) key += 'shift+';
    key += shortcut.key.toLowerCase();
    
    this.shortcuts.set(key, shortcut);
  }

  /** Rimuovi una shortcut */
  unregister(key: string): void {
    this.shortcuts.delete(key);
  }

  /** Imposta callback per chiusura modale */
  setModalCloseCallback(callback: (() => void) | null): void {
    this.closeModalCallback = callback;
    this.modalOpen = callback !== null;
  }

  /** Notifica apertura/chiusura modale */
  setModalOpen(isOpen: boolean): void {
    this.modalOpen = isOpen;
    if (!isOpen) {
      this.closeModalCallback = null;
    }
  }

  /** Abilita/disabilita keyboard shortcuts */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /** Ottieni lista shortcuts per lo scope corrente */
  getShortcutsForCurrentScope(): KeyboardShortcut[] {
    const result: KeyboardShortcut[] = [];
    
    this.shortcuts.forEach((shortcut) => {
      if (!shortcut.scope || shortcut.scope === 'global' || shortcut.scope === this.activeScope) {
        result.push(shortcut);
      }
    });
    
    return result;
  }

  /** Mostra help delle shortcuts */
  private showShortcutsHelp(): void {
    const shortcuts = this.getShortcutsForCurrentScope();
    
    // Crea un toast o modal con le shortcuts
    const helpHtml = shortcuts.map(s => {
      let keyDisplay = '';
      if (s.ctrl) keyDisplay += 'Ctrl+';
      if (s.alt) keyDisplay += 'Alt+';
      if (s.shift) keyDisplay += 'Shift+';
      keyDisplay += s.key === ' ' ? 'Space' : s.key.toUpperCase();
      
      return `<div><kbd>${keyDisplay}</kbd> ${s.description}</div>`;
    }).join('');
    
    // Emetti un evento custom per mostrare l'help
    const event = new CustomEvent('keyboard-shortcuts-help', { 
      detail: { shortcuts, html: helpHtml }
    });
    document.dispatchEvent(event);
  }

  /** Ottieni la descrizione formattata di una shortcut */
  getShortcutDisplay(shortcut: KeyboardShortcut): string {
    let display = '';
    if (shortcut.ctrl) display += 'Ctrl+';
    if (shortcut.alt) display += 'Alt+';
    if (shortcut.shift) display += 'Shift+';
    display += shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
    return display;
  }
}
