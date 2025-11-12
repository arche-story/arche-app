"use client";

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import "./transition-overlay.css";

export function TransitionOverlay({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoOverlayRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const isTransitioningRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const previousPathnameRef = useRef<string | null>(null);

  const shouldShowTransition = useCallback(
    (fromRoute: string, toRoute: string): boolean => {
      const baseRoute = "/";
      const featureRoutes = ["/studio", "/timeline", "/gallery"];

      const normalizedFrom =
        fromRoute === "/" ? "/" : fromRoute.replace(/\/$/, "");
      const normalizedTo = toRoute === "/" ? "/" : toRoute.replace(/\/$/, "");

      const isFromBaseToFeature =
        normalizedFrom === baseRoute && featureRoutes.includes(normalizedTo);
      const isFromFeatureToBase =
        featureRoutes.includes(normalizedFrom) && normalizedTo === baseRoute;

      return isFromBaseToFeature || isFromFeatureToBase;
    },
    []
  );

  const createBlocks = () => {
    if (!overlayRef.current) return;

    blocksRef.current = [];
    overlayRef.current.innerHTML = "";

    for (let i = 0; i < 20; i++) {
      const block = document.createElement("div");
      block.className = "transition-block";
      overlayRef.current.appendChild(block);
      blocksRef.current.push(block);
    }
  };

  const setupGSAP = () => {
    blocksRef.current.forEach((block) => {
      gsap.set(block, {
        scaleX: 0,
        transformOrigin: "left",
      });
    });

    if (logoOverlayRef.current) {
      gsap.set(logoOverlayRef.current, {
        opacity: 0,
        scale: 0.8,
      });
    }

    if (logoImageRef.current) {
      gsap.set(logoImageRef.current, {
        opacity: 0,
        scale: 0.9,
      });
    }
  };

  const coverPage = useCallback(
    (targetRoute: string) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          router.push(targetRoute);
        },
      });

      tl.to(blocksRef.current, {
        scaleX: 1,
        duration: 0.6,
        stagger: 0.03,
        ease: "power2.inOut",
        transformOrigin: "left",
      });

      tl.to(
        logoOverlayRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      );

      if (logoImageRef.current) {
        tl.to(
          logoImageRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.2)",
          },
          "-=0.3"
        );
      }
    },
    [router]
  );

  const revealPage = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioningRef.current = false;
      },
    });

    blocksRef.current.forEach((block) => {
      gsap.set(block, {
        transformOrigin: "right",
      });
    });

    if (logoImageRef.current) {
      tl.to(logoImageRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    tl.to(
      logoOverlayRef.current,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
      },
      "-=0.1"
    );

    tl.to(
      blocksRef.current,
      {
        scaleX: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: "power2.inOut",
        transformOrigin: "right",
      },
      "-=0.1"
    );
  };

  useLayoutEffect(() => {
    createBlocks();
    setupGSAP();

    setTimeout(() => {
      setIsInitialized(true);
      previousPathnameRef.current = pathname;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (previousPathname && shouldShowTransition(previousPathname, pathname)) {
      const timer = setTimeout(() => {
        revealPage();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pathname, isInitialized, shouldShowTransition]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");
      if (
        !href ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      try {
        const url = new URL(link.href, window.location.origin);
        if (url.origin !== window.location.origin) {
          return;
        }
        const targetRoute = url.pathname + url.search + url.hash;

        if (targetRoute === pathname) {
          return;
        }

        if (shouldShowTransition(pathname, targetRoute)) {
          e.preventDefault();
          coverPage(targetRoute);
        } else {
          e.preventDefault();
          router.push(targetRoute);
        }
      } catch {
        if (href && href.startsWith("/")) {
          const targetRoute = href.split("?")[0].split("#")[0];
          if (targetRoute !== pathname) {
            if (shouldShowTransition(pathname, targetRoute)) {
              e.preventDefault();
              coverPage(href);
            } else {
              e.preventDefault();
              router.push(href);
            }
          }
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [pathname, router, isInitialized, coverPage, shouldShowTransition]);

  return (
    <>
      <div ref={overlayRef} className="transition-overlay" />
      <div ref={logoOverlayRef} className="transition-logo-overlay">
        <div ref={logoImageRef} className="transition-logo-image-wrapper">
          <Image
            src="/logo/arche-logo.png"
            alt="Arche Logo"
            width={500}
            height={500}
            unoptimized
            className="transition-logo-image w-full h-full object-contain animate-bounce"
            priority
          />
        </div>
      </div>
      {children}
    </>
  );
}
