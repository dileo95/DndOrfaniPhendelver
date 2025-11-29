import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastContainer } from './components/toast-container/toast-container';
import { OfflineIndicator } from './components/offline-indicator/offline-indicator';
import { VoiceButton } from './components/voice-button/voice-button';
import { VoiceHelpModal } from './components/voice-help-modal/voice-help-modal';
import { UpdateService } from './services/update.service';
import { VoiceService } from './services/voice.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, OfflineIndicator, VoiceButton, VoiceHelpModal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-phendelver');
  private platformId = inject(PLATFORM_ID);
  private updateService = inject(UpdateService); // Inizializza il servizio aggiornamenti
  private voiceService = inject(VoiceService);   // Inizializza il servizio vocale
  
  constructor(private router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      // Reset scroll position on route change
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event) => {
        window.scrollTo(0, 0);
        
        // Traccia il personaggio corrente dalla URL
        const url = (event as NavigationEnd).urlAfterRedirects;
        const match = url.match(/^\/(asriel|ruben|ravel|auryn)\//i);
        if (match) {
          this.voiceService.setCurrentCharacter(match[1].toLowerCase());
        } else {
          this.voiceService.setCurrentCharacter(null);
        }
      });
    }
  }
}
