"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWallet } from "@/components/wrapper/WalletProvider";

const PROTECTED_ROUTES = ["/studio", "/profile"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const {
    account,
    isConnecting,
    isReconnecting,
    shouldBeConnected,
    isInitialized,
  } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  // Safety timeout to prevent infinite loading
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shouldBeConnected && !account) {
      timer = setTimeout(() => setIsTimedOut(true), 4000); // 4s timeout
    }
    return () => clearTimeout(timer);
  }, [shouldBeConnected, account]);

  useEffect(() => {
    // 1. Wait for hydration
    if (!isInitialized) return;

    // 2. If we are theoretically connected (localStorage), DO NOT REDIRECT yet.
    //    Wait for 'account' to be populated by Wagmi.
    if (shouldBeConnected && !account) {
      // If we timed out waiting, THEN we might consider redirecting or letting user handle it.
      // But strictly speaking, we shouldn't auto-redirect if we think they are logged in.
      // We just let the Loading UI hang (with timeout option)
      return;
    }

    // 3. If actively loading
    if (isConnecting || isReconnecting) return;

    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    // 4. Only redirect if:
    //    - Route is protected
    //    - We are NOT supposed to be connected (shouldBeConnected is false) OR we gave up waiting (account is null after logic above)
    //    Since we return early above for (shouldBeConnected && !account),
    //    getting here means either account exists OR shouldBeConnected is false.
    if (isProtected && !account) {
      router.push("/?connect=true");
    }
  }, [
    account,
    isConnecting,
    isReconnecting,
    shouldBeConnected,
    isInitialized,
    pathname,
    router,
  ]);

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // LOADING STATE Logic
  const isLoading =
    !isInitialized ||
    isConnecting ||
    isReconnecting ||
    (shouldBeConnected && !account);

  if (isProtected && isLoading) {
    return (
      <div className="min-h-screen bg-arche-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {!isTimedOut ? (
            <>
              <div className="w-8 h-8 border-2 border-arche-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-arche-gold/50 animate-pulse">
                Restoring session...
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-red-400">Connection timed out.</p>
              <button
                onClick={() => router.push("/?connect=true")}
                className="px-4 py-2 bg-white/10 text-white rounded text-xs hover:bg-white/20"
              >
                Return Home & Reconnect
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
