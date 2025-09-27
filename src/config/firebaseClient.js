// Firebase Web SDK initialization using Vite environment variables
// Configure these in your .env (local) and Netlify site environment variables (production)
// See .env.example for the full list

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';

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

let app;
let analytics;

export function getFirebaseApp() {
  if (!app) {
    // Avoid initializing multiple times during HMR
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export async function getFirebaseAnalytics() {
  const app = getFirebaseApp();
  try {
    if (await analyticsSupported()) {
      analytics = analytics || getAnalytics(app);
      return analytics;
    }
  } catch (_) {
    // analytics not supported (likely non-browser environment)
  }
  return null;
}
