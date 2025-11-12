"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhyArcheSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.set(section, { y: 60, opacity: 0, borderRadius: "0px" });

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
        borderRadius: "24px",
        duration: 1,
        ease: "power3.out",
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-20 mx-auto max-w-6xl space-y-6 border border-white/10 px-6 py-16 shadow-[0_0_60px_rgba(248,228,115,0.08)] md:px-8"
      style={{
        background:
          "linear-gradient(135deg, #0C1B33 0%, #1A3358 40%, #0C1B33 100%)",
        borderTopLeftRadius: "0px",
        borderTopRightRadius: "0px",
        borderBottomLeftRadius: "24px",
        borderBottomRightRadius: "24px",
      }}
    >
      <p className="text-sm uppercase tracking-[0.35em] text-yellow-200/70">
        why arche
      </p>
      <h2 className="text-3xl font-serif tracking-tight text-slate-50 md:text-4xl">
        Preserve the moment your idea was born.
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-100/65 md:text-base">
        In a world where AI can generate a thousand variations in a second,
        Arche remembers the first spark — the draft, the hesitation, the
        brushstroke before perfection. You don&apos;t just upload art; you
        record authorship.
      </p>
    </section>
  );
}
