import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Scroll {
  private platformId = inject(PLATFORM_ID);
  private lastScrollY = 0;

  /**
   * Disabilita lo scroll della pagina
   */
  disable(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.lastScrollY = window.scrollY;
    const body = document.body;

    // Aggiungi classe no-scroll al body
    body.classList.add('no-scroll');
    
    // Blocca lo scroll usando overflow
    body.style.position = 'fixed';
    body.style.top = `-${this.lastScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
  }

  /**
   * Abilita lo scroll della pagina
   */
  enable(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const body = document.body;

    // Rimuovi classe no-scroll
    body.classList.remove('no-scroll');
    
    // Ripristina stili
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.overflow = '';

    // Ripristina la posizione di scroll
    window.scrollTo(0, this.lastScrollY);
  }

  /**
   * Toggle scroll
   */
  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const body = document.body;
    if (body.classList.contains('no-scroll')) {
      this.enable();
    } else {
      this.disable();
    }
  }
}
