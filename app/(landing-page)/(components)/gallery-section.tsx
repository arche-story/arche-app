"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircularGallery from "@/components/core/circular-gallery";

gsap.registerPlugin(ScrollTrigger);

export function GallerySection() {
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

  const galleryItems = [
    // {
    //   image: "/images/woman.png",
    //   text: "Woman",
    // },
    {
      image: "/images/archer.png",
      text: "Archer",
    },
    {
      image: "/images/swordsman.png",
      text: "Swordsman",
    },
    {
      image: "/images/medeival_astronaut.png",
      text: "Medieval Astronaut",
    },
    {
      image: "/images/medeival.png",
      text: "Medieval Night",
    },
    {
      image: "/images/night_sky.png",
      text: "Galaxy Sky",
    },
    {
      image: "/images/night_sky_1.png",
      text: "Night Sky",
    },
    {
      image: "/images/star_1.png",
      text: "Moon Night",
    },
    {
      image: "/images/cubes.png",
      text: "Cubes",
    },
  ];

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif tracking-tight text-slate-50 md:text-4xl">
          Gallery
        </h2>
        <p className="mt-3 text-sm text-slate-100/60 md:text-base">
          Explore the creative journey through our collection
        </p>
      </div>
      <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0C1B33]/50 via-[#1A3358]/30 to-[#0C1B33]/50 border border-white/10">
        <CircularGallery
          items={galleryItems}
          bend={3}
          textColor="#F8E8B0"
          borderRadius={0.05}
          font="bold 24px serif"
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </div>
    </section>
  );
}
