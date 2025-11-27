"use client";

import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import { useRef } from "react";

// Van Gogh Starry Night Palette
const COLORS = ["#0C1B33", "#1A3358", "#355C7D", "#E8C547", "#F8E473"];

export function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 5000,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {COLORS.map((color, i) => (
          <div
            key={i}
            ref={(el) => {
              layersRef.current[i] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: color,
              transform: "scaleY(0)",
              transformOrigin: i % 2 === 0 ? "top" : "bottom",
              zIndex: 5000 + i,
            }}
          />
        ))}
      </div>
      <TransitionRouter
        leave={(next) => {
          const tl = gsap.timeline({
            onComplete: next,
          });

          // Animate layers in: "Painting" the screen
          tl.to(layersRef.current, {
            scaleY: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.inOut",
            transformOrigin: (i) => (i % 2 === 0 ? "top" : "bottom"),
          });

          return () => tl.kill();
        }}
        enter={(next) => {
          const tl = gsap.timeline({
            onComplete: next,
          });

          // Animate layers out: Revealing the new page
          tl.to(layersRef.current, {
            scaleY: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.inOut",
            transformOrigin: (i) => (i % 2 === 0 ? "bottom" : "top"), // Reverse origin for exit
          });

          return () => tl.kill();
        }}
        auto
      >
        {children}
      </TransitionRouter>
    </>
  );
}
