import { Routes } from '@angular/router';
import { onboardingGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth shell
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth-shell/auth-shell.component').then((m) => m.AuthShellComponent),
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Child shell — requires onboarding complete
  {
    path: 'child',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./layout/child-shell/child-shell.component').then((m) => m.ChildShellComponent),
    loadChildren: () =>
      import('./features/child/child.routes').then((m) => m.CHILD_ROUTES),
  },

  // Parent shell — requires onboarding complete
  {
    path: 'parent',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./layout/parent-shell/parent-shell.component').then((m) => m.ParentShellComponent),
    loadChildren: () =>
      import('./features/parent/parent.routes').then((m) => m.PARENT_ROUTES),
  },

  // Default: go to sign-in (guard will redirect authenticated users)
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];
