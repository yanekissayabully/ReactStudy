import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import Simulator from "@/components/Simulator";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lab Inventory",
    template: "%s · Lab Inventory",
  },
  description:
    "Equipment inventory for a small lab: routing, nested routes, dynamic URLs and lazy loading with Next.js.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main className="page">{children}</main>
          <footer className="page" style={{ paddingTop: 0 }}>
            <Simulator />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
