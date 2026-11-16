"use client";

import { useSyncExternalStore } from "react";

// A tiny external store (no library needed) for two facts the UI shows:
//  - online: the browser's connectivity state
//  - fromCache: the last API response was served from the service-worker cache
type Listener = () => void;
const listeners = new Set<Listener>();
let fromCache = false;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

export function setFromCache(value: boolean) {
  if (fromCache !== value) {
    fromCache = value;
    emit();
  }
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

export function useFromCache(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => fromCache,
    () => false,
  );
}
