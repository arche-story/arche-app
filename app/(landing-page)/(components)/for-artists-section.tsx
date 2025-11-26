"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/core/split-text";
import { BentoGrid } from "@/components/ui/bento-grid";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import PixelCard from "@/components/ui/pixel-canvas";
import {
  Paintbrush,
  Code2,
  Share2,
  Fingerprint,
  LayoutTemplate,
  Workflow,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function ForArtistsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;

    if (!section || !header) return;

    // Set initial states
    gsap.set(header, { y: 40, opacity: 0 });

    // Animate header
    gsap.to(header, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div ref={sectionRef} className="py-16 min-h-screen">
      <header
        ref={headerRef}
        className="section-header max-w-6xl mx-auto px-4 mb-12"
      >
        <div className="mb-2">
          <SplitText
            text="For Everyone"
            tag="p"
            className="section-eyebrow"
            splitType="words"
            delay={30}
            duration={0.6}
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
          />
        </div>
        <SplitText
          text="Built for Artists & Builders"
          tag="h2"
          className="section-title"
          splitType="chars"
          delay={50}
          duration={0.8}
          from={{ opacity: 0, y: 60, rotateX: -90 }}
          to={{ opacity: 1, y: 0, rotateX: 0 }}
          threshold={0.3}
        />
        <SplitText
          text="Whether you're creating AI art or building the next generation of IP-aware applications, Arche provides the tools you need."
          tag="p"
          className="section-description"
          splitType="words"
          delay={30}
          duration={0.6}
          from={{ opacity: 0, y: 30 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.2}
        />
      </header>

      <div className="mx-auto max-w-6xl px-4" ref={containerRef}>
        <BentoGrid className="grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artist Card */}
          <PixelCard
            variant="yellow"
            gap={10}
            speed={30}
            colors="#F8E8B0,#F8E473,#FFD700"
            className="group col-span-1 p-10 min-h-[480px] flex flex-col justify-between rounded-2xl border border-white/10 bg-linear-to-br from-[#0C1B33] via-[#1A3358]/80 to-[#0C1B33] backdrop-blur-sm transition-all duration-500 hover:border-yellow-200/30 hover:shadow-[0_0_40px_rgba(248,228,115,0.2)]"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-yellow-200/40 to-transparent z-10" />

            <div className="relative w-full z-10">
              <div
                ref={div1Ref}
                className="h-16 w-16 rounded-full bg-linear-to-br from-yellow-200/20 to-yellow-200/5 flex items-center justify-center mb-6 border border-yellow-200/40 shadow-[0_0_25px_rgba(248,228,115,0.25)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(248,228,115,0.4)] relative z-10"
              >
                <Paintbrush className="h-7 w-7 text-yellow-200" />
              </div>

              <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/80 mb-3 font-medium">
                FOR ARTISTS & AI CREATORS
              </p>
              <h3 className="text-2xl font-serif text-slate-50 mb-5 font-bold transition-colors duration-300 group-hover:text-yellow-200/90">
                Own the output you generate.
              </h3>
              <p className="text-slate-100/70 mb-8 leading-relaxed transition-colors duration-300 group-hover:text-slate-100/90">
                Every prompt, every style transfer, every iteration — attach
                your name and timestamp. Arche lets you show the journey, not
                just the destination.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Workflow, text: "Timeline of drafts and finals" },
                  {
                    icon: Fingerprint,
                    text: "On-chain registration via Story",
                  },
                  { icon: Share2, text: "Shareable creation proof" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm text-slate-100/80 font-medium transition-colors duration-300 group-hover:text-slate-100/95"
                  >
                    <div className="p-2 rounded-full bg-yellow-200/10 border border-yellow-200/25">
                      <item.icon className="h-4 w-4 text-yellow-200" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-10">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold text-yellow-200 font-serif">
                  <NumberTicker value={100} className="text-yellow-200" />%
                </span>
              </div>
              <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                Ownership
              </span>
            </div>

            {/* Bottom corner accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-yellow-200/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </PixelCard>

          {/* Builder Card */}
          <PixelCard
            variant="blue"
            gap={10}
            speed={30}
            colors="#60A5FA,#93C5FD,#DBEAFE"
            className="group col-span-1 p-10 min-h-[480px] flex flex-col justify-between rounded-2xl border border-white/10 bg-linear-to-br from-[#0C1B33] via-[#1A3358]/80 to-[#0C1B33] backdrop-blur-sm transition-all duration-500 hover:border-blue-400/30 hover:shadow-[0_0_40px_rgba(96,165,250,0.2)]"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-blue-400/40 to-transparent z-10" />

            <div className="relative w-full z-10">
              <div
                ref={div2Ref}
                className="h-16 w-16 rounded-full bg-linear-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-6 border border-blue-400/40 shadow-[0_0_25px_rgba(96,165,250,0.25)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(96,165,250,0.4)] relative z-10"
              >
                <Code2 className="h-7 w-7 text-blue-300" />
              </div>

              <p className="text-xs uppercase tracking-[0.3em] text-blue-200/80 mb-3 font-medium">
                FOR BUILDERS & TEAMS
              </p>
              <h3 className="text-2xl font-serif text-slate-50 mb-5 font-bold transition-colors duration-300 group-hover:text-blue-300/90">
                Ship a real IP aware front-end.
              </h3>
              <p className="text-slate-100/70 mb-8 leading-relaxed transition-colors duration-300 group-hover:text-slate-100/90">
                Integrate Story SDK, show the IP lifecycle, and present a UI
                that feels human-centered, not just a dev tool.
              </p>

              <div className="space-y-3">
                {[
                  { icon: LayoutTemplate, text: "Clear registration UX" },
                  { icon: Workflow, text: "Visualized IP states" },
                  { icon: Code2, text: "Production-ready layout" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm text-slate-100/80 font-medium transition-colors duration-300 group-hover:text-slate-100/95"
                  >
                    <div className="p-2 rounded-full bg-blue-500/10 border border-blue-400/25">
                      <item.icon className="h-4 w-4 text-blue-300" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom corner accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-blue-500/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </PixelCard>
        </BentoGrid>

        {/* Animated Beam connecting the two icons */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div2Ref}
          curvature={-50}
          endYOffset={-10}
          gradientStartColor="#F8E8B0"
          gradientStopColor="#60A5FA"
        />
      </div>
    </div>
  );
}
