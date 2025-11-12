"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

export function useGsapSetup(lenis: Lenis | null | undefined) {
  const lenisRef = useRef<Lenis | null | undefined>(lenis);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    lenisRef.current = lenis;

    gsap.registerPlugin(ScrollTrigger);

    const scrollerElement =
      (lenis?.rootElement as HTMLElement | null) ?? document.documentElement;

    ScrollTrigger.defaults({ scroller: scrollerElement });

    ScrollTrigger.scrollerProxy(scrollerElement, {
      scrollTop(value) {
        const currentLenis = lenisRef.current;
        if (currentLenis) {
          if (typeof value === "number") {
            currentLenis.scrollTo(value, {
              immediate: true,
              programmatic: true,
            });
          }
          return currentLenis.scroll;
        }
        if (typeof value === "number") {
          scrollerElement.scrollTop = value;
          window.scrollTo(0, value);
        }
        return window.scrollY || scrollerElement.scrollTop;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType:
        getComputedStyle(scrollerElement).transform !== "none"
          ? "transform"
          : "fixed",
    });

    if (!lenis) {
      ScrollTrigger.refresh();
      return;
    }

    lenisRef.current = lenis;

    const handleScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleScroll);

    const handleRefresh = () => {
      lenis.resize();
    };

    ScrollTrigger.addEventListener("refresh", handleRefresh);
    ScrollTrigger.refresh();

    // Optimasi lag GSAP, naikin performa
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", handleScroll);
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
    };
  }, [lenis]);
}
