"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function JoinCommunitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const q = gsap.utils.selector(section);
    const eyebrow = q(".eyebrow-join");
    const ctas = q(".join-cta");
    const title = titleRef.current;
    const desc = descRef.current;

    const targets = [...eyebrow, title, desc, ...ctas].filter(
      Boolean
    ) as Element[];

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
  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#0C1B33] flex flex-col items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-2xl flex flex-col gap-6 items-center">
        <div className="mb-2 text-center">
          <p className="eyebrow-join text-yellow-300/70 text-sm tracking-widest uppercase">
            GET STARTED
          </p>
        </div>
        <h2
          ref={titleRef}
          className="text-5xl md:text-6xl font-bold text-white text-center"
        >
          Join Community
        </h2>
        <p
          ref={descRef}
          className="text-base md:text-lg text-gray-300 text-center"
        >
          Be part of a community that values creativity, ownership, and the
          journey of artistic expression. Start creating, share your work, and
          connect with fellow artists.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-fit">
          <button className="join-cta rounded-full bg-yellow-300 px-8 py-3 text-base font-medium text-slate-900 transition hover:bg-yellow-200 whitespace-nowrap">
            Start Creating
          </button>
          <button className="join-cta rounded-full border-2 border-yellow-300 px-8 py-3 text-base font-medium text-yellow-300 transition hover:border-yellow-200 hover:bg-yellow-300/10 whitespace-nowrap">
            View Gallery
          </button>
        </div>
      </div>
    </section>
  );
}
