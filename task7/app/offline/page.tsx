import type { Metadata } from "next";
import OfflineView from "@/components/views/OfflineView";

export const metadata: Metadata = { title: "Offline" };

// Fully static page: it is precached by the service worker, so it can be shown
// with no connection at all.
export default function OfflinePage() {
  return <OfflineView />;
}
