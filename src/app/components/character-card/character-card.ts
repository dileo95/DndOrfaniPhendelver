import { Component, OnInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Scroll } from '../../services/scroll';

interface CharacterCardConfig {
  name: string;
  image: string;
}

@Component({
  selector: 'app-character-card',
  imports: [],
  templateUrl: './character-card.html',
  styleUrl: './character-card.scss',
})
export class CharacterCard implements OnInit, OnDestroy {
  characterName = '';
  cardImage = '';
  characterRoute = '';

  cardElement = viewChild<ElementRef<HTMLDivElement>>('cardElement');

  private characterConfigs: Record<string, CharacterCardConfig> = {
    'asriel': { name: 'Asriel', image: '/assets/img/1732548390648444.png' },
    'auryn': { name: 'Auryn', image: '/assets/img/1732611316478019.png' },
    'ravel': { name: 'Ravel', image: '/assets/img/1732615783594140.png' },
    'ruben': { name: 'Ruben', image: '/assets/img/Ruben.png' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scroll: Scroll
  ) {}

  ngOnInit(): void {
    this.characterRoute = this.route.snapshot.paramMap.get('character') || '';
    const config = this.characterConfigs[this.characterRoute];
    
    if (config) {
      this.characterName = config.name;
      this.cardImage = config.image;
    }

    this.scroll.disable();
  }

  ngOnDestroy(): void {
    this.scroll.enable();
  }

  onTouchStart(event: TouchEvent): void {
    this.handleTouchMove(event.touches[0]);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.handleTouchMove(event.touches[0]);
  }

  onTouchEnd(): void {
    const card = this.cardElement()?.nativeElement;
    if (card) {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  }

  private handleTouchMove(touch: Touch): void {
    const card = this.cardElement()?.nativeElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 10;
    const rotateY = (x - centerX) / 10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  goBack(): void {
    this.router.navigate([this.characterRoute, 'home']);
  }
}
