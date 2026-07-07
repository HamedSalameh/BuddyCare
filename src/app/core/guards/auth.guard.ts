import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

/**
 * Redirects unauthenticated users to /auth/sign-in.
 * Waits for the auth loading state to resolve before deciding.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return toObservable(authService.status).pipe(
    filter(s => s !== 'loading'),
    take(1),
    map(s => {
      if (s === 'authenticated') return true;
      return router.createUrlTree(['/auth/sign-in']);
    }),
  );
};

/**
 * Redirects authenticated users away from auth pages (sign-in/sign-up).
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return toObservable(authService.status).pipe(
    filter(s => s !== 'loading'),
    take(1),
    map(s => {
      if (s === 'unauthenticated') return true;
      // Already logged in — go to child home (or onboarding if no family)
      if (!authService.hasFamily()) {
        return router.createUrlTree(['/auth/onboarding']);
      }
      return router.createUrlTree(['/child/home']);
    }),
  );
};

/**
 * Ensures user has completed onboarding (has a family + at least one child).
 * If not, redirects to onboarding.
 */
export const onboardingGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return toObservable(authService.status).pipe(
    filter(s => s !== 'loading'),
    take(1),
    map(s => {
      if (s === 'unauthenticated') {
        return router.createUrlTree(['/auth/sign-in']);
      }
      if (!authService.hasFamily() || !authService.hasChildren()) {
        return router.createUrlTree(['/auth/onboarding']);
      }
      return true;
    }),
  );
};
