import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface Character {
  name: string;
  pin: string;
  route: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly characters: Character[] = [
    { name: 'Asriel', pin: '4567', route: 'asriel' },
    { name: 'Auryn', pin: '0606', route: 'auryn' },
    { name: 'Ravel', pin: '4690', route: 'ravel' },
    { name: 'Ruben', pin: '8995', route: 'ruben' }
  ];

  // Stato autenticazione per ogni personaggio
  private authenticatedCharacters = signal<Set<string>>(new Set());

  constructor(private router: Router) {}

  /**
   * Valida il PIN per un personaggio specifico
   */
  validatePin(characterName: string, pin: string): boolean {
    const character = this.characters.find(c => c.name === characterName);
    if (character && character.pin === pin) {
      // Aggiungi il personaggio autenticato
      const current = this.authenticatedCharacters();
      current.add(characterName);
      this.authenticatedCharacters.set(new Set(current));
      return true;
    }
    return false;
  }

  /**
   * Verifica se un personaggio è autenticato
   */
  isAuthenticated(characterName: string): boolean {
    return this.authenticatedCharacters().has(characterName);
  }

  /**
   * Ottiene il personaggio per nome
   */
  getCharacter(name: string): Character | undefined {
    return this.characters.find(c => c.name === name);
  }

  /**
   * Ottiene il personaggio per route
   */
  getCharacterByRoute(route: string): Character | undefined {
    return this.characters.find(c => c.route === route);
  }

  /**
   * Ottiene tutti i personaggi
   */
  getAllCharacters(): Character[] {
    return this.characters;
  }

  /**
   * Logout per un personaggio
   */
  logout(characterName: string): void {
    const current = this.authenticatedCharacters();
    current.delete(characterName);
    this.authenticatedCharacters.set(new Set(current));
  }

  /**
   * Logout completo
   */
  logoutAll(): void {
    this.authenticatedCharacters.set(new Set());
  }
}
