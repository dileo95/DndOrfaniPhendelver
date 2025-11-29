import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type CombatSoundType = 
  | 'hit'           // Attacco riuscito
  | 'miss'          // Attacco mancato
  | 'critical'      // Colpo critico
  | 'magic'         // Lancio incantesimo
  | 'heal'          // Cura
  | 'defend'        // Difesa/scudo
  | 'victory'       // Vittoria
  | 'defeat'        // Sconfitta
  | 'enemyHit'      // Nemico colpisce
  | 'enemyMiss'     // Nemico manca
  | 'breath'        // Soffio drago
  | 'potion'        // Usa pozione
  | 'turnStart'     // Inizio turno
  | 'levelUp';      // Level up

@Injectable({
  providedIn: 'root'
})
export class CombatAudioService {
  private platformId = inject(PLATFORM_ID);
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private volume = 0.5;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initAudioContext();
    }
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

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /** Riproduce un effetto sonoro di combattimento */
  play(type: CombatSoundType): void {
    if (!this.enabled || !this.audioContext) return;
    this.ensureAudioContext();

    switch (type) {
      case 'hit':
        this.playHit();
        break;
      case 'miss':
        this.playMiss();
        break;
      case 'critical':
        this.playCritical();
        break;
      case 'magic':
        this.playMagic();
        break;
      case 'heal':
        this.playHeal();
        break;
      case 'defend':
        this.playDefend();
        break;
      case 'victory':
        this.playVictory();
        break;
      case 'defeat':
        this.playDefeat();
        break;
      case 'enemyHit':
        this.playEnemyHit();
        break;
      case 'enemyMiss':
        this.playMiss();
        break;
      case 'breath':
        this.playBreath();
        break;
      case 'potion':
        this.playPotion();
        break;
      case 'turnStart':
        this.playTurnStart();
        break;
      case 'levelUp':
        this.playLevelUp();
        break;
    }
  }

  // === EFFETTI SONORI ===

  private playHit(): void {
    const now = this.audioContext!.currentTime;
    
    // Suono di impatto
    this.playNoise(now, 0.1, 'lowpass', 800, this.volume * 0.6);
    
    // Tono basso di impatto
    this.playTone(now, 150, 'sine', this.volume * 0.4, 0.1);
    this.playTone(now + 0.02, 100, 'sine', this.volume * 0.3, 0.08);
  }

  private playMiss(): void {
    const now = this.audioContext!.currentTime;
    
    // Suono di whoosh
    this.playNoise(now, 0.15, 'highpass', 2000, this.volume * 0.3);
    
    // Tono discendente
    const osc = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext!.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playCritical(): void {
    const now = this.audioContext!.currentTime;
    
    // Impatto forte
    this.playNoise(now, 0.15, 'lowpass', 1000, this.volume * 0.8);
    
    // Accordo trionfante
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      this.playTone(now + i * 0.05, freq, 'sine', this.volume * 0.4, 0.3);
    });
    
    // Flash sonoro
    this.playTone(now + 0.1, 1046.50, 'sine', this.volume * 0.3, 0.2);
  }

  private playMagic(): void {
    const now = this.audioContext!.currentTime;
    
    // Shimmer ascendente
    for (let i = 0; i < 8; i++) {
      const freq = 400 + i * 100;
      this.playTone(now + i * 0.06, freq, 'sine', this.volume * 0.15, 0.3);
    }
    
    // Sparkle
    for (let i = 0; i < 5; i++) {
      const freq = 800 + Math.random() * 1200;
      this.playTone(now + 0.2 + i * 0.08, freq, 'sine', this.volume * 0.1, 0.15);
    }
  }

  private playHeal(): void {
    const now = this.audioContext!.currentTime;
    
    // Suono armonioso ascendente
    const notes = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    notes.forEach((freq, i) => {
      this.playTone(now + i * 0.12, freq, 'sine', this.volume * 0.3, 0.4);
    });
    
    // Chime finale
    this.playTone(now + 0.5, 1046.50, 'sine', this.volume * 0.2, 0.5);
  }

  private playDefend(): void {
    const now = this.audioContext!.currentTime;
    
    // Suono metallico di scudo
    this.playTone(now, 800, 'square', this.volume * 0.15, 0.1);
    this.playTone(now, 1200, 'square', this.volume * 0.1, 0.1);
    
    // Riverbero
    for (let i = 0; i < 3; i++) {
      this.playTone(now + 0.05 + i * 0.03, 600 - i * 100, 'sine', this.volume * 0.1, 0.15);
    }
  }

  private playVictory(): void {
    const now = this.audioContext!.currentTime;
    
    // Fanfara trionfante
    const melody = [
      { freq: 523.25, time: 0 },      // C5
      { freq: 659.25, time: 0.15 },   // E5
      { freq: 783.99, time: 0.3 },    // G5
      { freq: 1046.50, time: 0.5 },   // C6
    ];
    
    melody.forEach(note => {
      this.playTone(now + note.time, note.freq, 'sine', this.volume * 0.35, 0.4);
    });
    
    // Accordo finale
    setTimeout(() => {
      if (!this.audioContext) return;
      const t = this.audioContext.currentTime;
      this.playTone(t, 523.25, 'sine', this.volume * 0.25, 0.8);
      this.playTone(t, 659.25, 'sine', this.volume * 0.25, 0.8);
      this.playTone(t, 783.99, 'sine', this.volume * 0.25, 0.8);
      this.playTone(t, 1046.50, 'sine', this.volume * 0.3, 0.8);
    }, 700);
  }

  private playDefeat(): void {
    const now = this.audioContext!.currentTime;
    
    // Suono triste discendente
    const notes = [392.00, 349.23, 293.66, 261.63]; // G4, F4, D4, C4
    notes.forEach((freq, i) => {
      this.playTone(now + i * 0.3, freq, 'sine', this.volume * 0.3, 0.5);
    });
    
    // Tono basso finale
    this.playTone(now + 1.2, 130.81, 'sine', this.volume * 0.4, 1.0);
  }

  private playEnemyHit(): void {
    const now = this.audioContext!.currentTime;
    
    // Impatto più aggressivo
    this.playNoise(now, 0.12, 'lowpass', 600, this.volume * 0.5);
    
    // Tono minaccioso
    this.playTone(now, 120, 'sawtooth', this.volume * 0.3, 0.15);
    this.playTone(now + 0.03, 80, 'sawtooth', this.volume * 0.25, 0.1);
  }

  private playBreath(): void {
    const now = this.audioContext!.currentTime;
    
    // Rumore di soffio crescente
    for (let i = 0; i < 10; i++) {
      const t = now + i * 0.05;
      const vol = this.volume * 0.3 * (i / 10);
      this.playNoise(t, 0.08, 'bandpass', 300 + i * 50, vol);
    }
    
    // Roar finale
    this.playTone(now + 0.3, 100, 'sawtooth', this.volume * 0.4, 0.4);
    this.playTone(now + 0.35, 80, 'sawtooth', this.volume * 0.35, 0.35);
  }

  private playPotion(): void {
    const now = this.audioContext!.currentTime;
    
    // Suono di liquido
    for (let i = 0; i < 5; i++) {
      const freq = 600 + Math.random() * 400;
      this.playTone(now + i * 0.08, freq, 'sine', this.volume * 0.15, 0.15);
    }
    
    // Gulp
    this.playTone(now + 0.4, 300, 'sine', this.volume * 0.3, 0.1);
    this.playTone(now + 0.45, 200, 'sine', this.volume * 0.25, 0.1);
    
    // Effetto magico
    this.playTone(now + 0.6, 800, 'sine', this.volume * 0.2, 0.3);
  }

  private playTurnStart(): void {
    const now = this.audioContext!.currentTime;
    
    // Breve notifica
    this.playTone(now, 440, 'sine', this.volume * 0.2, 0.1);
    this.playTone(now + 0.1, 554.37, 'sine', this.volume * 0.25, 0.15);
  }

  private playLevelUp(): void {
    const now = this.audioContext!.currentTime;
    
    // Arpeggio ascendente glorioso
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      this.playTone(now + i * 0.1, freq, 'sine', this.volume * 0.3, 0.5);
    });
    
    // Accordo finale brillante
    setTimeout(() => {
      if (!this.audioContext) return;
      const t = this.audioContext.currentTime;
      for (let i = 0; i < 3; i++) {
        this.playTone(t, 1046.50 + i * 100, 'sine', this.volume * 0.2, 1.0);
      }
    }, 800);
  }

  // === UTILITY ===

  private playTone(
    time: number,
    frequency: number,
    type: OscillatorType,
    volume: number,
    duration: number
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  private playNoise(
    time: number,
    duration: number,
    filterType: BiquadFilterType,
    filterFreq: number,
    volume: number
  ): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();

    noise.buffer = buffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.start(time);
    noise.stop(time + duration);
  }
}
