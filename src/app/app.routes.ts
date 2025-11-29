import { Routes } from '@angular/router';
import { Intro } from './components/intro/intro';
import { CharacterHome } from './components/character-home/character-home';
import { CharacterCard } from './components/character-card/character-card';
import { CharacterHistory } from './components/character-history/character-history';
import { CharacterDice } from './components/character-dice/character-dice';
import { Diary } from './components/diary/diary';
import { DiaryPrevious } from './components/diary-previous/diary-previous';
import { DiaryStory } from './components/diary-story/diary-story';
import { Cracks } from './components/cracks/cracks';
import { PlayerNotes } from './components/player-notes/player-notes';
import { Forgotten } from './components/forgotten/forgotten';
import { authGuard } from './guards/auth.guard';
import { combatGuard } from './guards/combat.guard';

export const routes: Routes = [
  {
    path: '',
    component: Intro
  },
  {
    path: ':character/home',
    component: CharacterHome,
    canActivate: [authGuard]
  },
  {
    path: ':character/card',
    component: CharacterCard,
    canActivate: [authGuard]
  },
  {
    path: ':character/history',
    component: CharacterHistory,
    canActivate: [authGuard]
  },
  {
    path: ':character/dice',
    component: CharacterDice,
    canActivate: [authGuard]
  },
  {
    path: ':character/notes',
    component: PlayerNotes,
    canActivate: [authGuard]
  },
  {
    path: ':character/sheet',
    loadComponent: () => import('./components/character-sheet/character-sheet').then(m => m.CharacterSheet),
    canActivate: [authGuard]
  },
  {
    path: ':character/combat',
    loadComponent: () => import('./components/combat-game/combat-game').then(m => m.CombatGame),
    canActivate: [combatGuard]
  },
  {
    path: 'diary',
    component: Diary
  },
  {
    path: 'diary/previous',
    component: DiaryPrevious
  },
  {
    path: 'diary/story',
    component: DiaryStory
  },
  {
    path: 'diary/artbook',
    loadComponent: () => import('./components/gallery-artbook/gallery-artbook').then(m => m.GalleryArtbook)
  },
  {
    path: 'diary/map',
    loadComponent: () => import('./components/story-map/story-map').then(m => m.StoryMap)
  },
  {
    path: 'diary/timeline',
    loadComponent: () => import('./components/timeline/timeline').then(m => m.Timeline)
  },
  {
    path: 'cracks',
    component: Cracks
  },
  {
    path: 'forgotten',
    component: Forgotten
  },
  {
    path: '**',
    redirectTo: ''
  }
];
