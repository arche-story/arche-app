"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useGsapSetup } from "@/lib/animations/gsap-provider";
import { TransitionOverlay } from "@/components/transition-overlay";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
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
        {children}
      </ReactLenis>
    </TransitionOverlay>
  );
}

function LenisGsapBridge() {
  const lenis = useLenis();
  useGsapSetup(lenis);
  return null;
}
