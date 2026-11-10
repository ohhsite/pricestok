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
  icons: {
    icon: [
      {url:"/favicon.ico?v=2",sizes:"16x16 32x32 48x48",type:"image/x-icon"},
      {url:"/favicon.svg?v=2",sizes:"any",type:"image/svg+xml"},
      {url:"/icon-192.png?v=2",sizes:"192x192",type:"image/png"},
    ],
    shortcut:"/favicon.ico?v=2",
    apple:{url:"/apple-touch-icon.png?v=2",sizes:"180x180",type:"image/png"},
  },
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
