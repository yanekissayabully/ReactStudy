import type { ReactNode } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = { title: "Equipment" };

export default function ItemsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}
