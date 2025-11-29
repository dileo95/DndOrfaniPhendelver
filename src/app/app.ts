import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastContainer } from './components/toast-container/toast-container';
import { OfflineIndicator } from './components/offline-indicator/offline-indicator';
import { UpdateService } from './services/update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, OfflineIndicator],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-phendelver');
  private platformId = inject(PLATFORM_ID);
  private updateService = inject(UpdateService); // Inizializza il servizio aggiornamenti
  
  constructor(private router: Router) {
    // Reset scroll position on route change
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.scrollTo(0, 0);
      });
    }
  }
}
