import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiceAudioService {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureAudioContext(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Suono del dado che rotola
  playRollSound(): void {
    if (!this.enabled || !this.audioContext) return;
    this.ensureAudioContext();

    const duration = 2.5;
    const now = this.audioContext.currentTime;

    // Crea diversi "click" per simulare il dado che rimbalza
    for (let i = 0; i < 15; i++) {
      const time = now + (i * 0.15) + (Math.random() * 0.05);
      const volume = 0.3 - (i * 0.015); // Volume decrescente
      
      if (volume > 0) {
        this.playClick(time, volume, 200 + Math.random() * 300);
      }
    }
  }

  private playClick(time: number, volume: number, frequency: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    
    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    oscillator.start(time);
    oscillator.stop(time + 0.05);
  }

  // Suono di successo critico (nat 20)
  playCriticalSuccess(): void {
    if (!this.enabled || !this.audioContext) return;
    this.ensureAudioContext();

    const now = this.audioContext.currentTime;
    
    // Arpeggio ascendente trionfante
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      this.playNote(now + i * 0.1, freq, 0.3, 0.4);
    });

    // Accordo finale
    setTimeout(() => {
      if (!this.audioContext) return;
      const finalTime = this.audioContext.currentTime;
      this.playNote(finalTime, 523.25, 0.2, 0.6);
      this.playNote(finalTime, 659.25, 0.2, 0.6);
      this.playNote(finalTime, 783.99, 0.2, 0.6);
      this.playNote(finalTime, 1046.50, 0.25, 0.6);
    }, 500);
  }

  // Suono di fallimento critico (nat 1)
  playCriticalFail(): void {
    if (!this.enabled || !this.audioContext) return;
    this.ensureAudioContext();

    const now = this.audioContext.currentTime;
    
    // Suono discendente triste
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);

    // Secondo tono basso
    setTimeout(() => {
      if (!this.audioContext) return;
      const time = this.audioContext.currentTime;
      this.playNote(time, 130.81, 0.15, 0.4); // C3
      this.playNote(time, 155.56, 0.15, 0.4); // Eb3 (minore)
    }, 300);
  }

  // Suono normale del risultato
  playResultSound(): void {
    if (!this.enabled || !this.audioContext) return;
    this.ensureAudioContext();

    const now = this.audioContext.currentTime;
    this.playNote(now, 440, 0.15, 0.2); // A4
    this.playNote(now + 0.1, 554.37, 0.15, 0.2); // C#5
  }

  private playNote(time: number, frequency: number, volume: number, duration: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);
  }
}
