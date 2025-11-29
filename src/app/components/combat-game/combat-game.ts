import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, computed, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, CharacterSheet as Sheet, Weapon, Spell } from '../../services/database.service';
import { ToastService } from '../../services/toast.service';

// Phaser will be imported dynamically only in browser
let Phaser: any;

// ============ ENEMY DEFINITIONS ============
export interface Enemy {
  id: string;
  name: string;
  hp: number;
  ac: number;
  attackBonus: number;
  damage: string;
  damageType: string;
  xp: number;
  cr: string;
  abilities?: string[];
  description: string;
  color: number;       // Colore principale del nemico
  size: number;        // Moltiplicatore dimensione (1 = normale)
  shape: 'humanoid' | 'beast' | 'undead' | 'giant';
}

export const ENEMIES: Enemy[] = [
  // CR 1/4
  { id: 'goblin', name: 'Goblin', hp: 7, ac: 15, attackBonus: 4, damage: '1d6+2', damageType: 'slashing', xp: 50, cr: '1/4', description: 'Piccolo e subdolo, attacca in gruppo.', color: 0x4a7c3f, size: 0.7, shape: 'humanoid' },
  { id: 'skeleton', name: 'Scheletro', hp: 13, ac: 13, attackBonus: 4, damage: '1d6+2', damageType: 'piercing', xp: 50, cr: '1/4', abilities: ['Vulnerabile: contundenti'], description: 'Guerriero non morto.', color: 0xd4c9a8, size: 0.9, shape: 'undead' },
  { id: 'wolf', name: 'Lupo', hp: 11, ac: 13, attackBonus: 4, damage: '2d4+2', damageType: 'piercing', xp: 50, cr: '1/4', description: 'Predatore veloce.', color: 0x6b6b6b, size: 0.8, shape: 'beast' },
  
  // CR 1/2
  { id: 'orc', name: 'Orco', hp: 15, ac: 13, attackBonus: 5, damage: '1d12+3', damageType: 'slashing', xp: 100, cr: '1/2', abilities: ['Aggressivo'], description: 'Brutale e feroce.', color: 0x5a8a4a, size: 1.1, shape: 'humanoid' },
  { id: 'hobgoblin', name: 'Hobgoblin', hp: 11, ac: 18, attackBonus: 3, damage: '1d8+1', damageType: 'slashing', xp: 100, cr: '1/2', description: 'Guerriero disciplinato.', color: 0xc45c3a, size: 1.0, shape: 'humanoid' },
  
  // CR 1
  { id: 'bugbear', name: 'Bugbear', hp: 27, ac: 16, attackBonus: 4, damage: '2d8+2', damageType: 'bludgeoning', xp: 200, cr: '1', abilities: ['Attacco a sorpresa'], description: 'Colpisce dalle ombre.', color: 0x8b5a2b, size: 1.3, shape: 'humanoid' },
  { id: 'ghoul', name: 'Ghoul', hp: 22, ac: 12, attackBonus: 4, damage: '2d6+2', damageType: 'slashing', xp: 200, cr: '1', abilities: ['Paralisi (TS Cos 10)'], description: 'Non morto paralizzante.', color: 0x4a5a4a, size: 0.95, shape: 'undead' },
  
  // CR 2
  { id: 'ogre', name: 'Ogre', hp: 59, ac: 11, attackBonus: 6, damage: '2d8+4', damageType: 'bludgeoning', xp: 450, cr: '2', description: 'Gigante devastante.', color: 0x8b7355, size: 1.8, shape: 'giant' },
  { id: 'ghast', name: 'Ghast', hp: 36, ac: 13, attackBonus: 5, damage: '2d8+3', damageType: 'slashing', xp: 450, cr: '2', abilities: ['Fetore', 'Paralisi'], description: 'Ghoul potenziato.', color: 0x3a4a3a, size: 1.0, shape: 'undead' },
  
  // CR 3+
  { id: 'owlbear', name: 'Gufolorso', hp: 59, ac: 13, attackBonus: 7, damage: '2d8+5', damageType: 'slashing', xp: 700, cr: '3', abilities: ['Multiattacco'], description: 'Bestia feroce.', color: 0x5a4a3a, size: 1.5, shape: 'beast' },
  { id: 'minotaur', name: 'Minotauro', hp: 76, ac: 14, attackBonus: 6, damage: '2d12+4', damageType: 'slashing', xp: 700, cr: '3', abilities: ['Carica'], description: 'Bestia del labirinto.', color: 0x6a3a2a, size: 1.6, shape: 'beast' },
  { id: 'troll', name: 'Troll', hp: 84, ac: 15, attackBonus: 7, damage: '2d6+4', damageType: 'slashing', xp: 1800, cr: '5', abilities: ['Rigenerazione 10', 'Vulnerabile: fuoco/acido'], description: 'Si rigenera.', color: 0x2a5a2a, size: 1.7, shape: 'giant' },
];

