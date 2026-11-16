import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Next.js inlines NEXT_PUBLIC_* variables at build time, but ONLY when they are
// written out literally like this (process.env[name] would not work).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

// Lazy on purpose: Next.js pre-renders pages on the server at build time, where
// there may be no keys. Calling getAuth() only when needed (in the browser)
// keeps the build from crashing.
export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and fill in your keys.",
    );
  }
  return getAuth(getFirebaseApp());
}
