"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useGsapSetup } from "@/lib/animations/gsap-provider";
import { TransitionOverlay } from "@/components/transition-overlay";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { WalletProvider } from "@/components/wrapper/WalletProvider";
import { RouteGuard } from "@/components/wrapper/RouteGuard"; // Correct import placement
import { Toaster } from "sonner"; // Added

const queryClient = new QueryClient();

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TransitionOverlay>
          <ScrollProgress className="fixed top-0 h-1 bg-gradient-to-r from-[#F8E8B0] via-[#F8E473] to-[#FFD700]" />
          <ReactLenis
            root
            options={{
              duration: 0.8,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            }}
          >
            <LenisGsapBridge />
            <WalletProvider>
              <RouteGuard>{children}</RouteGuard>
            </WalletProvider>
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#0F213E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                },
                className: "font-sans",
              }}
            />
          </ReactLenis>
        </TransitionOverlay>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
function LenisGsapBridge() {
  const lenis = useLenis();
  useGsapSetup(lenis);
  return null;
}
