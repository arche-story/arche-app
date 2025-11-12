"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/core/split-text";

gsap.registerPlugin(ScrollTrigger);

export function WhyArcheSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

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
    <section ref={sectionRef} className="relative mt-16 mx-auto max-w-6xl">
      <header className="section-header">
        <div className="mb-2">
          <SplitText
            text="why arche"
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
          text="Preserve the moment your idea was born."
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
          text="In a world where AI can generate a thousand variations in a second, Arche remembers the first spark — the draft, the hesitation, the brushstroke before perfection. You don't just upload art; you record authorship."
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
    </section>
  );
}
