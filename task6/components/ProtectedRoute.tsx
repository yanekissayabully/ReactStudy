"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Remember where the user wanted to go; login sends them back there.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  // While Firebase restores the saved session we do NOT redirect - otherwise a
  // refresh on /profile would bounce a signed-in user to /login.
  if (loading || !user) {
    return (
      <p style={{ padding: 24 }} aria-busy="true" role="status">
        Checking your session…
      </p>
    );
  }

  return <>{children}</>;
}
