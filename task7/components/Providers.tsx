"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { makeQueryClient } from "@/lib/queryClient";

export default function Providers({ children }: { children: ReactNode }) {
  // useState (not a module-level const) so every browser tab/server request
  // gets its own cache and it survives re-renders.
  const [queryClient] = useState(makeQueryClient);

  // Connection is back: refetch everything so cached data is replaced by fresh data.
  useEffect(() => {
    const onOnline = () => void queryClient.invalidateQueries();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
