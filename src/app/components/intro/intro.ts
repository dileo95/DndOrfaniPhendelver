import { Component, OnInit, signal, viewChildren, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, Character } from '../../services/auth';
import { Scroll } from '../../services/scroll';

@Component({
  selector: 'app-intro',
  imports: [FormsModule],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro implements OnInit {
  // Signals per gestire lo stato delle animazioni
  showWelcome = signal(false);
  showQuestion = signal(false);
  showButtons = signal(false);
  showDialog = signal(false);
  selectedCharacter = signal<Character | null>(null);

  // PIN inputs
  pinDigits: string[] = ['', '', '', ''];
  pinInputs = viewChildren<ElementRef<HTMLInputElement>>('pinInput');

  characters: Character[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private scroll: Scroll
  ) {
    this.characters = this.auth.getAllCharacters();
  }

  ngOnInit(): void {
    // Sequenza animazioni come in intro.js
    setTimeout(() => this.showWelcome.set(true), 1000);
    setTimeout(() => this.showQuestion.set(true), 3000);
    setTimeout(() => this.showButtons.set(true), 4000);
  }

  openPinDialog(character: Character): void {
    // Don't open dialog for disabled characters
    if (!character.enabled) {
      return;
    }
    this.selectedCharacter.set(character);
    this.showDialog.set(true);
    this.scroll.disable();
    this.resetPin();
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.selectedCharacter.set(null);
    this.scroll.enable();
    this.resetPin();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.closeDialog();
    }
  }

  getDialogBackground(characterName: string): string {
    return `url("./assets/img/${characterName}-blur.png")`;
  }

  onPinInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < 3) {
      // Focus sul prossimo input
      const inputs = this.pinInputs();
      if (inputs[index + 1]) {
        inputs[index + 1].nativeElement.focus();
      }
    }
  }

  onPinKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && this.pinDigits[index] === '' && index > 0) {
      // Focus sul precedente input
      const inputs = this.pinInputs();
      if (inputs[index - 1]) {
        inputs[index - 1].nativeElement.focus();
      }
    }
  }

  submitPin(): void {
    const enteredPin = this.pinDigits.join('');
    const character = this.selectedCharacter();
    
    if (character && this.auth.validatePin(character.name, enteredPin)) {
      this.closeDialog();
      // Naviga alla home del personaggio
      this.router.navigate([character.route, 'home']);
    } else {
      alert('PIN errato! Riprova.');
      this.resetPin();
    }
  }

  resetPin(): void {
    this.pinDigits = ['', '', '', ''];
    // Focus sul primo input
    setTimeout(() => {
      const inputs = this.pinInputs();
      if (inputs[0]) {
        inputs[0].nativeElement.focus();
      }
    }, 0);
  }

  goToForgotten(): void {

  }

  goToDiary(): void {
    this.router.navigate(['/diary']);
  }
}
