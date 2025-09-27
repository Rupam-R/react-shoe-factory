import admin from 'firebase-admin';

// Initialize Firebase Admin SDK using environment variables
// Required env vars:
// - FIREBASE_SERVICE_ACCOUNT: JSON string of the service account
// - DATABASE_URL: Firebase RTDB URL (e.g., https://your-project.firebaseio.com)

let app;

export function getFirebase() {
  if (app) return { admin, app, db: admin.database() };

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.DATABASE_URL;

  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not set in environment variables');
  }
  if (!databaseURL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  } else {
    app = admin.app();
  }

  return { admin, app, db: admin.database() };
}
