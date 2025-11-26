"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./splash-screen.css";

const SPLASH_IMAGES = [
  "/logo/arche-logo.png",
  "/images/medeival_astronaut.png",
  "/images/archer.png",
  "/images/swordsman.png",
  "/images/woman.png",
  "/images/night_sky.png",
];

const TYPOGRAPHY_SEQUENCE = ["ARCHE", "THE ORIGIN", "OF IDEAS"];

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !imageLayerRef.current) return;

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
        gsap.set(containerRef.current, { display: "none" });
        if (onComplete) onComplete();
      },
    });

    // Progress proxy object
    const progress = { value: 0 };

    // Step 1: Typography flash sequence (slower, more deliberate)
    textRefs.current.forEach((textEl) => {
      if (!textEl) return;
      gsap.set(textEl, { opacity: 0 });
      
      tl.to(textEl, {
        opacity: 1,
        duration: 0.15,
        ease: "power2.inOut",
      })
        .to(textEl, {
          opacity: 1,
          duration: 0.5,
        })
        .to(textEl, {
          opacity: 0,
          duration: 0.15,
          ease: "power2.inOut",
        }, "+=0.1");
    });

    // Step 2: Image stacking with random rotation (slower for better visibility)
    const imageElements: HTMLDivElement[] = [];
    SPLASH_IMAGES.forEach((src) => {
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "splash-image-wrapper";
      
      const rotation = Math.random() * 8 - 4;
      gsap.set(imgWrapper, {
        position: "absolute",
        inset: 0,
        opacity: 0,
        rotation: rotation,
        scale: 0.92,
      });

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Loading";
      img.className = "splash-image";
      imgWrapper.appendChild(img);
      imageLayerRef.current?.appendChild(imgWrapper);
      imageElements.push(imgWrapper);

      tl.to(imgWrapper, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    });

    // Step 3: Progress bar synchronization
    const contentDuration = tl.duration();
    tl.to(progress, {
      value: 100,
      duration: contentDuration,
      ease: "linear",
      onUpdate: () => {
        const percentage = Math.floor(progress.value);
        if (counterRef.current) {
          counterRef.current.textContent = `${percentage}%`;
        }
        if (progressFillRef.current) {
          gsap.set(progressFillRef.current, {
            scaleX: progress.value / 100,
          });
        }
      },
    }, 0);

    // Step 4: Curtain up reveal
    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 1.0,
      ease: "power4.inOut",
    });

    return () => {
      tl.kill();
      imageElements.forEach((el) => el.remove());
    };
  }, [onComplete]);

  return (
    <div
      id="splash-container"
      className="splash-screen-kinetic"
      ref={containerRef}
    >
      {/* Center Content */}
      <div className="splash-center-content">
        {/* Typography Layer */}
        <div className="splash-typography-layer">
          {TYPOGRAPHY_SEQUENCE.map((text, index) => (
            <div
              key={text}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
              className="splash-text"
            >
              {text}
            </div>
          ))}
        </div>

        {/* Image Layer */}
        <div className="splash-image-layer" ref={imageLayerRef} />
      </div>

      {/* Progress Section */}
      <div className="splash-progress-section">
        <div className="splash-counter" ref={counterRef}>
          0%
        </div>
        <div className="splash-progress-bar-bg">
          <div
            className="splash-progress-bar-fill"
            ref={progressFillRef}
          />
        </div>
      </div>
    </div>
  );
}
