"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextPressure from "@/components/core/text-pressure";
import SplitText from "@/components/core/split-text";

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
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const authorRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const quoteElement = quoteRef.current;
    const authorElement = authorRef.current;
    if (!section || !quoteElement) return;

    let hoverTween: gsap.core.Tween | null = null;

    // Set initial states
    gsap.set(section, { opacity: 0, y: 40 });
    gsap.set(quoteElement, { opacity: 0, y: 20 });
    if (authorElement) {
      gsap.set(authorElement, { opacity: 0, y: 20 });
    }

    const triggerConfig = {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none",
    };

    // Animate section
    gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: triggerConfig,
    });

    // Animate quote
    gsap.to(quoteElement, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.1,
      scrollTrigger: triggerConfig,
    });

    // Animate author
    if (authorElement) {
      gsap.to(authorElement, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
        scrollTrigger: triggerConfig,
      });
    }

    const animateHover = (hovered: boolean) => {
      if (hoverTween) hoverTween.kill();
      hoverTween = gsap.to(section, {
        y: hovered ? -8 : 0,
        scale: hovered ? 1.02 : 1,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(section, {
        "--shadow-opacity": hovered ? "0.15" : "0.05",
        "--border-opacity": hovered ? "0.2" : "0.1",
        duration: 0.4,
        ease: "power2.out",
      } as gsap.TweenVars);
    };

    const handleMouseEnter = () => animateHover(true);
    const handleMouseLeave = () => animateHover(false);

    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mouseleave", handleMouseLeave);
      if (hoverTween) hoverTween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [quote, author]);

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
      <div className="mb-2">
        <SplitText
          text={eyebrow}
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
