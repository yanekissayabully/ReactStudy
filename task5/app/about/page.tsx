"use client";

import { lazy, Suspense } from "react";
import PageFallback from "@/components/PageFallback";

const AboutView = lazy(() => import("@/components/views/AboutView"));

export default function AboutPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AboutView />
    </Suspense>
  );
}
