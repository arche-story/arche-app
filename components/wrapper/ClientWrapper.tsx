"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useGsapSetup } from "@/lib/animations/gsap-provider";
import { TransitionOverlay } from "@/components/transition-overlay";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();
  useGsapSetup(lenis);

  return (
    <TransitionOverlay>
      <ReactLenis
        root
        options={{
          duration: 0.8,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        }}
      >
        {children}
      </ReactLenis>
    </TransitionOverlay>
  );
}
