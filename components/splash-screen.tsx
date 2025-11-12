"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./splash-screen.css";

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);
  const layer5Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const globalWindow =
      typeof window !== "undefined"
        ? (window as unknown as Record<string, unknown>)
        : null;
    const lenis = globalWindow?.lenis as
      | { stop: () => void; start: () => void }
      | undefined;

    if (lenis?.stop) lenis.stop();

    const tl = gsap.timeline({
      onComplete: () => {
        if (lenis?.start) lenis.start();
        setIsVisible(false);
        if (onComplete) onComplete();
      },
    });

    gsap.set(
      [
        layer1Ref.current,
        layer2Ref.current,
        layer3Ref.current,
        layer4Ref.current,
        layer5Ref.current,
      ],
      {
        willChange: "transform",
      }
    );

    tl.fromTo(
      layer1Ref.current,
      { x: 0 },
      { x: "100vw", duration: 0.8, ease: "power3.inOut" },
      0
    )
      .fromTo(
        layer2Ref.current,
        { x: 0 },
        { x: "100vw", duration: 0.8, ease: "power3.inOut" },
        0.12
      )
      .fromTo(
        layer3Ref.current,
        { x: 0 },
        { x: "100vw", duration: 0.8, ease: "power3.inOut" },
        0.24
      )
      .fromTo(
        layer4Ref.current,
        { x: 0 },
        { x: "100vw", duration: 0.8, ease: "power3.inOut" },
        0.36
      )
      .fromTo(
        layer5Ref.current,
        { x: 0 },
        { x: "100vw", duration: 0.8, ease: "power3.inOut" },
        0.48
      )
      .set(
        [
          layer1Ref.current,
          layer2Ref.current,
          layer3Ref.current,
          layer4Ref.current,
          layer5Ref.current,
        ],
        {
          willChange: "auto",
        }
      );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="splash-screen" ref={containerRef}>
      {/* Layer 1 - Deep Navy */}
      <div
        ref={layer1Ref}
        className="splash-layer layer-1"
        style={{ backgroundColor: "var(--arche-navy)" }}
      >
        <svg
          className="wave-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M100,0 Q75,25 50,0 T0,0 L0,100 L100,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Layer 2 - Deep Blue */}
      <div
        ref={layer2Ref}
        className="splash-layer layer-2"
        style={{ backgroundColor: "var(--arche-deep)" }}
      >
        <svg
          className="wave-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M100,0 Q75,25 50,0 T0,0 L0,100 L100,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Layer 3 - Blue */}
      <div
        ref={layer3Ref}
        className="splash-layer layer-3"
        style={{ backgroundColor: "var(--arche-blue)" }}
      >
        <svg
          className="wave-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M100,0 Q75,25 50,0 T0,0 L0,100 L100,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Layer 4 - Ochre */}
      <div
        ref={layer4Ref}
        className="splash-layer layer-4"
        style={{ backgroundColor: "var(--arche-ochre)" }}
      >
        <svg
          className="wave-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M100,0 Q75,25 50,0 T0,0 L0,100 L100,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Layer 5 - Gold */}
      <div
        ref={layer5Ref}
        className="splash-layer layer-5"
        style={{ backgroundColor: "var(--arche-gold)" }}
      >
        <svg
          className="wave-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M100,0 Q75,25 50,0 T0,0 L0,100 L100,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
