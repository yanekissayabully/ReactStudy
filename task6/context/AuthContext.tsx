"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authErrorMessage,
  logIn,
  logInWithGoogle,
  logOut,
  signUp,
  subscribeToAuth,
  type User,
} from "@/services/authService";

interface AuthContextValue {
  user: User | null;
  /** true until Firebase tells us whether someone is signed in (first check). */
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // onAuthStateChanged fires once on start (restoring the saved session)
    // and again on every login/logout - it is the single source of truth.
    return subscribeToAuth(
      (next) => {
        setUser(next);
        setLoading(false);
      },
      (message) => {
        setError(message);
        setLoading(false);
      },
    );
  }, []);

  // Wraps an auth action: clears the old error, catches a new one.
  // Returns true on success so pages can decide where to redirect.
  const run = useCallback(async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      return true;
    } catch (e) {
      setError(authErrorMessage(e));
      return false;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      signup: (email, password) => run(() => signUp(email, password)),
      login: (email, password) => run(() => logIn(email, password)),
      loginWithGoogle: () => run(() => logInWithGoogle()),
      logout: async () => {
        await run(() => logOut());
      },
      clearError: () => setError(null),
    }),
    [user, loading, error, run],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
