import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'sign-in',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/sign-in/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: 'sign-up',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
];
