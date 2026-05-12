import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'player/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'match',
    renderMode: RenderMode.Client
  },
  {
    path: 'coach',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
