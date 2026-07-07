import { Environment } from './environment.model';

export const environment: Environment = {
    production: false,
    useEmulators: false,
    firebase: {
        apiKey: "AIzaSyDdfxrRS2ec_dtbmEy1TUzFuy2hRK4XQqs",
        authDomain: "milabuddycare.firebaseapp.com",
        projectId: "milabuddycare",
        storageBucket: "milabuddycare.firebasestorage.app",
        messagingSenderId: "668421028287",
        appId: "1:668421028287:web:1d861b98435357e524c90a",
        measurementId: "G-6KVCW44323"
    },
    emulators: {
        auth: { host: 'localhost', port: 9099 },
        firestore: { host: 'localhost', port: 8080 },
        functions: { host: 'localhost', port: 5001 },
        storage: { host: 'localhost', port: 9199 },
    },
    logging: {
        level: 'debug',
    },
};
