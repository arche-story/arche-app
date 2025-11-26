"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export function HeroScroll() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const windowBgRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const bodyRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  type CSSVarTween = gsap.TweenVars & { [key: string]: number | string };

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    const windowBg = windowBgRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;
    const cta = ctaRef.current;

    if (!wrapper || !image || !windowBg || !heading || !body || !cta) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(windowBg, { opacity: 1, scale: 1.2, x: 0, y: 0 });
      gsap.set(image, { scale: 1, y: 0, "--blur": "0px" } as CSSVarTween);
      gsap.set([heading, body, cta], {
        color: "white",
        filter: "drop-shadow(0px 8px 24px rgba(5,8,22,0.65))",
      });

      const bounceWindow = () => {
        gsap.to(windowBg, {
          x: gsap.utils.random(-30, 90),
          // y: gsap.utils.random(-30, 30),
          // rotation: gsap.utils.random(-2, 2),
          // scale: gsap.utils.random(1, 1.2),
          duration: gsap.utils.random(4, 7),
          ease: "sine.inOut",
          onComplete: bounceWindow,
        });
      };

      bounceWindow();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "+=70%",
          scrub: 0.14,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(image, {
        scale: 6,
        y: -40,
        "--blur": "6px",
        ease: "power2.out",
      } as CSSVarTween).to(
        windowBg,
        {
          opacity: 1,
          scale: 1.2,
          ease: "power2.out",
        },
        "-=0.25"
      );
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="relative h-screen w-full overflow-hidden bg-[#0C1B33]"
      aria-label="Arche cinematic hero"
    >
      <div className="relative h-full">
        <div
          ref={imageRef}
          className="absolute inset-0 origin-center will-change-transform z-10"
          style={{ filter: "blur(var(--blur, 0px))" }}
        >
          <Image
            src="/images/woman.png"
            alt="Arche hero banner"
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div
          ref={windowBgRef}
          className="absolute top-0 left-0 overflow-hidden w-full h-screen z-0"
        >
          <Image
            src="/images/background-hero.png"
            alt="Midnight sky behind the window"
            fill
            sizes="100vw"
            quality={100}
            unoptimized
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between px-6 pb-16 pt-12 md:px-12 md:pb-20">
          <div className="flex items-center justify-between text-yellow-100/80 pt-6">
            <span className="text-xs uppercase tracking-[0.65em]">Arche</span>
            <span className="text-[11px] text-white/70">
              Entering the Atelier
            </span>
          </div>
          <div className="space-y-4">
            <h1
              ref={headingRef}
              className="max-w-2xl text-4xl font-serif text-slate-50 md:text-6xl"
            >
              The Origin of Every Idea.
            </h1>
            <p
              ref={bodyRef}
              className="max-w-xl text-base text-slate-100/85 md:text-lg"
            >
              Step through the midnight window; every scroll draws you deeper
              into Arche&apos;s creative chamber before revealing the studio
              below.
            </p>
            <Link
              href="/studio"
              ref={ctaRef}
              className="inline-flex rounded-full bg-yellow-300 px-6 py-2 text-sm font-medium text-slate-900! transition hover:bg-yellow-200"
            >
              Start creating
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
