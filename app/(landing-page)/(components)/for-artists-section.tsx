"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ForArtistsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  index: number;
};

function ForArtistsCard({
  eyebrow,
  title,
  description,
  items,
  index,
}: ForArtistsSectionProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.set(card, { x: index === 0 ? -40 : 40, opacity: 0 });

      gsap.to(card, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, card);

    return () => ctx.revert();
  }, [index]);

  return (
    <div ref={cardRef} className="group">
      <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/60">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-serif text-slate-50 transition-colors duration-300 group-hover:text-yellow-200/90">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-100/60 transition-colors duration-300 group-hover:text-slate-100/80">
        {description}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-100/70">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="transition-colors duration-300 group-hover:text-slate-100/90"
          >
            <div className="flex flex-row justify-start items-center w-fit gap-3">
              <span className="mr-0.5 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-200/60 transition-all duration-300 group-hover:bg-yellow-200/90 group-hover:scale-125" />
              <span className="leading-relaxed">{item}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ForArtistsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.set(section, { y: 40, opacity: 0 });

      gsap.to(section, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0C1B33] via-[#1A3358]/50 to-[#0C1B33] px-6 py-16 shadow-[0_0_60px_rgba(248,228,115,0.05)] md:grid-cols-2 md:px-8"
      style={{
        background:
          "linear-gradient(135deg, #0C1B33 0%, #1A3358 50%, #0C1B33 100%)",
      }}
    >
      <ForArtistsCard
        eyebrow="for artists & ai creators"
        title="Own the output you generate."
        description="Every prompt, every style transfer, every iteration — attach your name and timestamp. Arche lets you show the journey, not just the destination."
        items={[
          "Timeline of drafts and finals",
          "On-chain registration via Story",
          "Shareable creation proof",
        ]}
        index={0}
      />
      <ForArtistsCard
        eyebrow="for builders & hackathon teams"
        title="Ship a real IP aware front-end."
        description="Integrate Story SDK, show the IP lifecycle, and present a UI that feels human-centered, not just a dev tool."
        items={[
          "Clear registration UX",
          "Visualized IP states",
          "Production-ready layout",
        ]}
        index={1}
      />
    </section>
  );
}
