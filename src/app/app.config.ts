import {
  ApplicationConfig,
  ErrorHandler,
  Injectable,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

// ── Global error handler ───────────────────────────────────────────────────────
// Catches all unhandled Angular errors. In production it suppresses noisy
// framework-internal errors and logs everything else to the console.
// Wire to Firebase Crashlytics / Analytics here when ready.
@Injectable()
class BcErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const msg = String(error);
    if (!isDevMode()) {
      if (msg.includes('ExpressionChangedAfterItHasBeenCheckedError')) return;
      if (msg.includes('NG0100')) return; // same error, NG code form
    }
    console.error('[BuddyCare]', error);
  }
}

import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateLoader, provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { environment } from '@env/environment';
import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_FUNCTIONS,
  FIREBASE_STORAGE,
  FIREBASE_ANALYTICS,
  provideFirebaseApp,
  provideFirebaseAuth,
  provideFirebaseFirestore,
  provideFirebaseFunctions,
  provideFirebaseStorage,
  provideFirebaseAnalytics,
} from './core/firebase/firebase.providers';
import { FirebaseApp } from 'firebase/app';

export const appConfig: ApplicationConfig = {
  providers: [
    // ── Core ────────────────────────────────────────────────────────────────
    { provide: ErrorHandler, useClass: BcErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),

    // ── Router ──────────────────────────────────────────────────────────────
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withViewTransitions(),
    ),

    // ── i18n (ngx-translate v18 standalone) ─────────────────────────────────
    // Step 1: configure service with language + fallback
    ...provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
    // Step 2: register TranslateLoader → TranslateHttpLoader explicitly
    provideTranslateLoader(TranslateHttpLoader),
    // Step 3: configure the HTTP loader (prefix/suffix for translation file URLs)
    ...provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),

    // ── Firebase ────────────────────────────────────────────────────────────
    {
      provide: FIREBASE_APP,
      useFactory: () => provideFirebaseApp(environment),
    },
    {
      provide: FIREBASE_AUTH,
      useFactory: (app: FirebaseApp) => provideFirebaseAuth(environment, app),
      deps: [FIREBASE_APP],
    },
    {
      provide: FIREBASE_FIRESTORE,
      useFactory: (app: FirebaseApp) => provideFirebaseFirestore(environment, app),
      deps: [FIREBASE_APP],
    },
    {
      provide: FIREBASE_FUNCTIONS,
      useFactory: (app: FirebaseApp) => provideFirebaseFunctions(environment, app),
      deps: [FIREBASE_APP],
    },
    {
      provide: FIREBASE_STORAGE,
      useFactory: (app: FirebaseApp) => provideFirebaseStorage(environment, app),
      deps: [FIREBASE_APP],
    },
    {
      provide: FIREBASE_ANALYTICS,
      useFactory: (app: FirebaseApp) => provideFirebaseAnalytics(app),
      deps: [FIREBASE_APP],
    },

    // ── Service Worker (PWA) ─────────────────────────────────────────────────
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
