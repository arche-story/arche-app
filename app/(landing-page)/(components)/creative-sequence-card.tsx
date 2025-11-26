"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PixelCard from "@/components/ui/pixel-canvas";

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

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === card) {
          trigger.kill();
        }
      });
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative h-full"
    >
      <PixelCard
        variant="yellow"
        gap={10}
        speed={30}
        colors="#F8E8B0,#F8E473,#FFD700"
        className="flex flex-col items-start p-8 rounded-2xl border border-white/10 bg-linear-to-br from-[#0C1B33] via-[#1A3358]/80 to-[#0C1B33] backdrop-blur-sm transition-all duration-500 hover:border-yellow-200/30 hover:shadow-[0_0_30px_rgba(248,228,115,0.15)] h-full"
      >
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-yellow-200/40 to-transparent z-10" />
        
        {/* Number Badge */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-200/20 to-yellow-200/5 text-xl font-bold text-yellow-200 shadow-[0_0_20px_rgba(248,228,115,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(248,228,115,0.4)] border border-yellow-200/30 relative z-10"
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
        
        {/* Title */}
        <h4 className="mt-6 text-xl font-bold text-slate-50 transition-colors duration-300 group-hover:text-yellow-200 relative z-10">
          {title}
        </h4>
        
        {/* Description */}
        <p className="mt-4 text-base leading-relaxed text-slate-100/70 transition-colors duration-300 group-hover:text-slate-100/90 relative z-10">
          {desc}
        </p>
        
        {/* Bottom corner accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-linear-to-tl from-yellow-200/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </PixelCard>
    </div>
  );
}
