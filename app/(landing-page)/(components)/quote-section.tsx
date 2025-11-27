"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/core/split-text";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { AuroraText } from "@/components/ui/aurora-text";
import { Particles } from "@/components/ui/particles";
import { Meteors } from "@/components/ui/meteors";

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
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const authorRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const quoteElement = quoteRef.current;
    const authorElement = authorRef.current;
    if (!section || !quoteElement) return;

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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [quote, author]);

  return (
    <div
      ref={sectionRef}
      className="relative mx-auto max-w-6xl px-6 py-16 md:px-8"
    >
      {/* Meteors Background */}
      <Meteors number={20} className="overflow-x-hidden" />

      <NeonGradientCard
        className="relative z-10 items-center justify-center text-center"
        neonColors={{
          firstColor: "#F8E8B0",
          secondColor: "#F8E473",
        }}
      >
        <Particles
          className="absolute inset-0 z-0"
          quantity={50}
          ease={80}
          color="#F8E8B0"
          refresh
        />

        <div className="relative z-10 flex flex-col items-center py-8 md:py-12">
          <div className="mb-6">
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

          <div ref={quoteRef} className="max-w-4xl px-4">
            <AuroraText
              className="text-3xl md:text-5xl font-serif italic font-medium leading-tight"
              colors={["#F8E8B0", "#F8E473", "#FFD700", "#FFF8D6"]}
            >
              &quot;{quote}&quot;
            </AuroraText>
          </div>

          {author && (
            <p
              ref={authorRef}
              className="mt-8 text-base text-slate-100/60 font-medium tracking-wide"
            >
              — {author}
            </p>
          )}
        </div>
      </NeonGradientCard>
    </div>
  );
}
