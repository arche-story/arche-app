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

    // Set initial state
    gsap.set(".eyebrow-join", { opacity: 0, y: 20 });
    gsap.set(titleRef.current, { opacity: 0, y: 40 });
    gsap.set(descRef.current, { opacity: 0, y: 30 });
    gsap.set(".join-cta", { opacity: 0, y: 30 });

    // Animation timeline
    gsap.to(".eyebrow-join", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top center",
        markers: false,
      },
    });

    gsap.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.1,
      scrollTrigger: {
        trigger: section,
        start: "top center",
        markers: false,
      },
    });

    gsap.to(descRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      delay: 0.2,
      scrollTrigger: {
        trigger: section,
        start: "top center",
        markers: false,
      },
    });

    gsap.to(".join-cta", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.3,
      scrollTrigger: {
        trigger: section,
        start: "top center",
        markers: false,
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
