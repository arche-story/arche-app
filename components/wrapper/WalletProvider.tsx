"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, useWalletClient, usePublicClient } from "wagmi";
import { injected } from "wagmi/connectors";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { Address, custom } from "viem";

interface WalletContextType {
  account: Address | null;
  storyClient: StoryClient | null;
  walletClient: any | null; // Wagmi wallet client for contract interactions
  publicClient: any | null; // Wagmi public client for transaction receipts
  isWalletClientLoading: boolean; // Whether wallet client is still initializing
  connectWallet: () => void;
  isConnecting: boolean;
  isReconnecting: boolean;
  shouldBeConnected: boolean;
  isInitialized: boolean; // NEW: To prevent race conditions
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  storyClient: null,
  walletClient: null,
  publicClient: null,
  isWalletClientLoading: false,
  connectWallet: () => {},
  isConnecting: false,
  isReconnecting: false,
  shouldBeConnected: false,
  isInitialized: false, // Default
  disconnectWallet: () => {},
});

const STORAGE_KEY = "arche.wallet.connected";

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isReconnecting, status } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient, isLoading: isWalletClientLoading } = useWalletClient();
  const publicClient = usePublicClient(); // Get public client

  const [storyClient, setStoryClient] = useState<StoryClient | null>(null);
  const [shouldBeConnected, setShouldBeConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've checked storage

  // 1. Check Storage on Mount (Once)
  useEffect(() => {
      if (typeof window !== "undefined") {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored === "true") {
              setShouldBeConnected(true);
          }
          // Mark as initialized immediately after checking storage
          setIsInitialized(true);
      } else {
          // Fallback for SSR
          setIsInitialized(true);
      }
  }, []);

  // 2. Sync Wagmi status to LocalStorage
  useEffect(() => {
      if (isConnected && address) {
          setShouldBeConnected(true);
          localStorage.setItem(STORAGE_KEY, "true");
      } else if (status === 'disconnected' && isInitialized && !isConnecting && !isReconnecting) {
          // Only clear if explicitly disconnected and we are done initializing/connecting
          // This logic might need to be careful not to auto-disconnect on refresh race
          // Actually, manual disconnect is safer.
      }
  }, [isConnected, address, status, isInitialized, isConnecting, isReconnecting]);

  const connectWallet = () => {
    connect({ connector: injected() });
  };

  const disconnectWallet = () => {
    disconnect();
    setStoryClient(null);
    setShouldBeConnected(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    if (walletClient && isConnected) {
        try {
            const config: StoryConfig = {
                wallet: walletClient,
                transport: custom(walletClient.transport),
                chainId: "aeneid",
            };
            const client = StoryClient.newClient(config);
            setStoryClient(client);
            console.log("Story Protocol Client Initialized with Wagmi");
        } catch (e) {
            console.error("Failed to init story client", e);
        }
    }
  }, [walletClient, isConnected]);

  return (
    <WalletContext.Provider value={{
        account: address || null,
        storyClient,
        walletClient,
        publicClient,
        isWalletClientLoading,
        connectWallet,
        isConnecting,
        isReconnecting,
        shouldBeConnected,
        isInitialized, // Pass it down
        disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);