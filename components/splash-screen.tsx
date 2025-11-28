"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./splash-screen.css";

const SPLASH_IMAGES = [
  "/images/medeival_astronaut.png",
  "/images/archer.png",
  "/images/night_sky.png",
  "/images/star_1.png",
  "/images/cubes.png",
];

const TYPOGRAPHY_SEQUENCE = ["ARCHE"];

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(containerRef.current, { display: "none" });
          if (onComplete) onComplete();
        },
      });

      // Initial State
      gsap.set(videoRef.current, { opacity: 0, scale: 1.1 });
      gsap.set(".splash-text", { opacity: 0, y: 20 });
      gsap.set(".splash-image-wrapper", { opacity: 0, scale: 0.8, y: 50 });

      // Step 0: Video Fade In
      tl.to(videoRef.current, {
        opacity: 0.4, // Darker overlay for text readability
        scale: 1,
        duration: 2,
        ease: "power2.out",
      });

      // Progress Bar Animation (Runs throughout)
      const totalDuration = 4.5;
      tl.to(
        progressFillRef.current,
        {
          scaleX: 1,
          duration: totalDuration,
          ease: "power1.inOut",
        },
        0
      );

      // Counter Animation
      const progress = { value: 0 };
      tl.to(
        progress,
        {
          value: 100,
          duration: totalDuration,
          ease: "power1.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = `${Math.floor(progress.value)}%`;
            }
          },
        },
        0
      );

      // Step 1: Sequence - ARCHE Text and Images
      const mainTimelineStart = 0.5;

      // "ARCHE" - Appears and stays longer/dominates initial phase
      tl.to(
        ".splash-text-0",
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        mainTimelineStart
      ).to(
        ".splash-text-0",
        {
          opacity: 0,
          y: -20,
          filter: "blur(8px)",
          duration: 0.5,
          ease: "power2.in",
        },
        ">+0.5"
      ); // Hold for 0.5s

      // Image 1 (Astronaut) - Center
      tl.to(
        ".splash-image-0",
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: -2,
          duration: 0.8,
          ease: "power3.out",
        },
        ">-0.3"
      ).to(
        ".splash-image-0",
        {
          opacity: 0,
          scale: 1.1,
          filter: "blur(5px)",
          duration: 0.5,
        },
        ">+0.4"
      );

      // Image 2 & 3 (Pair)
      tl.to(
        ".splash-image-1",
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: 3,
          duration: 0.8,
          ease: "power3.out",
        },
        ">-0.3"
      )
        .to(
          ".splash-image-2",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotation: -3,
            duration: 0.8,
            ease: "power3.out",
          },
          "<+0.2"
        )
        // Fade pair out
        .to(
          [".splash-image-1", ".splash-image-2"],
          {
            opacity: 0,
            y: -30,
            duration: 0.5,
          },
          ">+0.3"
        );

      // Final Collage (Remaining Images)
      tl.to(
        ".splash-image-3",
        {
          opacity: 0.8, // Slightly more visible as finale
          scale: 1,
          y: 0,
          x: "-120%",
          rotation: -5,
          duration: 1,
          ease: "power3.out",
        },
        "<"
      ).to(
        ".splash-image-4",
        {
          opacity: 0.8, // Slightly more visible as finale
          scale: 1,
          y: 0,
          x: "120%",
          rotation: 5,
          duration: 1,
          ease: "power3.out",
        },
        "<+0.2"
      );

      // Step 4: Curtain Reveal
      tl.to(
        containerRef.current,
        {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
        },
        ">+0.5"
      );
    }, containerRef); // Scope to container

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      id="splash-container"
      className="splash-screen-kinetic"
      ref={containerRef}
    >
      {/* Video Background Layer */}
      <div className="splash-video-layer">
        <video
          ref={videoRef}
          className="splash-bg-video"
          autoPlay
          muted
          loop
          playsInline
          src="/video/splash-video.mp4"
        />
        <div className="splash-video-overlay" />
      </div>

      {/* Content Container */}
      <div className="splash-content-container" ref={contentRef}>
        {/* Images Layer - Centered Stack */}
        <div className="splash-image-stack">
          {SPLASH_IMAGES.map((src, index) => (
            <div
              key={index}
              className={`splash-image-wrapper splash-image-${index}`}
              style={{
                zIndex: 10 + index,
              }}
            >
              <img src={src} alt="Visual" className="splash-image" />
            </div>
          ))}
        </div>

        {/* Typography Layer - Centered */}
        <div className="splash-typography-stack">
          {TYPOGRAPHY_SEQUENCE.map((text, index) => (
            <div key={text} className={`splash-text splash-text-${index}`}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="splash-progress-section">
        <div className="splash-counter" ref={counterRef}>
          0%
        </div>
        <div className="splash-progress-bar-bg">
          <div className="splash-progress-bar-fill" ref={progressFillRef} />
        </div>
      </div>
    </div>
  );
}
