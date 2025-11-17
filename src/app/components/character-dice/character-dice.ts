import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-character-dice',
  imports: [FormsModule],
  templateUrl: './character-dice.html',
  styleUrl: './character-dice.scss'
})
export class CharacterDice implements OnInit {
  characterName = '';
  characterRoute = '';
  modifier = 0;
  currentFace = signal<number | null>(null);
  isRolling = signal(false);
  information = signal('');
  private lastFace: number | null = null;
  private sides = 20;
  private animationDuration = 3000;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterRoute = this.route.snapshot.paramMap.get('character') || '';
    this.characterName = this.getCharacterName(this.characterRoute);
  }

  private getCharacterName(route: string): string {
    const names: Record<string, string> = {
      'asriel': 'Asriel',
      'auryn': 'Auryn',
      'ravel': 'Ravel',
      'ruben': 'Ruben'
    };
    return names[route] || '';
  }

  rollDice(): void {
    this.information.set('');
    this.isRolling.set(true);
    this.currentFace.set(null);

    setTimeout(() => {
      this.isRolling.set(false);
      const face = this.randomFace();
      this.currentFace.set(face);
      this.setInformation(face);
    }, this.animationDuration);
  }

  private randomFace(): number {
    let face = Math.floor((Math.random() * this.sides)) + 1;
    if (face === this.lastFace) {
      face = this.randomFace();
    }
    this.lastFace = face;
    return face;
  }

  private setInformation(face: number): void {
    if (face === 1) {
      this.information.set('Fallimento critico!!!');
    } else if (face === 20) {
      this.information.set('Successo critico!!!');
    } else {
      let value = face + (this.modifier || 0);
      if (value > 10) {
        this.information.set(`Complimenti per il tuo ${value}!`);
      } else {
        this.information.set(`Complimenti per il tuo ${value}! No dai sherzo!`);
      }
    }
  }

  goBack(): void {
    this.router.navigate([this.characterRoute, 'home']);
  }
}
