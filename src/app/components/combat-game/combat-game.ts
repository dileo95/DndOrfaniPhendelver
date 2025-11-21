import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, CharacterSheet as Sheet } from '../../services/database.service';

// Phaser will be imported dynamically only in browser
let Phaser: any;
let CombatScene: any;

// Factory function to create CombatScene class after Phaser is loaded
function createCombatScene(PhaserLib: any) {
  return class extends PhaserLib.Scene {
    private playerSprite!: any;
    private enemySprite!: any;
    private playerHPBar!: any;
    private enemyHPBar!: any;
    private logText!: any;
    private turnText!: any;
    private bgMusic!: any;
  
  playerHP = 0;
  playerMaxHP = 0;
  playerAC = 0;
  playerAttackBonus = 0;
  playerDamage = '1d8+3';
  playerName = 'Hero';
  character = 'asriel';
  
  enemyHP = 0;
  enemyMaxHP = 0;
  enemyAC = 0;
  enemyAttackBonus = 0;
  enemyDamage = '1d8+2';
  enemyName = 'Goblin';
  
  combatLog: string[] = [];
  isPlayerTurn = true;
  gameOver = false;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: any) {
    this.playerHP = data.playerHP || 30;
    this.playerMaxHP = data.playerMaxHP || 30;
    this.playerAC = data.playerAC || 15;
    this.playerAttackBonus = data.playerAttackBonus || 5;
    this.playerDamage = data.playerDamage || '1d8+3';
    this.playerName = data.playerName || 'Hero';
    this.character = data.character || 'asriel';
    
    this.enemyMaxHP = data.enemyMaxHP || 20;
    this.enemyHP = this.enemyMaxHP;
    this.enemyAC = data.enemyAC || 13;
    this.enemyName = data.enemyName || 'Goblin';
  }

  preload() {
    this['load'].image('fightScene', './assets/img/fight_scene1.png');
    this['load'].audio('bgMusic', './assets/sound/combat-music.WAV');
    
    // Load character spritesheets dynamically (64x64 per frame, row 4 for SE direction)
    const charPath = `./assets/spritesheet/${this.character}_animation/standard`;
    this['load'].spritesheet('player_idle', `${charPath}/combat_idle.png`, {
      frameWidth: 64,
      frameHeight: 64
    });
    this['load'].spritesheet('player_attack', `${charPath}/halfslash.png`, {
      frameWidth: 64,
      frameHeight: 64
    });
    this['load'].spritesheet('player_spell', `${charPath}/spellcast.png`, {
      frameWidth: 64,
      frameHeight: 64
    });
    this['load'].spritesheet('player_hurt', `${charPath}/hurt.png`, {
      frameWidth: 64,
      frameHeight: 64
    });
  }

  create() {
    const { width, height } = this['cameras'].main;

    // Add background image
    const bg = this['add'].image(width / 2, height / 2, 'fightScene');
    bg.setDisplaySize(width, height);
    bg.setDepth(0);

    // Add background music with loop
    this.bgMusic = this['sound'].add('bgMusic', {
      volume: 0.3,
      loop: true
    });
    this.bgMusic.play();

    // Create player sprite with dynamic character
    this.playerSprite = this['add'].sprite(200, height / 2, 'player_idle');
    this.playerSprite.setScale(2); // Scale up for visibility

    // Create animations - Row 4 for all spritesheets
    // Idle: 2 cols (128px), row 4 = frames 6-7
    this['anims'].create({
      key: 'player_idle',
      frames: this['anims'].generateFrameNumbers('player_idle', { start: 6, end: 7 }),
      frameRate: 6,
      repeat: -1
    });

    // Attack (halfslash): 6 cols (384px), row 4 = frames 18-23
    this['anims'].create({
      key: 'player_attack',
      frames: this['anims'].generateFrameNumbers('player_attack', { start: 18, end: 23 }),
      frameRate: 12,
      repeat: 0
    });

    // Spell: 7 cols (448px), row 4 = frames 21-27
    this['anims'].create({
      key: 'player_spell',
      frames: this['anims'].generateFrameNumbers('player_spell', { start: 21, end: 27 }),
      frameRate: 10,
      repeat: 0
    });

    // Hurt: 6 cols × 1 row (384×64px), frames 0-5
    this['anims'].create({
      key: 'player_hurt',
      frames: this['anims'].generateFrameNumbers('player_hurt', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });

    this.playerSprite.play('player_idle');
    this.playerSprite.setDepth(10);

    this['add'].text(200, height / 2 + 80, this.playerName, { fontSize: '16px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 5, y: 2 } }).setOrigin(0.5).setDepth(10);

    // Enemy sprite
    this.enemySprite = this['add'].rectangle(width - 150, height / 2, 60, 100, 0xff4444);
    this.enemySprite.setDepth(10);
    this['add'].text(width - 150, height / 2 + 70, this.enemyName, { fontSize: '16px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 5, y: 2 } }).setOrigin(0.5).setDepth(10);

    this.playerHPBar = this['add'].graphics();
    this.playerHPBar.setDepth(10);
    this.enemyHPBar = this['add'].graphics();
    this.enemyHPBar.setDepth(10);
    this.updateHPBars();

    this.turnText = this['add'].text(width / 2, 30, 'YOUR TURN', {
      fontSize: '24px',
      color: '#d4af37',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);

    this.logText = this['add'].text(20, height - 150, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: width - 40 }
    }).setDepth(20);

    this.createButtons();

    this.addToLog('Combat started!');
  }

  createButtons() {
    const { width, height } = this['cameras'].main;
    const buttonY = height - 40;

    const attackBtn = this['add'].rectangle(width / 2 - 120, buttonY, 100, 40, 0xd4af37)
      .setInteractive()
      .on('pointerdown', () => this.playerAttack())
      .setDepth(10);
    
    this['add'].text(width / 2 - 120, buttonY, 'ATTACK', { fontSize: '16px', color: '#000000' }).setOrigin(0.5).setDepth(10);

    const spellBtn = this['add'].rectangle(width / 2, buttonY, 100, 40, 0x9c27b0)
      .setInteractive()
      .on('pointerdown', () => this.playerSpell())
      .setDepth(10);
    
    this['add'].text(width / 2, buttonY, 'SPELL', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setDepth(10);

    const defendBtn = this['add'].rectangle(width / 2 + 120, buttonY, 100, 40, 0x2196f3)
      .setInteractive()
      .on('pointerdown', () => this.playerDefend())
      .setDepth(10);
    
    this['add'].text(width / 2 + 120, buttonY, 'DEFEND', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setDepth(10);
  }

  playerAttack() {
    if (!this.isPlayerTurn || this.gameOver) return;

    const attackRoll = Phaser.Math.Between(1, 20) + this.playerAttackBonus;
    this.addToLog(`${this.playerName} rolled ${attackRoll} to hit (AC ${this.enemyAC})`);

    if (attackRoll >= this.enemyAC) {
      const damage = this.rollDamage(this.playerDamage);
      this.enemyHP -= damage;
      this.addToLog(`HIT! Dealt ${damage} damage!`);
      
      // Play attack animation
      this.playerSprite.play('player_attack');
      this.playerSprite.once('animationcomplete', () => {
        if (!this.gameOver) {
          this.playerSprite.play('player_idle');
        }
      });
      
      this['tweens'].add({
        targets: this.enemySprite,
        x: this.enemySprite.x + 20,
        duration: 100,
        yoyo: true
      });
      
      if (this.enemyHP <= 0) {
        this.enemyHP = 0;
        this.victory();
        return;
      }
    } else {
      this.addToLog('MISS!');
    }

    this.updateHPBars();
    
    // Wait for animation to complete before ending turn
    this['time'].delayedCall(500, () => {
      if (!this.gameOver) {
        this.endPlayerTurn();
      }
    });
  }

  playerSpell() {
    if (!this.isPlayerTurn || this.gameOver) return;

    const damage = Phaser.Math.Between(8, 12);
    this.enemyHP -= damage;
    this.addToLog(`Cast Eldritch Blast! Dealt ${damage} force damage!`);

    // Play spell animation
    this.playerSprite.play('player_spell');
    this.playerSprite.once('animationcomplete', () => {
      if (!this.gameOver) {
        this.playerSprite.play('player_idle');
      }
    });

    this['tweens'].add({
      targets: this.enemySprite,
      alpha: 0.5,
      duration: 200,
      yoyo: true
    });

    if (this.enemyHP <= 0) {
      this.enemyHP = 0;
      this.victory();
      return;
    }

    this.updateHPBars();
    
    // Wait for animation to complete before ending turn
    this['time'].delayedCall(700, () => {
      if (!this.gameOver) {
        this.endPlayerTurn();
      }
    });
  }

  playerDefend() {
    if (!this.isPlayerTurn || this.gameOver) return;

    this.addToLog('You take a defensive stance (+2 AC until next turn)');
    this.playerAC += 2;
    
    this.endPlayerTurn();
    
    this['time'].delayedCall(2000, () => {
      this.playerAC -= 2;
    });
  }

  endPlayerTurn() {
    this.isPlayerTurn = false;
    this.turnText.setText('ENEMY TURN');
    
    this['time'].delayedCall(1500, () => {
      this.enemyAttack();
    });
  }

  enemyAttack() {
    if (this.gameOver) return;

    const attackRoll = Phaser.Math.Between(1, 20) + this.enemyAttackBonus;
    this.addToLog(`${this.enemyName} rolled ${attackRoll} to hit (AC ${this.playerAC})`);

    if (attackRoll >= this.playerAC) {
      const damage = this.rollDamage(this.enemyDamage);
      this.playerHP -= damage;
      this.addToLog(`${this.enemyName} HIT! You took ${damage} damage!`);
      
      // Play hurt animation
      this.playerSprite.play('player_hurt');
      this.playerSprite.once('animationcomplete', () => {
        if (!this.gameOver) {
          this.playerSprite.play('player_idle');
        }
      });
      
      this['tweens'].add({
        targets: this.playerSprite,
        x: this.playerSprite.x - 20,
        duration: 100,
        yoyo: true
      });

      if (this.playerHP <= 0) {
        this.playerHP = 0;
        this.defeat();
        return;
      }
    } else {
      this.addToLog(`${this.enemyName} MISSED!`);
    }

    this.updateHPBars();
    
    this['time'].delayedCall(1500, () => {
      if (!this.gameOver) {
        this.isPlayerTurn = true;
        this.turnText.setText('YOUR TURN');
      }
    });
  }

  rollDamage(diceString: string): number {
    const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return 1;

    const numDice = parseInt(match[1]);
    const diceSize = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let total = modifier;
    for (let i = 0; i < numDice; i++) {
      total += Phaser.Math.Between(1, diceSize);
    }

    return Math.max(1, total);
  }

  updateHPBars() {
    const barWidth = 100;
    const barHeight = 10;

    this.playerHPBar.clear();
    const playerHPPercent = this.playerHP / this.playerMaxHP;
    this.playerHPBar.fillStyle(0x333333);
    this.playerHPBar.fillRect(100, 150, barWidth, barHeight);
    this.playerHPBar.fillStyle(0x00ff00);
    this.playerHPBar.fillRect(100, 150, barWidth * playerHPPercent, barHeight);

    this.enemyHPBar.clear();
    const enemyHPPercent = this.enemyHP / this.enemyMaxHP;
    this.enemyHPBar.fillStyle(0x333333);
    this.enemyHPBar.fillRect(this['cameras'].main.width - 200, 150, barWidth, barHeight);
    this.enemyHPBar.fillStyle(0xff0000);
    this.enemyHPBar.fillRect(this['cameras'].main.width - 200, 150, barWidth * enemyHPPercent, barHeight);
  }

  addToLog(message: string) {
    this.combatLog.push(message);
    if (this.combatLog.length > 5) {
      this.combatLog.shift();
    }
    this.logText.setText(this.combatLog.join('\n'));
  }

  victory() {
    this.gameOver = true;
    this.addToLog(`\n🎉 VICTORY! ${this.enemyName} defeated!`);
    this.turnText.setText('VICTORY!').setColor('#00ff00');
    
    this['tweens'].add({
      targets: this.enemySprite,
      alpha: 0,
      duration: 1000
    });
  }

  defeat() {
    this.gameOver = true;
    this.addToLog('\n💀 DEFEAT! You have fallen...');
    this.turnText.setText('DEFEAT').setColor('#ff0000');
    
    this['tweens'].add({
      targets: this.playerSprite,
      alpha: 0,
      duration: 1000
    });
  }
  };
}

@Component({
  selector: 'app-combat-game',
  imports: [CommonModule],
  templateUrl: './combat-game.html',
  styleUrl: './combat-game.scss',
})
export class CombatGame implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef<HTMLDivElement>;
  
  character = signal<string>('');
  sheet = signal<Sheet | null>(null);
  private game!: Phaser.Game;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    this.character.set(this.route.snapshot.paramMap.get('character') || '');
    await this.loadSheet();
    
    // Only load Phaser and init game in browser
    if (isPlatformBrowser(this.platformId)) {
      Phaser = (await import('phaser')).default;
      CombatScene = createCombatScene(Phaser);
      this.initGame();
    }
  }

  async loadSheet() {
    const sheet = await this.db.getCharacterSheet(this.character());
    this.sheet.set(sheet || null);
  }

  initGame() {
    const sheet = this.sheet();
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: this.gameContainer.nativeElement,
      backgroundColor: '#1a1a2e',
      scene: CombatScene
    };

    this.game = new Phaser.Game(config);

    this.game.scene.start('CombatScene', {
      playerHP: sheet?.currentHP || 30,
      playerMaxHP: sheet?.maxHP || 30,
      playerAC: sheet?.armorClass || 15,
      playerAttackBonus: sheet?.weapons[0]?.attackBonus || 5,
      playerDamage: sheet?.weapons[0]?.damage || '1d8+3',
      playerName: this.character().charAt(0).toUpperCase() + this.character().slice(1),
      character: this.character(),
      enemyName: 'Goblin Warrior',
      enemyMaxHP: 20,
      enemyAC: 13
    });
  }

  ngOnDestroy() {
    if (this.game && isPlatformBrowser(this.platformId)) {
      this.game.destroy(true);
    }
  }

  goBack() {
    this.router.navigate([this.character(), 'home']);
  }
}
