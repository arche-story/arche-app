"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

export function useGsapSetup(lenis: Lenis | null | undefined) {
  useEffect(() => {
    if (!lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const scrollerElement =
      (lenis.rootElement as HTMLElement | null) ?? document.documentElement;

    ScrollTrigger.defaults({ scroller: scrollerElement });

    let scrollValue = lenis.scroll;

    function updateScrollTrigger() {
      ScrollTrigger.update();
    }

    const handleScroll = (instance: Lenis) => {
      scrollValue = instance.scroll;
      updateScrollTrigger();
    };

    lenis.on("scroll", handleScroll);

    ScrollTrigger.scrollerProxy(scrollerElement, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true, programmatic: true });
        }
        return scrollValue;
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