// ============ COMPONENT ============
@Component({
  selector: 'app-combat-game',
  imports: [CommonModule, FormsModule],
  templateUrl: './combat-game.html',
  styleUrl: './combat-game.scss',
})
export class CombatGame implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: false }) gameContainer!: ElementRef<HTMLDivElement>;
  
  // Character data
  character = signal<string>('');
  sheet = signal<Sheet | null>(null);
  
  // Combat state
  gamePhase = signal<'setup' | 'combat' | 'victory' | 'defeat'>('setup');
  selectedEnemy = signal<Enemy | null>(null);
  
  // HP tracking
  playerHP = signal<number>(0);
  playerMaxHP = signal<number>(0);
  enemyHP = signal<number>(0);
  enemyMaxHP = signal<number>(0);
  
  // Turn management
  isPlayerTurn = signal<boolean>(true);
  currentRound = signal<number>(1);
  isDefending = signal<boolean>(false);
  
  // Combat log
  combatLog = signal<string[]>([]);
  
  // Combat Statistics
  totalDamageDealt = signal<number>(0);
  totalDamageTaken = signal<number>(0);
  criticalHits = signal<number>(0);
  missedAttacks = signal<number>(0);
  spellsCast = signal<number>(0);
  potionsUsed = signal<number>(0);
  
  // Selected action
  selectedWeapon = signal<Weapon | null>(null);
  selectedSpell = signal<Spell | null>(null);
  
  // Computed
  enemies = ENEMIES;
  
  playerHPPercent = computed(() => 
    this.playerMaxHP() > 0 ? (this.playerHP() / this.playerMaxHP()) * 100 : 0
  );
  
  enemyHPPercent = computed(() => 
    this.enemyMaxHP() > 0 ? (this.enemyHP() / this.enemyMaxHP()) * 100 : 0
  );
  
  availableSpells = computed(() => {
    const s = this.sheet();
    if (!s) return [];
    return s.spells.filter(spell => spell.prepared !== false);
  });
  
  // Verifica se il combattimento può iniziare
  canStartCombat = computed(() => {
    const s = this.sheet();
    if (!s) return { canStart: false, reason: 'Scheda personaggio non trovata' };
    if (this.playerHP() <= 0) return { canStart: false, reason: 'Sei a 0 punti ferita! Riposa prima di combattere.' };
    if (!this.selectedEnemy()) return { canStart: false, reason: 'Seleziona un nemico' };
    return { canStart: true, reason: '' };
  });
  
  // Flag per sapere se la scheda esiste nel database
  sheetExists = signal<boolean>(false);
  
  // Phaser
  private game: any = null;
  private scene: any = null;
  
  // Toast service
  private toast = inject(ToastService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    this.character.set(this.route.snapshot.paramMap.get('character') || '');
    await this.loadSheet();
  }

  async loadSheet() {
    const sheet = await this.db.getCharacterSheet(this.character());
    this.sheet.set(sheet || null);
    this.sheetExists.set(!!sheet);
    
    if (sheet) {
      this.playerHP.set(sheet.currentHP);
      this.playerMaxHP.set(sheet.maxHP);
      
      // Auto-select first weapon
      if (sheet.weapons?.length > 0) {
        this.selectedWeapon.set(sheet.weapons[0]);
      }
    }
  }

  selectEnemy(enemy: Enemy) {
    this.selectedEnemy.set(enemy);
    this.enemyHP.set(enemy.hp);
    this.enemyMaxHP.set(enemy.hp);
  }

  async startCombat() {
    const combatCheck = this.canStartCombat();
    if (!combatCheck.canStart) {
      // Mostra messaggio di errore all'utente
      this.toast.warning(combatCheck.reason);
      return;
    }
    
    this.gamePhase.set('combat');
    this.currentRound.set(1);
    this.isPlayerTurn.set(true);
    this.combatLog.set([]);
    
    // Reset combat statistics
    this.totalDamageDealt.set(0);
    this.totalDamageTaken.set(0);
    this.criticalHits.set(0);
    this.missedAttacks.set(0);
    this.spellsCast.set(0);
    this.potionsUsed.set(0);
    
    this.addLog(`⚔️ Combattimento iniziato! Round 1`);
    this.addLog(`${this.getPlayerName()} vs ${this.selectedEnemy()!.name}`);
    
    // Init Phaser if in browser - wait for DOM to render
    if (isPlatformBrowser(this.platformId)) {
      this.waitForContainerAndInit();
    }
  }
  
  private waitForContainerAndInit(attempts = 0) {
    if (attempts > 30) {
      console.error('Game container not found after multiple attempts');
      return;
    }
    
    // Try ViewChild first, then fallback to querySelector
    const container = this.gameContainer?.nativeElement || document.querySelector('.game-container');
    
    if (container) {
      this.initPhaser(container as HTMLElement);
    } else {
      setTimeout(() => this.waitForContainerAndInit(attempts + 1), 100);
    }
  }

  async initPhaser(container: HTMLElement) {
    Phaser = (await import('phaser')).default;
    
    const self = this;
    
    // Calculate responsive size
    const containerWidth = container.clientWidth || 600;
    const isMobile = containerWidth < 500;
    const gameWidth = Math.min(600, containerWidth);
    const gameHeight = isMobile ? Math.min(350, gameWidth * 0.65) : 400;
    
    class CombatScene extends Phaser.Scene {
      private playerSprite!: Phaser.GameObjects.Sprite;
      private enemyContainer!: Phaser.GameObjects.Container;
      private bgMusic!: Phaser.Sound.BaseSound;
      private character: string;
      private enemyData: Enemy;
      private breathingTween: any;
      private isMobile: boolean;
      
      constructor() {
        super({ key: 'CombatScene' });
        this.character = self.character();
        this.enemyData = self.selectedEnemy()!;
        this.isMobile = isMobile;
      }
      
      preload() {
        const scene = this as any;
        scene.load.image('fightScene', './assets/img/fight_scene1.png');
        scene.load.audio('bgMusic', './assets/sound/combat-music.WAV');
        
        const charPath = `./assets/spritesheet/${this.character}_animation/standard`;
        
        // Load spritesheets with explicit frame dimensions for Safari compatibility
        scene.load.spritesheet('player_idle', `${charPath}/combat_idle.png`, { 
          frameWidth: 64, 
          frameHeight: 64,
          margin: 0,
          spacing: 0
        });
        scene.load.spritesheet('player_attack', `${charPath}/halfslash.png`, { 
          frameWidth: 64, 
          frameHeight: 64,
          margin: 0,
          spacing: 0
        });
        scene.load.spritesheet('player_spell', `${charPath}/spellcast.png`, { 
          frameWidth: 64, 
          frameHeight: 64,
          margin: 0,
          spacing: 0
        });
        scene.load.spritesheet('player_hurt', `${charPath}/hurt.png`, { 
          frameWidth: 64, 
          frameHeight: 64,
          margin: 0,
          spacing: 0
        });
      }
      
      create() {
        const scene = this as any;
        const { width, height } = scene.cameras.main;
        
        // Background
        const bg = scene.add.image(width / 2, height / 2, 'fightScene');
        bg.setDisplaySize(width, height);
        
        // Music - with error handling for mobile
        try {
          this.bgMusic = scene.sound.add('bgMusic', { volume: 0.3, loop: true });
          // Only autoplay on non-mobile or after user interaction
          if (!this.isMobile) {
            (this.bgMusic as any).play();
          }
        } catch (e) {
          console.log('Audio not available');
        }
        
        // Player sprite - scale based on screen size
        const playerScale = this.isMobile ? 2.0 : 2.5;
        const playerX = this.isMobile ? width * 0.2 : 150;
        this.playerSprite = scene.add.sprite(playerX, height / 2, 'player_idle');
        this.playerSprite.setScale(playerScale);
        
        // Create animations with explicit frame arrays for Safari iOS compatibility
        // Safari has issues with generateFrameNumbers in some cases
        this.createSafariCompatibleAnimations(scene);
        
        this.playerSprite.play('idle');
        
        // Create stylized enemy based on type
        this.createEnemy(scene, width, height);
        
        // Store reference
        self.scene = this;
        
        // Enable audio on first touch for mobile
        if (this.isMobile) {
          scene.input.once('pointerdown', () => {
            if (this.bgMusic && !(this.bgMusic as any).isPlaying) {
              try {
                (this.bgMusic as any).play();
              } catch (e) {
                console.log('Could not play audio');
              }
            }
          });
        }
      }
      
      // Safari-compatible animation creation
      createSafariCompatibleAnimations(scene: any) {
        // Use explicit frame arrays instead of generateFrameNumbers
        // This is more compatible with Safari iOS
        
        // Idle animation - frames 6-7
        if (!scene.anims.exists('idle')) {
          scene.anims.create({ 
            key: 'idle', 
            frames: [
              { key: 'player_idle', frame: 6 },
              { key: 'player_idle', frame: 7 }
            ], 
            frameRate: 6, 
            repeat: -1 
          });
        }
        
        // Attack animation - frames 18-23
        if (!scene.anims.exists('attack')) {
          scene.anims.create({ 
            key: 'attack', 
            frames: [
              { key: 'player_attack', frame: 18 },
              { key: 'player_attack', frame: 19 },
              { key: 'player_attack', frame: 20 },
              { key: 'player_attack', frame: 21 },
              { key: 'player_attack', frame: 22 },
              { key: 'player_attack', frame: 23 }
            ], 
            frameRate: 12, 
            repeat: 0 
          });
        }
        
        // Spell animation - frames 21-27
        if (!scene.anims.exists('spell')) {
          scene.anims.create({ 
            key: 'spell', 
            frames: [
              { key: 'player_spell', frame: 21 },
              { key: 'player_spell', frame: 22 },
              { key: 'player_spell', frame: 23 },
              { key: 'player_spell', frame: 24 },
              { key: 'player_spell', frame: 25 },
              { key: 'player_spell', frame: 26 },
              { key: 'player_spell', frame: 27 }
            ], 
            frameRate: 10, 
            repeat: 0 
          });
        }
        
        // Hurt animation - frames 0-5
        if (!scene.anims.exists('hurt')) {
          scene.anims.create({ 
            key: 'hurt', 
            frames: [
              { key: 'player_hurt', frame: 0 },
              { key: 'player_hurt', frame: 1 },
              { key: 'player_hurt', frame: 2 },
              { key: 'player_hurt', frame: 3 },
              { key: 'player_hurt', frame: 4 },
              { key: 'player_hurt', frame: 5 }
            ], 
            frameRate: 10, 
            repeat: 0 
          });
        }
      }
      
      createEnemy(scene: any, width: number, height: number) {
        const enemy = this.enemyData;
        const sizeMultiplier = this.isMobile ? 0.7 : 1;
        const baseSize = 60 * enemy.size * sizeMultiplier;
        const x = this.isMobile ? width * 0.8 : width - 120;
        const y = height / 2;
        
        this.enemyContainer = scene.add.container(x, y);
        
        // Darken the main color for shadows
        const shadowColor = this.darkenColor(enemy.color, 0.5);
        
        switch (enemy.shape) {
          case 'humanoid':
            this.createHumanoid(scene, enemy.color, shadowColor, baseSize);
            break;
          case 'beast':
            this.createBeast(scene, enemy.color, shadowColor, baseSize);
            break;
          case 'undead':
            this.createUndead(scene, enemy.color, shadowColor, baseSize);
            break;
          case 'giant':
            this.createGiant(scene, enemy.color, shadowColor, baseSize);
            break;
        }
        
        // Add glowing eyes
        const eyeColor = enemy.shape === 'undead' ? 0x00ff00 : 0xff3333;
        const eyeY = -baseSize * 0.6;
        const leftEye = scene.add.circle(-baseSize * 0.15, eyeY, baseSize * 0.08, eyeColor);
        const rightEye = scene.add.circle(baseSize * 0.15, eyeY, baseSize * 0.08, eyeColor);
        leftEye.setAlpha(0.9);
        rightEye.setAlpha(0.9);
        this.enemyContainer.add([leftEye, rightEye]);
        
        // Add enemy name label
        const nameLabel = scene.add.text(0, baseSize * 0.7, enemy.name, {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5);
        this.enemyContainer.add(nameLabel);
        
        // Breathing animation
        this.breathingTween = scene.tweens.add({
          targets: this.enemyContainer,
          scaleY: 1.03,
          scaleX: 0.98,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      
      createHumanoid(scene: any, color: number, shadow: number, size: number) {
        // Body (rounded rectangle)
        const body = scene.add.rectangle(0, 0, size * 0.6, size * 0.9, color);
        body.setStrokeStyle(2, shadow);
        
        // Head
        const head = scene.add.circle(0, -size * 0.65, size * 0.25, color);
        head.setStrokeStyle(2, shadow);
        
        // Arms
        const leftArm = scene.add.rectangle(-size * 0.4, -size * 0.1, size * 0.15, size * 0.5, color);
        leftArm.setStrokeStyle(2, shadow);
        leftArm.setAngle(-15);
        
        const rightArm = scene.add.rectangle(size * 0.4, -size * 0.1, size * 0.15, size * 0.5, color);
        rightArm.setStrokeStyle(2, shadow);
        rightArm.setAngle(15);
        
        // Weapon (sword or club)
        const weapon = scene.add.rectangle(size * 0.55, -size * 0.3, size * 0.08, size * 0.6, 0x888888);
        weapon.setStrokeStyle(1, 0x555555);
        weapon.setAngle(30);
        
        this.enemyContainer.add([body, head, leftArm, rightArm, weapon]);
      }
      
      createBeast(scene: any, color: number, shadow: number, size: number) {
        // Body (horizontal oval)
        const body = scene.add.ellipse(0, 0, size * 1.2, size * 0.7, color);
        body.setStrokeStyle(2, shadow);
        
        // Head
        const head = scene.add.ellipse(-size * 0.5, -size * 0.25, size * 0.5, size * 0.4, color);
        head.setStrokeStyle(2, shadow);
        
        // Snout
        const snout = scene.add.ellipse(-size * 0.75, -size * 0.2, size * 0.25, size * 0.15, this.lightenColor(color, 0.2));
        
        // Ears/horns (for minotaur/owlbear)
        const leftEar = scene.add.triangle(-size * 0.6, -size * 0.55, 0, 20, -10, 0, 10, 0, shadow);
        const rightEar = scene.add.triangle(-size * 0.35, -size * 0.55, 0, 20, -10, 0, 10, 0, shadow);
        
        // Legs
        const legs: any[] = [];
        for (let i = 0; i < 4; i++) {
          const legX = -size * 0.3 + (i * size * 0.2);
          const leg = scene.add.rectangle(legX, size * 0.45, size * 0.12, size * 0.35, shadow);
          legs.push(leg);
        }
        
        // Tail
        const tail = scene.add.ellipse(size * 0.55, size * 0.1, size * 0.3, size * 0.1, shadow);
        tail.setAngle(-20);
        
        this.enemyContainer.add([tail, ...legs, body, head, snout, leftEar, rightEar]);
      }
      
      createUndead(scene: any, color: number, shadow: number, size: number) {
        // Ragged body
        const body = scene.add.polygon(0, 0, [
          -size * 0.3, -size * 0.4,
          size * 0.3, -size * 0.4,
          size * 0.35, size * 0.5,
          size * 0.1, size * 0.55,
          -size * 0.1, size * 0.5,
          -size * 0.35, size * 0.55
        ], color);
        body.setStrokeStyle(2, shadow);
        
        // Skull head
        const head = scene.add.circle(0, -size * 0.6, size * 0.28, color);
        head.setStrokeStyle(2, shadow);
        
        // Jaw
        const jaw = scene.add.arc(0, -size * 0.45, size * 0.18, 0, 180, false, shadow);
        
        // Skeletal arms
        const leftArm = scene.add.rectangle(-size * 0.45, -size * 0.15, size * 0.08, size * 0.5, color);
        leftArm.setStrokeStyle(1, shadow);
        leftArm.setAngle(-20);
        
        const rightArm = scene.add.rectangle(size * 0.45, -size * 0.15, size * 0.08, size * 0.5, color);
        rightArm.setStrokeStyle(1, shadow);
        rightArm.setAngle(20);
        
        // Ghostly glow
        const glow = scene.add.circle(0, 0, size * 0.8, 0x00ff00, 0.1);
        
        this.enemyContainer.add([glow, body, head, jaw, leftArm, rightArm]);
      }
      
      createGiant(scene: any, color: number, shadow: number, size: number) {
        // Massive body
        const body = scene.add.rectangle(0, 0, size * 0.8, size * 1.1, color);
        body.setStrokeStyle(3, shadow);
        
        // Head (smaller relative to body)
        const head = scene.add.circle(0, -size * 0.75, size * 0.3, color);
        head.setStrokeStyle(3, shadow);
        
        // Massive arms
        const leftArm = scene.add.rectangle(-size * 0.55, -size * 0.1, size * 0.25, size * 0.7, color);
        leftArm.setStrokeStyle(2, shadow);
        leftArm.setAngle(-10);
        
        const rightArm = scene.add.rectangle(size * 0.55, -size * 0.1, size * 0.25, size * 0.7, color);
        rightArm.setStrokeStyle(2, shadow);
        rightArm.setAngle(10);
        
        // Thick legs
        const leftLeg = scene.add.rectangle(-size * 0.25, size * 0.7, size * 0.25, size * 0.4, shadow);
        const rightLeg = scene.add.rectangle(size * 0.25, size * 0.7, size * 0.25, size * 0.4, shadow);
        
        // Club weapon
        const club = scene.add.ellipse(size * 0.85, 0, size * 0.2, size * 0.6, 0x4a3520);
        club.setStrokeStyle(2, 0x2a1510);
        club.setAngle(20);
        
        this.enemyContainer.add([leftLeg, rightLeg, body, head, leftArm, rightArm, club]);
      }
      
      darkenColor(color: number, factor: number): number {
        const r = Math.floor(((color >> 16) & 0xff) * factor);
        const g = Math.floor(((color >> 8) & 0xff) * factor);
        const b = Math.floor((color & 0xff) * factor);
        return (r << 16) | (g << 8) | b;
      }
      
      lightenColor(color: number, factor: number): number {
        const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + factor)));
        const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + factor)));
        const b = Math.min(255, Math.floor((color & 0xff) * (1 + factor)));
        return (r << 16) | (g << 8) | b;
      }
      
      playAnimation(anim: string) {
        this.playerSprite.play(anim);
        this.playerSprite.once('animationcomplete', () => {
          this.playerSprite.play('idle');
        });
      }
      
      shakeEnemy() {
        const scene = this as any;
        scene.tweens.add({
          targets: this.enemyContainer,
          x: this.enemyContainer.x + 15,
          duration: 50,
          yoyo: true,
          repeat: 3
        });
      }
      
      shakePlayer() {
        const scene = this as any;
        scene.tweens.add({
          targets: this.playerSprite,
          x: this.playerSprite.x - 15,
          duration: 50,
          yoyo: true,
          repeat: 3
        });
      }
      
      flashEnemy() {
        const scene = this as any;
        scene.tweens.add({
          targets: this.enemyContainer,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 2
        });
      }
      
      enemyDeath() {
        const scene = this as any;
        if (this.breathingTween) this.breathingTween.stop();
        
        scene.tweens.add({
          targets: this.enemyContainer,
          alpha: 0,
          y: this.enemyContainer.y + 50,
          scaleX: 0.5,
          scaleY: 0.5,
          angle: 15,
          duration: 800,
          ease: 'Power2'
        });
      }
      
      // Attack effect - slash lines
      showAttackEffect() {
        const scene = this as any;
        const { width, height } = scene.cameras.main;
        const targetX = width - 120;
        const targetY = height / 2;
        
        // Create slash lines
        for (let i = 0; i < 3; i++) {
          const line = scene.add.line(
            targetX, targetY - 20 + (i * 20),
            -30, -20, 30, 20,
            0xffff00, 1
          );
          line.setLineWidth(3);
          line.setAlpha(0);
          
          scene.tweens.add({
            targets: line,
            alpha: 1,
            scaleX: 1.5,
            duration: 100,
            delay: i * 50,
            yoyo: true,
            onComplete: () => line.destroy()
          });
        }
      }
      
      // Spell effect - magic particles
      showSpellEffect(damageType: string) {
        const scene = this as any;
        const { width, height } = scene.cameras.main;
        const startX = 200;
        const startY = height / 2 - 30;
        const targetX = width - 120;
        const targetY = height / 2;
        
        // Color based on damage type
        let color = 0x9933ff; // default purple
        if (damageType.includes('fuoco') || damageType.includes('fire')) color = 0xff6600;
        else if (damageType.includes('freddo') || damageType.includes('cold')) color = 0x66ccff;
        else if (damageType.includes('fulmine') || damageType.includes('lightning')) color = 0xffff00;
        else if (damageType.includes('acido') || damageType.includes('acid')) color = 0x33ff33;
        else if (damageType.includes('necro')) color = 0x330066;
        else if (damageType.includes('radiant')) color = 0xffffcc;
        
        // Create magic projectile
        const projectile = scene.add.circle(startX, startY, 12, color);
        const glow = scene.add.circle(startX, startY, 20, color, 0.3);
        
        // Particles trail
        const particles: any[] = [];
        for (let i = 0; i < 8; i++) {
          const p = scene.add.circle(startX, startY, 4 + Math.random() * 4, color, 0.6);
          particles.push(p);
        }
        
        // Animate projectile
        scene.tweens.add({
          targets: [projectile, glow],
          x: targetX,
          y: targetY,
          duration: 400,
          ease: 'Power1',
          onUpdate: () => {
            particles.forEach((p, i) => {
              scene.tweens.add({
                targets: p,
                x: projectile.x - 10 - Math.random() * 20,
                y: projectile.y + (Math.random() - 0.5) * 30,
                alpha: 0,
                duration: 150,
                delay: i * 20
              });
            });
          },
          onComplete: () => {
            // Explosion at target
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2;
              const explosion = scene.add.circle(targetX, targetY, 8, color);
              scene.tweens.add({
                targets: explosion,
                x: targetX + Math.cos(angle) * 60,
                y: targetY + Math.sin(angle) * 60,
                alpha: 0,
                scale: 0.3,
                duration: 300,
                onComplete: () => explosion.destroy()
              });
            }
            projectile.destroy();
            glow.destroy();
            particles.forEach(p => p.destroy());
          }
        });
      }
      
      // Enemy attack animation
      enemyAttack() {
        const scene = this as any;
        const originalX = this.enemyContainer.x;
        
        // Lunge forward
        scene.tweens.add({
          targets: this.enemyContainer,
          x: originalX - 80,
          duration: 150,
          ease: 'Power2',
          yoyo: true,
          onYoyo: () => {
            // Impact effect
            this.showImpactEffect();
          }
        });
      }
      
      showImpactEffect() {
        const scene = this as any;
        const { height } = scene.cameras.main;
        const impactX = 180;
        const impactY = height / 2;
        
        // Impact star
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const star = scene.add.star(impactX, impactY, 5, 5, 15, 0xff3333);
          star.setAngle(angle * (180 / Math.PI));
          
          scene.tweens.add({
            targets: star,
            x: impactX + Math.cos(angle) * 40,
            y: impactY + Math.sin(angle) * 40,
            alpha: 0,
            scale: 0.5,
            duration: 200,
            onComplete: () => star.destroy()
          });
        }
      }
      
      // Heal effect
      showHealEffect() {
        const scene = this as any;
        const { height } = scene.cameras.main;
        const x = 150;
        const y = height / 2;
        
        // Green healing particles rising up
        for (let i = 0; i < 10; i++) {
          const particle = scene.add.circle(
            x + (Math.random() - 0.5) * 60,
            y + 30,
            6 + Math.random() * 4,
            0x33ff66,
            0.8
          );
          
          scene.tweens.add({
            targets: particle,
            y: y - 80,
            alpha: 0,
            duration: 800 + Math.random() * 400,
            delay: i * 50,
            ease: 'Power1',
            onComplete: () => particle.destroy()
          });
        }
        
        // Plus sign
        const plus = scene.add.text(x, y - 20, '+', {
          fontSize: '32px',
          color: '#33ff66',
          stroke: '#006622',
          strokeThickness: 3
        }).setOrigin(0.5);
        
        scene.tweens.add({
          targets: plus,
          y: y - 60,
          alpha: 0,
          scale: 1.5,
          duration: 600,
          onComplete: () => plus.destroy()
        });
      }
      
      // Defend effect
      showDefendEffect() {
        const scene = this as any;
        const { height } = scene.cameras.main;
        const x = 150;
        const y = height / 2;
        
        // Shield icon
        const shield = scene.add.polygon(x, y, [
          0, -30, 25, -15, 25, 15, 0, 35, -25, 15, -25, -15
        ], 0x3399ff, 0.7);
        shield.setStrokeStyle(3, 0x0066cc);
        shield.setScale(0);
        
        scene.tweens.add({
          targets: shield,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          hold: 300,
          onComplete: () => shield.destroy()
        });
      }
      
      stopMusic() {
        if (this.bgMusic) (this.bgMusic as any).stop();
      }
      
      // Victory celebration
      showVictory() {
        const scene = this as any;
        const { width, height } = scene.cameras.main;
        
        // Confetti/sparkles
        for (let i = 0; i < 30; i++) {
          const colors = [0xffd700, 0xff6600, 0x33ff33, 0x3399ff, 0xff33ff];
          const particle = scene.add.star(
            Math.random() * width,
            -20,
            5, 4, 10,
            colors[Math.floor(Math.random() * colors.length)]
          );
          
          scene.tweens.add({
            targets: particle,
            y: height + 20,
            x: particle.x + (Math.random() - 0.5) * 100,
            angle: Math.random() * 360,
            duration: 1500 + Math.random() * 1000,
            delay: Math.random() * 500,
            onComplete: () => particle.destroy()
          });
        }
      }
    }
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameWidth,
      height: gameHeight,
      parent: container,
      backgroundColor: '#1a1a2e',
      scene: CombatScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: true,
        antialias: false
      }
    };
    
    this.game = new Phaser.Game(config);
  }

  // ============ COMBAT ACTIONS ============
  
  attackWithWeapon(weapon: Weapon) {
    if (!this.isPlayerTurn() || this.gamePhase() !== 'combat') return;
    
    this.selectedWeapon.set(weapon);
    const sheet = this.sheet()!;
    const enemy = this.selectedEnemy()!;
    
    // Roll to hit
    const d20 = this.rollD20();
    const attackRoll = d20 + weapon.attackBonus;
    const isCrit = d20 === 20;
    const isMiss = d20 === 1;
    
    this.addLog(`🎲 ${this.getPlayerName()} attacca con ${weapon.name}: ${d20} + ${weapon.attackBonus} = ${attackRoll}`);
    
    // Play animation
    if (this.scene) {
      this.scene.playAnimation('attack');
      this.scene.showAttackEffect();
    }
    
    if (isMiss) {
      this.addLog(`❌ Fallimento critico!`);
      this.missedAttacks.update(m => m + 1);
    } else if (isCrit || attackRoll >= enemy.ac) {
      // Hit!
      let damage = this.rollDamage(weapon.damage);
      if (isCrit) {
        damage = damage * 2;
        this.addLog(`💥 CRITICO! Danni raddoppiati!`);
        this.criticalHits.update(c => c + 1);
      }
      
      this.enemyHP.update(hp => Math.max(0, hp - damage));
      this.totalDamageDealt.update(d => d + damage);
      this.addLog(`✅ Colpito! ${damage} danni ${weapon.damageType}`);
      
      if (this.scene) this.scene.shakeEnemy();
      
      if (this.enemyHP() <= 0) {
        this.victory();
        return;
      }
    } else {
      this.addLog(`❌ Mancato! (CA ${enemy.ac})`);
      this.missedAttacks.update(m => m + 1);
    }
    
    this.endPlayerTurn();
  }
  
  castSpell(spell: Spell) {
    if (!this.isPlayerTurn() || this.gamePhase() !== 'combat') return;
    
    this.selectedSpell.set(spell);
    const sheet = this.sheet()!;
    const enemy = this.selectedEnemy()!;
    
    // Play animation
    if (this.scene) {
      this.scene.playAnimation('spell');
      // Infer damage type from school
      const spellSchool = spell.school?.toLowerCase() || '';
      let damageType = 'magic';
      if (spellSchool.includes('evoc')) damageType = 'fire';
      else if (spellSchool.includes('necro')) damageType = 'necrotic';
      this.scene.showSpellEffect(damageType);
    }
    
    this.addLog(`✨ ${this.getPlayerName()} lancia ${spell.name}!`);
    this.spellsCast.update(s => s + 1);
    
    // Simple damage spell logic
    if (spell.level === 0) {
      // Cantrip - no slot needed
      const damage = this.rollDamage(this.getCantripDamage(spell, sheet.level));
      this.enemyHP.update(hp => Math.max(0, hp - damage));
      this.totalDamageDealt.update(d => d + damage);
      this.addLog(`💫 ${damage} danni magici!`);
      
      if (this.scene) this.scene.flashEnemy();
    } else {
      // Leveled spell - check slots
      const slots = sheet.spellSlots?.[spell.level];
      if (!slots || slots.current <= 0) {
        this.addLog(`⚠️ Nessuno slot di livello ${spell.level} disponibile!`);
        return;
      }
      
      // Use slot
      const damage = this.rollDamage(this.getSpellDamage(spell));
      this.enemyHP.update(hp => Math.max(0, hp - damage));
      this.totalDamageDealt.update(d => d + damage);
      this.addLog(`💫 ${damage} danni! (Slot lvl ${spell.level} usato)`);
      
      if (this.scene) this.scene.flashEnemy();
    }
    
    if (this.enemyHP() <= 0) {
      this.victory();
      return;
    }
    
    this.endPlayerTurn();
  }
  
  defend() {
    if (!this.isPlayerTurn() || this.gamePhase() !== 'combat') return;
    
    this.isDefending.set(true);
    this.addLog(`🛡️ ${this.getPlayerName()} si mette in difesa (+2 CA fino al prossimo turno)`);
    
    if (this.scene) this.scene.showDefendEffect();
    
    this.endPlayerTurn();
  }
  
  usePotion() {
    if (!this.isPlayerTurn() || this.gamePhase() !== 'combat') return;
    
    const healing = this.rollDamage('2d4+2');
    this.playerHP.update(hp => Math.min(this.playerMaxHP(), hp + healing));
    this.potionsUsed.update(p => p + 1);
    this.addLog(`🧪 ${this.getPlayerName()} beve una pozione! Recupera ${healing} HP`);
    
    if (this.scene) this.scene.showHealEffect();
    
    this.endPlayerTurn();
  }
  
  // ============ TURN MANAGEMENT ============
  
  endPlayerTurn() {
    this.isPlayerTurn.set(false);
    
    // Enemy turn after delay
    setTimeout(() => {
      this.enemyTurn();
    }, 1500);
  }
  
  enemyTurn() {
    if (this.gamePhase() !== 'combat') return;
    
    const enemy = this.selectedEnemy()!;
    const sheet = this.sheet()!;
    
    // Enemy attack
    const d20 = this.rollD20();
    const attackRoll = d20 + enemy.attackBonus;
    const playerAC = sheet.armorClass + (this.isDefending() ? 2 : 0);
    
    this.addLog(`👹 ${enemy.name} attacca: ${d20} + ${enemy.attackBonus} = ${attackRoll}`);
    
    // Enemy attack animation
    if (this.scene) this.scene.enemyAttack();
    
    if (d20 === 1) {
      this.addLog(`❌ ${enemy.name} fallisce miseramente!`);
    } else if (d20 === 20 || attackRoll >= playerAC) {
      let damage = this.rollDamage(enemy.damage);
      if (d20 === 20) {
        damage = damage * 2;
        this.addLog(`💥 CRITICO!`);
      }
      
      this.playerHP.update(hp => Math.max(0, hp - damage));
      this.totalDamageTaken.update(d => d + damage);
      this.addLog(`💔 Subisci ${damage} danni ${enemy.damageType}!`);
      
      if (this.scene) {
        this.scene.playAnimation('hurt');
        this.scene.shakePlayer();
      }
      
      if (this.playerHP() <= 0) {
        this.defeat();
        return;
      }
    } else {
      this.addLog(`🛡️ Parato! (CA ${playerAC})`);
    }
    
    // Special abilities
    if (enemy.abilities?.includes('Rigenerazione 10') && this.enemyHP() > 0) {
      this.enemyHP.update(hp => Math.min(this.enemyMaxHP(), hp + 10));
      this.addLog(`♻️ ${enemy.name} rigenera 10 HP!`);
    }
    
    // End enemy turn, start new round
    setTimeout(() => {
      this.isDefending.set(false);
      this.currentRound.update(r => r + 1);
      this.isPlayerTurn.set(true);
      this.addLog(`\n⚔️ Round ${this.currentRound()}`);
    }, 1000);
  }
  
  // ============ COMBAT END ============
  
  victory() {
    this.gamePhase.set('victory');
    const enemy = this.selectedEnemy()!;
    
    this.addLog(`\n🎉 VITTORIA!`);
    this.addLog(`${enemy.name} sconfitto!`);
    this.addLog(`Guadagni ${enemy.xp} XP!`);
    
    // Combat statistics
    this.addLog(`\n📊 STATISTICHE COMBATTIMENTO:`);
    this.addLog(`⚔️ Danni inflitti: ${this.totalDamageDealt()}`);
    this.addLog(`💔 Danni subiti: ${this.totalDamageTaken()}`);
    this.addLog(`🎯 Round totali: ${this.currentRound()}`);
    if (this.criticalHits() > 0) this.addLog(`💥 Colpi critici: ${this.criticalHits()}`);
    if (this.missedAttacks() > 0) this.addLog(`❌ Attacchi mancati: ${this.missedAttacks()}`);
    if (this.spellsCast() > 0) this.addLog(`✨ Incantesimi lanciati: ${this.spellsCast()}`);
    if (this.potionsUsed() > 0) this.addLog(`🧪 Pozioni usate: ${this.potionsUsed()}`);
    
    if (this.scene) {
      this.scene.enemyDeath();
      this.scene.showVictory();
    }
    
    // Save combat result
    this.saveCombatResult('victory');
  }
  
  defeat() {
    this.gamePhase.set('defeat');
    
    this.addLog(`\n💀 SCONFITTA!`);
    this.addLog(`${this.getPlayerName()} è caduto in battaglia...`);
    
    // Combat statistics
    this.addLog(`\n📊 STATISTICHE COMBATTIMENTO:`);
    this.addLog(`⚔️ Danni inflitti: ${this.totalDamageDealt()}`);
    this.addLog(`💔 Danni subiti: ${this.totalDamageTaken()}`);
    this.addLog(`🎯 Round totali: ${this.currentRound()}`);
    if (this.criticalHits() > 0) this.addLog(`💥 Colpi critici: ${this.criticalHits()}`);
    if (this.spellsCast() > 0) this.addLog(`✨ Incantesimi lanciati: ${this.spellsCast()}`);
    
    // Save combat result
    this.saveCombatResult('defeat');
  }
  
  async saveCombatResult(result: 'victory' | 'defeat') {
    const enemy = this.selectedEnemy()!;
    
    await this.db.saveCombatEncounter({
      character: this.character(),
      enemyName: enemy.name,
      enemyHP: this.enemyHP(),
      enemyMaxHP: this.enemyMaxHP(),
      enemyAC: enemy.ac,
      playerHP: this.playerHP(),
      playerMaxHP: this.playerMaxHP(),
      rounds: [],
      result
    });
    
    // Update character HP in database
    await this.db.updateCharacterHP(this.character(), this.playerHP());
  }
  
  // ============ UTILITY FUNCTIONS ============
  
  rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }
  
  rollDamage(diceString: string): number {
    const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return 1;
    
    const numDice = parseInt(match[1]);
    const diceSize = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    let total = modifier;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * diceSize) + 1;
    }
    
    return Math.max(1, total);
  }
  
  getCantripDamage(spell: Spell, level: number): string {
    // Scale cantrip damage by level
    if (level >= 17) return '4d10';
    if (level >= 11) return '3d10';
    if (level >= 5) return '2d10';
    return '1d10';
  }
  
  getSpellDamage(spell: Spell): string {
    // Simple damage estimation based on level
    const baseDice = spell.level * 2 + 1;
    return `${baseDice}d6`;
  }
  
  addLog(message: string) {
    this.combatLog.update(log => [...log, message]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      const logEl = document.querySelector('.combat-log');
      if (logEl) logEl.scrollTop = logEl.scrollHeight;
    }, 50);
  }
  
  getPlayerName(): string {
    return this.character().charAt(0).toUpperCase() + this.character().slice(1);
  }
  
  getEnemyIcon(enemy: Enemy): string {
    const icons: Record<string, string> = {
      'humanoid': '👤',
      'beast': '🐺',
      'undead': '💀',
      'giant': '🗿'
    };
    return icons[enemy.shape] || '👹';
  }
  
  getModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }
  
  resetCombat() {
    if (this.scene) this.scene.stopMusic();
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.scene = null;
    }
    
    this.gamePhase.set('setup');
    this.selectedEnemy.set(null);
    this.combatLog.set([]);
    this.currentRound.set(1);
    this.isDefending.set(false);
    
    // Reload sheet for fresh HP
    this.loadSheet();
  }

  ngOnDestroy() {
    if (this.scene) this.scene.stopMusic();
    if (this.game && isPlatformBrowser(this.platformId)) {
      this.game.destroy(true);
    }
  }

  goBack() {
    if (this.scene) this.scene.stopMusic();
    this.router.navigate([this.character(), 'home']);
  }
}
