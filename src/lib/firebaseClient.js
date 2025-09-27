// Firebase client initialization and connectivity check for the browser
// Uses public VITE_* env vars defined in .env and on Netlify

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  off
} from 'firebase/database';

// Initialize Firebase App using the Web SDK configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Check RTDB connectivity using the special `.info/connected` path.
// Returns a Promise<boolean> that resolves after first event or timeout.
export function checkFirebaseConnection(timeoutMs = 5000) {
  return new Promise((resolve) => {
    try {
      const connectedRef = ref(db, '.info/connected');

      const timeout = setTimeout(() => {
        off(connectedRef);
        console.warn('[Firebase] Connectivity check timed out');
        resolve(false);
      }, timeoutMs);

      onValue(
        connectedRef,
        (snap) => {
          clearTimeout(timeout);
          off(connectedRef);
          const isConnected = !!snap.val();
          console.log('[Firebase] RTDB connected:', isConnected);
          resolve(isConnected);
        },
        (error) => {
          clearTimeout(timeout);
          off(connectedRef);
          console.error('[Firebase] RTDB connection error:', error?.message || error);
          resolve(false);
        }
      );
    } catch (err) {
      console.error('[Firebase] Initialization error:', err?.message || err);
      resolve(false);
    }
  });
}
