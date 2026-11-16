import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export type { User };

// All Firebase Auth calls live here. Components and the AuthContext never import
// "firebase/auth" directly, so swapping the provider only touches this file.

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address is not valid.",
  "auth/missing-password": "Please enter your password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak - use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "The browser blocked the Google sign-in popup.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled in the Firebase console.",
  "auth/unauthorized-domain":
    "This domain is not authorized in Firebase (Authentication > Settings > Authorized domains).",
};

export function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      ERROR_MESSAGES[error.code] ?? `Authentication failed (${error.code}).`
    );
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function subscribeToAuth(
  onChange: (user: User | null) => void,
  onError: (message: string) => void,
): () => void {
  if (!isFirebaseConfigured) {
    onError(
      "Firebase is not configured. Copy .env.example to .env.local and add your keys.",
    );
    onChange(null);
    return () => {};
  }

  const auth = getFirebaseAuth();
  // Persistent session: the user stays signed in after a page refresh or
  // browser restart (stored in IndexedDB/localStorage by the Firebase SDK).
  setPersistence(auth, browserLocalPersistence).catch(() => {});

  return onAuthStateChanged(auth, onChange, (error) =>
    onError(authErrorMessage(error)),
  );
}

export async function signUp(email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  return credential.user;
}

export async function logIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  return credential.user;
}

export async function logInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(
    getFirebaseAuth(),
    new GoogleAuthProvider(),
  );
  return credential.user;
}

export function logOut(): Promise<void> {
  return signOut(getFirebaseAuth());
}
