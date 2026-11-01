"use client";

import { lazy, Suspense } from "react";
import PageFallback from "@/components/PageFallback";

const DashboardView = lazy(() => import("@/components/views/DashboardView"));

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DashboardView />
    </Suspense>
  );
}
