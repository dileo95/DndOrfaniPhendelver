import { Routes } from '@angular/router';
import { Intro } from './components/intro/intro';
import { CharacterHome } from './components/character-home/character-home';
import { CharacterCard } from './components/character-card/character-card';
import { CharacterHistory } from './components/character-history/character-history';
import { CharacterDice } from './components/character-dice/character-dice';
import { Diary } from './components/diary/diary';
import { DiaryPrevious } from './components/diary-previous/diary-previous';
import { DiaryStory } from './components/diary-story/diary-story';
import { Gallery } from './components/gallery/gallery';
import { GalleryArtbook } from './components/gallery-artbook/gallery-artbook';
import { Cracks } from './components/cracks/cracks';
import { PlayerNotes } from './components/player-notes/player-notes';
import { CharacterSheet } from './components/character-sheet/character-sheet';
import { CombatGame } from './components/combat-game/combat-game';
import { StoryMap } from './components/story-map/story-map';
import { Timeline } from './components/timeline/timeline';
import { Forgotten } from './components/forgotten/forgotten';
import { authGuard } from './guards/auth.guard';

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
    component: CharacterSheet,
    canActivate: [authGuard]
  },
  {
    path: ':character/combat',
    component: CombatGame,
    canActivate: [authGuard]
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
    path: 'diary/gallery',
    component: Gallery
  },
  {
    path: 'diary/artbook',
    component: GalleryArtbook
  },
  {
    path: 'diary/map',
    component: StoryMap
  },
  {
    path: 'diary/timeline',
    component: Timeline
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
