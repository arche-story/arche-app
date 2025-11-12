"use client";

import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import { useRef } from "react";

export function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(12, 27, 51, 0.95)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 5000,
        }}
      />
      <TransitionRouter
        leave={(next) => {
          // Fade in overlay (fade out content)
          gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: next,
          });
          return () => {};
        }}
        enter={(next) => {
          // Fade out overlay (reveal new content)
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: next,
          });
          return () => {};
        }}
        auto
      >
        {children}
      </TransitionRouter>
    </>
  );
}
