"use client";

import { useCallback, useEffect, useState } from "react";
import { isAbortError } from "@/services/service";
import { messageOf } from "@/lib/items";

export type AsyncStatus = "loading" | "error" | "success";

interface Settled<T> {
  load: unknown;
  attempt: number;
  data: T | null;
  error: string | null;
}

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  reload: () => void;
  mutate: (data: T) => void;
}

export function useAsync<T>(
  load: (signal: AbortSignal) => Promise<T>,
): AsyncState<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    load(controller.signal)
      .then((data) => {
        if (ignore) return;
        setSettled({ load, attempt, data, error: null });
      })
      .catch((error: unknown) => {
        if (ignore || isAbortError(error)) return;
        setSettled((prev) => ({
          load,
          attempt,
          data: prev?.data ?? null,
          error: messageOf(error),
        }));
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [load, attempt]);

  const isCurrent =
    settled !== null && settled.load === load && settled.attempt === attempt;

  const status: AsyncStatus = !isCurrent
    ? "loading"
    : settled.error !== null
      ? "error"
      : "success";

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const mutate = useCallback(
    (data: T) =>
      setSettled((prev) => (prev ? { ...prev, data, error: null } : prev)),
    [],
  );

  return {
    status,
    data: settled?.data ?? null,
    error: isCurrent ? settled.error : null,
    reload,
    mutate,
  };
}
