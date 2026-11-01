"use client";

import { lazy, Suspense } from "react";
import PageFallback from "@/components/PageFallback";

const ItemsView = lazy(() => import("@/components/views/ItemsView"));

export default function ItemsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ItemsView />
    </Suspense>
  );
}
