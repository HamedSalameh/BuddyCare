import { Environment } from './environment.model';

// Emulator configuration — uses local Firebase emulators. No real Firebase credentials needed.
export const environment: Environment = {
  production: false,
  useEmulators: true,
  firebase: {
    apiKey:            'demo-key',
    authDomain:        'localhost',
    projectId:         'demo-buddycare',
    storageBucket:     'demo-buddycare.appspot.com',
    messagingSenderId: '000000000000',
    appId:             '1:000000000000:web:0000000000000000',
  },
  emulators: {
    auth:      { host: 'localhost', port: 9099 },
    firestore: { host: 'localhost', port: 8080 },
    functions: { host: 'localhost', port: 5001 },
    storage:   { host: 'localhost', port: 9199 },
  },
  logging: {
    level: 'debug',
  },
};
