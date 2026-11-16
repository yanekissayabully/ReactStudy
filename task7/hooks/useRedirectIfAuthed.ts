"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Only allow same-site paths, so "?next=https://evil.com" cannot be abused.
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/profile";
}

// Used on /login and /signup: once someone is signed in (just now, or from a
// saved session) send them to the page they originally wanted.
export function useRedirectIfAuthed() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  return { next };
}
