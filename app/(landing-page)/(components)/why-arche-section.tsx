"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/core/split-text";
import { WarpBackground } from "@/components/ui/warp-background";
import { TextReveal } from "@/components/ui/text-reveal";
import { MorphingText } from "@/components/ui/morphing-text";

gsap.registerPlugin(ScrollTrigger);

export function WhyArcheSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Set initial state
    gsap.set(section, { y: 60, opacity: 0 });

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "top 40%",
        scrub: 1,
      },
    });

    tl.to(section, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative mt-16 mx-auto max-w-6xl px-4">
      <WarpBackground className="rounded-3xl border border-white/5 p-8 md:p-12 bg-linear-to-br from-[#0C1B33] to-[#1A3358]">
        <section className="relative z-10 text-slate-50 dark">
          <header className="section-header">
            <div className="mb-2">
              <MorphingText
                texts={["why arche", "your story", "your legacy"]}
                className="section-eyebrow text-yellow-200/80"
              />
            </div>
            <SplitText
              text="Preserve the moment your idea was born."
              tag="h2"
              className="section-title text-slate-50"
              splitType="chars"
              delay={50}
              duration={0.8}
              from={{ opacity: 0, y: 60, rotateX: -90 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
              threshold={0.3}
            />
          </header>

          <div className="mt-12">
            <TextReveal className="max-w-4xl mx-auto text-lg leading-relaxed">
              In a world where AI can generate a thousand variations in a
              second, Arche remembers the first spark — the draft, the
              hesitation, the brushstroke before perfection. You don&apos;t just
              upload art; you record authorship.
            </TextReveal>
          </div>
        </section>
      </WarpBackground>
    </div>
  );
}
