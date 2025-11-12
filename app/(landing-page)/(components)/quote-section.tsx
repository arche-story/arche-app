"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextPressure from "@/components/core/text-pressure";

gsap.registerPlugin(ScrollTrigger);

type QuoteSectionProps = {
  eyebrow?: string;
  quote: string;
  author?: string;
};

export function QuoteSection({
  eyebrow = "inspiration",
  quote,
  author,
}: QuoteSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const authorRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const eyebrow = eyebrowRef.current;
    const quote = quoteRef.current;
    const author = authorRef.current;
    if (!section || !eyebrow || !quote || !author) return;

    let timeoutId: NodeJS.Timeout | undefined;
    let hoverTween: gsap.core.Tween | null = null;

    // Hover animation
    const handleMouseEnter = () => {
      if (hoverTween) hoverTween.kill();
      hoverTween = gsap.to(section, {
        y: -8,
        scale: 1.02,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(section, {
        "--shadow-opacity": "0.15",
        "--border-opacity": "0.2",
        duration: 0.4,
        ease: "power2.out",
      } as gsap.TweenVars);
    };

    const handleMouseLeave = () => {
      if (hoverTween) hoverTween.kill();
      hoverTween = gsap.to(section, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(section, {
        "--shadow-opacity": "0.05",
        "--border-opacity": "0.1",
        duration: 0.4,
        ease: "power2.out",
      } as gsap.TweenVars);
    };

    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mouseleave", handleMouseLeave);

    const setupAnimation = () => {
      // Check if section is already in view
      const rect = section.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight * 0.85;

      // If already in view, ensure everything is visible and skip animation
      if (isInView) {
        gsap.set(section, { opacity: 1, y: 0 });
        gsap.set(eyebrow, { opacity: 1, y: 0 });
        gsap.set(quote, { opacity: 1, y: 0 });
        gsap.set(author, { opacity: 1, y: 0 });
        return () => {}; // Return empty cleanup
      }

      const ctx = gsap.context(() => {
        // Set initial states - hide for animation
        gsap.set(section, { opacity: 0, y: 40 });
        gsap.set(eyebrow, { opacity: 0, y: 20 });
        gsap.set(quote, { opacity: 0, y: 20 });
        gsap.set(author, { opacity: 0, y: 20 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
            once: false,
            immediateRender: false,
          },
        });

        // Section container
        tl.to(section, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        });

        // Eyebrow
        tl.to(
          eyebrow,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        );

        // Quote container
        tl.to(
          quote,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );

        // Author
        tl.to(
          author,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }, section);

      return () => ctx.revert();
    };

    // Setup animation
    const cleanup = setupAnimation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cleanup) cleanup();
      if (hoverTween) hoverTween.kill();
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [quote]);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-6xl rounded-3xl border px-6 py-16 text-center md:px-8 transition-all duration-300 cursor-pointer"
      style={
        {
          background:
            "linear-gradient(135deg, #0C1B33 0%, #1A3358 50%, #0C1B33 100%)",
          willChange: "transform, box-shadow",
          borderColor: "rgba(255,255,255,var(--border-opacity,0.1))",
          boxShadow: "0 0 60px rgba(248,228,115,var(--shadow-opacity,0.05))",
          "--shadow-opacity": "0.05",
          "--border-opacity": "0.1",
        } as React.CSSProperties
      }
    >
      <p
        ref={eyebrowRef}
        className="text-xs uppercase tracking-[0.4em] text-yellow-200/50"
      >
        {eyebrow}
      </p>
      <div ref={quoteRef} className="mt-6 md:mt-8 " style={{ opacity: 1 }}>
        <TextPressure
          text={quote}
          textColor="#F8F8F8"
          fontFamily="serif"
          fontUrl=""
          width={true}
          weight={true}
          italic={true}
          alpha={false}
          flex={false}
          stroke={false}
          scale={false}
          minFontSize={20}
          className="font-serif italic"
        />
      </div>
      {author && (
        <p ref={authorRef} className="mt-4 text-sm text-slate-100/40">
          — {author}
        </p>
      )}
    </section>
  );
}
