import { FirebaseOptions } from 'firebase/app';

export interface Environment {
  production: boolean;
  useEmulators: boolean;
  firebase: FirebaseOptions;
  emulators: {
    auth: { host: string; port: number };
    firestore: { host: string; port: number };
    functions: { host: string; port: number };
    storage: { host: string; port: number };
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  };
}
