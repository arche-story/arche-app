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

// Van Gogh Starry Night Palette
const COLORS = ["#0C1B33", "#1A3358", "#355C7D", "#E8C547", "#F8E473"];

export function TransitionOverlay({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoOverlayRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const isTransitioningRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const previousPathnameRef = useRef<string | null>(null);

  const shouldShowTransition = useCallback(
    (fromRoute: string, toRoute: string): boolean => {
      const baseRoute = "/";
      const featureRoutes = [
        "/studio",
        "/collection",
        "/profile",
        "/explore",
        "/marketplace",
      ];

      // Normalize routes to remove trailing slashes and query params
      const cleanFrom = fromRoute.split("?")[0].replace(/\/$/, "") || "/";
      const cleanTo = toRoute.split("?")[0].replace(/\/$/, "") || "/";

      const isFromBase = cleanFrom === baseRoute;
      const isToBase = cleanTo === baseRoute;

      const isFromFeature = featureRoutes.some((r) => cleanFrom.startsWith(r));
      const isToFeature = featureRoutes.some((r) => cleanTo.startsWith(r));

      // Case 1: Home to Feature -> Show Transition
      if (isFromBase && isToFeature) return true;

      // Case 2: Feature to Home -> Show Transition
      if (isFromFeature && isToBase) return true;

      // Case 3: Feature to Feature -> No Transition (for speed)
      if (isFromFeature && isToFeature) return false;

      // Default: Show transition for other major navigation (optional, set to false if strict)
      return false;
    },
    []
  );

  const setupGSAP = () => {
    layersRef.current.forEach((layer, i) => {
      if (layer) {
        gsap.set(layer, {
          scaleY: 0,
          transformOrigin: i % 2 === 0 ? "top" : "bottom",
        });
      }
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

      // Animate layers IN ("Painting" the screen)
      tl.to(layersRef.current, {
        scaleY: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.inOut",
        transformOrigin: (i) => (i % 2 === 0 ? "top" : "bottom"),
      });

      // Logo enters
      tl.to(
        logoOverlayRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.4"
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
          "-=0.4"
        );
      }
    },
    [router]
  );

  const revealPage = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioningRef.current = false;
        // Reset layers for next time (optional, but good practice)
        // setupGSAP();
      },
    });

    // Logo exits first
    if (logoImageRef.current) {
      tl.to(logoImageRef.current, {
        opacity: 0,
        scale: 1.1,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    tl.to(
      logoOverlayRef.current,
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in",
      },
      "-=0.2"
    );

    // Animate layers OUT (Peeling away)
    tl.to(
      layersRef.current,
      {
        scaleY: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.inOut",
        transformOrigin: (i) => (i % 2 === 0 ? "bottom" : "top"), // Reverse origin
      },
      "-=0.1"
    );
  };

  useLayoutEffect(() => {
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

    // If we just navigated (pathname changed), reveal the page
    if (previousPathname && previousPathname !== pathname) {
      // Logic check could be added here if we only want transition on certain routes
      // But since we triggered coverPage, we assume we want revealPage.
      const timer = setTimeout(() => {
        revealPage();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pathname, isInitialized]);

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
          // If we don't show transition, just route normally
          // e.preventDefault(); // Only prevent if we are handling it
          // router.push(targetRoute);
        }
      } catch {
        if (href && href.startsWith("/")) {
          const targetRoute = href.split("?")[0].split("#")[0];
          if (targetRoute !== pathname) {
            if (shouldShowTransition(pathname, targetRoute)) {
              e.preventDefault();
              coverPage(href);
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
      <div ref={overlayRef} className="transition-overlay">
        {COLORS.map((color, i) => (
          <div
            key={i}
            ref={(el) => {
              layersRef.current[i] = el;
            }}
            className="transition-layer"
            style={{
              backgroundColor: color,
              zIndex: 5000 + i,
            }}
          />
        ))}
      </div>
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
