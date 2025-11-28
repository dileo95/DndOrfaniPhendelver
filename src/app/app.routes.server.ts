import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'diary',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'diary/previous',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'diary/story',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'diary/artbook',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'cracks',
    renderMode: RenderMode.Prerender
  },
  {
    path: ':character/home',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { character: 'asriel' },
        { character: 'auryn' },
        { character: 'ravel' },
        { character: 'ruben' }
      ];
    }
  },
  {
    path: ':character/card',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { character: 'asriel' },
        { character: 'auryn' },
        { character: 'ravel' },
        { character: 'ruben' }
      ];
    }
  },
  {
    path: ':character/history',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { character: 'asriel' },
        { character: 'auryn' },
        { character: 'ravel' },
        { character: 'ruben' }
      ];
    }
  },
  {
    path: ':character/dice',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { character: 'asriel' },
        { character: 'auryn' },
        { character: 'ravel' },
        { character: 'ruben' }
      ];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
