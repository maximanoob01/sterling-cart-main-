import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let firebaseApp;

export const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.warn('⚠️  Firebase Admin init failed (auth will not work):', error.message);
    // Initialize without credentials for development/testing
    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp();
    }
  }

  return firebaseApp;
};

export const getAuth = () => admin.auth();

export default admin;
