import Analytics from "./components/Analytics";
import { Suspense } from "react";
import { siteUrl } from "./lib/config";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "PriceStok — lokalne promocje w Białymstoku",
    template: "%s | PriceStok",
  },
  description:
    "Odkrywaj promocje w Białymstoku. Jedzenie, beauty, sport, rozrywka i zakupy — konkretne rabaty, jasne warunki i lokalne adresy.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    locale: "pl_PL",
    type: "website",
    siteName: "PriceStok",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}<Suspense fallback={null}><Analytics /></Suspense></body>
    </html>
  );
}
