import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: '**',
    redirectTo: '',
  },
];