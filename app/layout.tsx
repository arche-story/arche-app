import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { RootLayoutClient } from "@/components/wrapper/ClientWrapper";
import { SplashScreen } from "@/components/splash-screen";

export const metadata: Metadata = {
  title: "Arche — The Origin of Every Idea",
  description: "Create, version, and register your AI-born ideas on-chain.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen text-slate-100 antialiased">
        <SplashScreen />
        <RootLayoutClient>
          {children}
          <footer className="py-10 text-center text-xs text-slate-100/30">
            “We remember not only the art, but the journey that birthed it.” —
            Arche
          </footer>
        </RootLayoutClient>
      </body>
    </html>
  );
}
