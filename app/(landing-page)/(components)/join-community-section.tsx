"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Meteors } from "@/components/ui/meteors";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function JoinCommunitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const q = gsap.utils.selector(section);
    const eyebrow = q(".eyebrow-join");
    const ctas = q(".join-cta");
    const title = titleRef.current;
    const desc = descRef.current;

    const targets = [...eyebrow, title ? [title] : [], desc ? [desc] : [], ...ctas].flat().filter(Boolean);

    // Set initial states
    if (targets.length) {
      gsap.set(targets, { opacity: 0 });
    }

    gsap.set(eyebrow, { y: 20 });
    if (title) {
      gsap.set(title, { y: 40 });
    }
    if (desc) {
      gsap.set(desc, { y: 30 });
    }
    gsap.set(ctas, { y: 30 });

    const triggerConfig = {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none",
    };

    gsap.to(eyebrow, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: triggerConfig,
    });

    if (title) {
      gsap.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.1,
        scrollTrigger: triggerConfig,
      });
    }

    if (desc) {
      gsap.to(desc, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: triggerConfig,
      });
    }

    if (ctas.length) {
      gsap.to(ctas, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.3,
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
  }, []);

  const handleStartCreating = () => {
    confettiRef.current?.fire({});
  };

  return (
    <section className="relative w-full min-h-screen h-full flex items-center justify-center overflow-hidden">
      <Meteors number={20} className="opacity-50" />
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full"
      />
      
      <div
        ref={sectionRef}
        className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-20"
      >
        <div className="w-full max-w-2xl flex flex-col gap-6 items-center">
          <div className="mb-2 text-center">
            <p className="eyebrow-join text-yellow-300/70 text-sm tracking-widest uppercase">
              GET STARTED
            </p>
          </div>
          
          <div ref={titleRef} className="text-center">
             <AnimatedGradientText
              className="text-5xl md:text-6xl font-bold inline-flex"
              colorFrom="#F8E8B0"
              colorTo="#F8E473"
             >
              <span className={cn(
                "inline animate-gradient bg-linear-to-r from-[#F8E8B0] via-[#F8E473] to-[#F8E8B0] bg-size-[var(--bg-size)_100%] bg-clip-text text-transparent",
              )}>
                Join Community
              </span>
             </AnimatedGradientText>
          </div>

          <p
            ref={descRef}
            className="text-base md:text-lg text-gray-300 text-center"
          >
            Be part of a community that values creativity, ownership, and the
            journey of artistic expression. Start creating, share your work, and
            connect with fellow artists.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-fit mt-4">
            <div className="join-cta">
              <ShimmerButton
                className="shadow-2xl"
                shimmerColor="#F8E8B0"
                shimmerSize="0.1em"
                borderRadius="9999px"
                background="rgba(248, 232, 176, 0.1)"
                onClick={handleStartCreating}
              >
                <span className="whitespace-pre-wrap text-center text-base font-medium leading-none tracking-tight text-[#F8E8B0] dark:from-white dark:to-slate-900/10 lg:text-lg">
                  Start Creating
                </span>
              </ShimmerButton>
            </div>
            
            <button className="join-cta rounded-full border-2 border-yellow-300/30 px-8 py-3 text-base font-medium text-yellow-300 transition hover:border-yellow-200 hover:bg-yellow-300/10 whitespace-nowrap backdrop-blur-sm">
              View Gallery
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
