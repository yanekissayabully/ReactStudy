import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import OfflineBanner from "@/components/OfflineBanner";
import PwaProvider from "@/components/PwaProvider";
import Simulator from "@/components/Simulator";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lab Inventory",
    template: "%s · Lab Inventory",
  },
  description:
    "Equipment inventory for a small lab: routing, nested routes, dynamic URLs and lazy loading with Next.js.",
  manifest: "/manifest.json",
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Lab Inventory", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d5fbf",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <OfflineBanner />
          <main className="page">{children}</main>
          <footer className="page" style={{ paddingTop: 0 }}>
            <Simulator />
          </footer>
          <PwaProvider />
        </Providers>
      </body>
    </html>
  );
}
