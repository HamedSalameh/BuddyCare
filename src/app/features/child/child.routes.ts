import { Routes } from '@angular/router';

export const CHILD_ROUTES: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'check-in',
    loadComponent: () =>
      import('./pages/check-in/check-in.component').then((m) => m.CheckInComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.component').then((m) => m.ChildHistoryComponent),
  },
  {
    path: 'garden',
    loadComponent: () =>
      import('./pages/garden/garden.component').then((m) => m.GardenComponent),
  },
  {
    path: 'aquarium',
    loadComponent: () =>
      import('./pages/aquarium/aquarium.component').then((m) => m.AquariumComponent),
  },
  {
    path: 'more',
    loadComponent: () =>
      import('./pages/more/more.component').then((m) => m.ChildMoreComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
