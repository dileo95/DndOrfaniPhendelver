import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Scroll } from '../../services/scroll';

interface CharacterConfig {
  name: string;
  backgroundColor: string;
  class: string;
}

@Component({
  selector: 'app-character-home',
  imports: [],
  templateUrl: './character-home.html',
  styleUrl: './character-home.scss',
})
export class CharacterHome implements OnInit, OnDestroy {
  characterName = '';
  backgroundColor = '';
  characterClass = '';
  characterRoute = '';

  private characterConfigs: Record<string, CharacterConfig> = {
    'asriel': { name: 'Asriel', backgroundColor: '#39933894', class: 'asriel' },
    'auryn': { name: 'Auryn', backgroundColor: '#2d589e94', class: 'auryn' },
    'ravel': { name: 'Ravel', backgroundColor: '#a8385794', class: 'ravel' },
    'ruben': { name: 'Ruben', backgroundColor: '#a13a3a94', class: 'ruben' }
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
      this.backgroundColor = config.backgroundColor;
      this.characterClass = config.class;
    }

    // Scroll enabled by default for character home navigation
  }

  navigate(section: 'history' | 'card' | 'dice' | 'notes' | 'sheet' | 'combat'): void {
    this.router.navigate([this.characterRoute, section]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    // No need to re-enable scroll
  }
}
