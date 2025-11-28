"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { useWallet } from "@/components/wrapper/WalletProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/studio", label: "Studio" },
  { href: "/profile", label: "Profile" },
];

type SiteHeaderProps = {
  revealOnScroll?: boolean;
};

export function SiteHeader({ revealOnScroll = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { account, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const isHomePage = pathname === "/";
  const shouldHideOnTop = revealOnScroll && isHomePage;
  const [scrollY, setScrollY] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    if (!shouldHideOnTop) {
      return;
    }

    let rafId: number | null = null;

    const updateScroll = () => {
      if (lenis) {
        if (lenis.scroll !== undefined) {
          setScrollY(lenis.scroll);
        }
      } else {
        setScrollY(window.scrollY);
      }
      rafId = null;
    };

    if (lenis) {
      const handleLenisScroll = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(updateScroll);
        }
      };

      lenis.on("scroll", handleLenisScroll);

      // Initial update via RAF
      rafId = requestAnimationFrame(updateScroll);

      return () => {
        lenis.off("scroll", handleLenisScroll);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    // Initial update via RAF
    rafId = requestAnimationFrame(updateScroll);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [lenis, shouldHideOnTop]);

  const isVisible = !shouldHideOnTop || scrollY > 40;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 border-b border-white/5 bg-[#0C1B33]/70 backdrop-blur transition-all duration-300 ease-out will-change-transform",
        shouldHideOnTop && !isVisible && "pointer-events-none"
      )}
      style={
        shouldHideOnTop && !isVisible
          ? {
              transform: "translateY(-100%)",
              opacity: 0,
              visibility: "hidden",
              height: 0,
              minHeight: 0,
              overflow: "hidden",
            }
          : shouldHideOnTop
          ? {
              transform: "translateY(0)",
              opacity: 1,
              visibility: "visible",
            }
          : undefined
      }
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo/arche-logo.png"
            alt="Arche Logo"
            width={100}
            height={100}
            unoptimized
            className="h-14 w-auto"
            priority
          />
          <span className="text-[10px] text-yellow-200/80 hidden sm:inline">
            origin of ideas
          </span>
        </Link>
        <nav className="flex gap-3 text-sm text-slate-100/60 items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1 transition",
                pathname === link.href
                  ? "bg-white/10 text-slate-50"
                  : "hover:bg-white/5 hover:text-slate-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          
          {!account ? (
             <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="ml-4 px-3 py-1 text-xs font-medium text-arche-gold border border-arche-gold/20 rounded-full hover:bg-arche-gold/10 transition-colors disabled:opacity-50"
             >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
             </button>
         ) : (
             <button 
                onClick={() => { if(window.confirm("Disconnect wallet?")) disconnectWallet() }} 
                className="ml-4 text-xs text-arche-gold/80 font-mono border border-arche-gold/10 rounded-full px-3 py-1 bg-arche-gold/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                title="Click to disconnect"
             >
                {account.slice(0,6)}...{account.slice(-4)}
             </button>
         )}
        </nav>
      </div>
    </header>
  );
}
