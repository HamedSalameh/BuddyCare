import { inject, InjectionToken } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentSingleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { Environment } from '@env/environment.model';

// ─── Injection tokens ──────────────────────────────────────────────────────
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('FIREBASE_FIRESTORE');
export const FIREBASE_FUNCTIONS = new InjectionToken<Functions>('FIREBASE_FUNCTIONS');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');
export const FIREBASE_ANALYTICS = new InjectionToken<Analytics | null>('FIREBASE_ANALYTICS');

// ─── Factory helpers ───────────────────────────────────────────────────────

export function provideFirebaseApp(env: Environment): FirebaseApp {
  return initializeApp(env.firebase);
}

export function provideFirebaseAuth(env: Environment, app: FirebaseApp): Auth {
  const auth = getAuth(app);
  if (env.useEmulators) {
    connectAuthEmulator(auth, `http://${env.emulators.auth.host}:${env.emulators.auth.port}`, {
      disableWarnings: true,
    });
  }
  return auth;
}

export function provideFirebaseFirestore(env: Environment, app: FirebaseApp): Firestore {
  const db = initializeFirestore(app, {
    // Single-tab manager avoids multi-tab IndexedDB owner-election issues on Android.
    // Without this, onSnapshot can silently serve stale cache when the PWA resumes.
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({ forceOwnership: true }),
    }),
    // Auto-detect when WebSocket is blocked (common on mobile networks) and fall
    // back to HTTP long-polling so real-time updates keep working.
    experimentalAutoDetectLongPolling: true,
  });
  if (env.useEmulators) {
    connectFirestoreEmulator(db, env.emulators.firestore.host, env.emulators.firestore.port);
  }
  return db;
}

export function provideFirebaseFunctions(env: Environment, app: FirebaseApp): Functions {
  const functions = getFunctions(app);
  if (env.useEmulators) {
    connectFunctionsEmulator(
      functions,
      env.emulators.functions.host,
      env.emulators.functions.port,
    );
  }
  return functions;
}

export function provideFirebaseStorage(env: Environment, app: FirebaseApp): FirebaseStorage {
  const storage = getStorage(app);
  if (env.useEmulators) {
    connectStorageEmulator(storage, env.emulators.storage.host, env.emulators.storage.port);
  }
  return storage;
}

export function provideFirebaseAnalytics(app: FirebaseApp): Analytics | null {
  try {
    return getAnalytics(app);
  } catch {
    // Analytics not available (e.g. emulator, unsupported browser)
    return null;
  }
}
