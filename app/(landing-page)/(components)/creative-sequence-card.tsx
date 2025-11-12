"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type CreativeSequenceCardProps = {
  title: string;
  desc: string;
  index: number;
};

export function CreativeSequenceCard({
  title,
  desc,
  index,
}: CreativeSequenceCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      // Rotasi berbeda untuk setiap card untuk efek variasi
      const rotations = [-15, 12, -18, 15];
      const initialRotation = rotations[index % rotations.length];

      // Set initial state - card mulai dari bawah dengan rotasi
      gsap.set(card, {
        y: 120,
        opacity: 0,
        scale: 0.85,
        rotation: initialRotation,
        transformOrigin: "center center",
        force3D: true,
      });

      // Animate card muncul dari bawah dengan rotasi
      gsap.to(card, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        force3D: true,
      });
    }, card);

    return () => ctx.revert();
  }, [index]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (isHovered) {
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        rotation: 0,
        boxShadow: "0 20px 60px rgba(248, 228, 115, 0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(card, {
        y: 0,
        scale: 1,
        rotation: 0,
        boxShadow: "0 0 40px rgba(248, 228, 115, 0.03)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#0C1B33]/90 via-[#1A3358]/60 to-[#0C1B33]/90 p-6 backdrop-blur-sm transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, rgba(12,27,51,0.9) 0%, rgba(26,51,88,0.6) 50%, rgba(12,27,51,0.9) 100%)",
      }}
    >
      {/* Van Gogh brushstroke effect */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute -left-4 top-4 h-32 w-32 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(248,228,115,0.2) 0%, transparent 70%)",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute -right-4 bottom-4 h-24 w-24 rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(232,197,71,0.15) 0%, transparent 70%)",
            transform: "rotate(-30deg)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-yellow-200/20 to-yellow-200/10 text-lg font-semibold text-yellow-200 shadow-[0_0_20px_rgba(248,228,115,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(248,228,115,0.3)]"
          style={{
            lineHeight: 1,
            padding: 0,
          }}
        >
          <span
            style={{
              lineHeight: 1,
              display: "block",
              textAlign: "center",
              width: "100%",
              margin: 0,
              padding: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {index + 1}
          </span>
        </div>
        <h4 className="mt-5 text-lg font-medium text-slate-50 transition-colors duration-300 group-hover:text-yellow-200/90">
          {title}
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-slate-100/70 transition-colors duration-300 group-hover:text-slate-100/90">
          {desc}
        </p>
      </div>

      {/* Brushstroke border animation */}
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0 rounded-2xl shimmer-effect"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(248,228,115,0.1), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </div>
  );
}
