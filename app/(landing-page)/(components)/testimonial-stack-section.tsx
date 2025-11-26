"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/core/split-text";
import { SparklesText } from "@/components/ui/sparkles-text";

gsap.registerPlugin(ScrollTrigger);

// Realistic testimonial data with real names and community insights
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Digital Artist & NFT Creator",
    testimonial:
      "Arche transformed how I approach AI art creation. Being able to save every iteration and finally register my work on-chain gives me peace of mind.",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "AI Art Director",
    testimonial:
      "I've been waiting for a platform that understands the iterative nature of AI-assisted creation. Arche's version control system captures the journey, and Story Protocol integration ensures proper protection.",
  },
  {
    id: 3,
    name: "Elena Volkov",
    role: "Blockchain Artist & Educator",
    testimonial:
      "As someone who teaches digital art, I can see Arche becoming essential in art education. Students can now see their creative evolution and understand how AI collaboration works.",
  },
  {
    id: 4,
    name: "David Park",
    role: "Independent Game Developer",
    testimonial:
      "I used Arche to create concept art for my indie game. The ability to iterate quickly with AI while maintaining version history helped me land a publishing deal.",
  },
];

const cardBgColors = [
  "#1A3358", // var(--arche-deep)
  "#355C7D", // var(--arche-blue)
  "#0C1B33", // var(--arche-navy)
  "#1A3358", // var(--arche-deep)
];

const cardRotations = [1, -1.5, 2.5, -3];

export function TestimonialStackSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useLayoutEffect(() => {
    const pinElement = pinRef.current;
    const containerElement = containerRef.current;
    if (!pinElement || !sectionRef.current || !containerElement || !lenis)
      return;

    const cards = Array.from(
      containerElement.querySelectorAll<HTMLElement>(".testimonial-card")
    );
    if (!cards.length) return;

    const initialOffsetY = 800;
    const finalStackGap = 10;
    const scrollDuration = 2000;

    // Set initial states
    cards.reverse().forEach((card, index) => {
      gsap.set(card, {
        y: initialOffsetY + index * 40,
        opacity: 0.8,
        scale: 0.95,
        rotate: 0,
      });
    });

    // Create timeline with ScrollTrigger
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: pinElement,
        start: "top top",
        end: `+=${scrollDuration}`,
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    cards.forEach((card, index) => {
      timeline.to(
        card,
        {
          y: index * finalStackGap,
          rotate: cardRotations[index % cardRotations.length],
          scale: 1,
          opacity: 1,
          ease: "power2.inOut",
        },
        index * 0.15
      );
    });

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === pinElement) {
          trigger.kill();
        }
      });
    };
  }, [lenis]);

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="section-header">
          <div className="mb-2">
            <SplitText
              text="Community Voices"
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
            text="What Creators Say"
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
            text="Real stories from artists, developers, and creators who are shaping the future of AI-powered art."
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

        {/* Pin Wrapper - page tetap diam saat di-scroll */}
        <div ref={pinRef} className="relative">
          {/* Stack Section */}
          <div
            ref={sectionRef}
            className="relative mx-auto max-w-5xl overflow-hidden"
            style={{ height: "100vh" }}
          >
            {/* Base Card - Initiator */}
            <div
              key="base-card"
              className="testimonial-card absolute rounded-[28px] border border-white/5 p-12 md:p-16 flex flex-col justify-center items-center text-center"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "95%",
                maxWidth: "1000px",
                minHeight: "450px",
                backgroundColor: cardBgColors[cardBgColors.length - 1],
                // boxShadow: "0 0px 100px rgba(248, 228, 115, 0.12)",
                zIndex: 0,
                transformOrigin: "center center",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Testimonial - Bold & Large */}
              <blockquote className="text-slate-50 leading-tight text-2xl md:text-4xl lg:text-4xl font-serif font-black mb-10 max-w-5xl">
                {testimonials[testimonials.length - 1].testimonial}
              </blockquote>

              {/* Author Info */}
              <div className="mt-auto flex flex-col items-center">
                <div className="mb-1">
                  <SparklesText
                    className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight"
                    colors={{ first: "#F8E8B0", second: "#F8E473" }}
                  >
                    {`- ${testimonials[testimonials.length - 1].name} -`}
                  </SparklesText>
                </div>
                <p className="text-sm md:text-base text-slate-100/60 uppercase tracking-[0.2em] font-medium">
                  {testimonials[testimonials.length - 1].role}
                </p>
              </div>
            </div>

            {/* Cards Container */}
            <div
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center"
            >
              {testimonials
                .slice(0, cardBgColors.length - 1)
                .map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="testimonial-card absolute rounded-[28px] border border-white/5 p-12 md:p-16 flex flex-col justify-center items-center text-center"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "95%",
                      maxWidth: "1000px",
                      minHeight: "450px",
                      backgroundColor:
                        cardBgColors[index % cardBgColors.length],
                      // boxShadow: "0 20px 50px rgba(248, 228, 115, 0.12)",
                      zIndex: testimonials.length - index,
                      transformOrigin: "center center",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {/* Testimonial - Bold & Large */}
                    <blockquote className="text-slate-50 leading-tight text-2xl md:text-4xl lg:text-4xl font-serif font-black mb-10 max-w-5xl">
                      {testimonial.testimonial}
                    </blockquote>

                    {/* Author Info */}
                    <div className="mt-auto flex flex-col items-center">
                      <div className="mb-1">
                        <SparklesText
                          className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight"
                          colors={{ first: "#F8E8B0", second: "#F8E473" }}
                        >
                          {`- ${testimonial.name} -`}
                        </SparklesText>
                      </div>
                      <p className="text-sm md:text-base text-slate-100/60 uppercase tracking-[0.2em] font-medium">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
