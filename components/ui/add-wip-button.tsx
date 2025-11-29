"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface AddWipButtonProps {
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export function AddWipButton({ className, variant = "ghost" }: AddWipButtonProps) {
  const addWipToken = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request to add the WIP token to the user's wallet
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: '0x1514000000000000000000000000000000000000',
              symbol: 'WIP',
              decimals: 18,
              image: 'https://raw.githubusercontent.com/storyprotocol/brand-assets/main/logo.png', // Optional placeholder
            },
          },
        });
      } catch (error) {
        console.error("Failed to add WIP token to wallet:", error);
      }
    } else {
      console.error("Ethereum wallet not detected. Please install MetaMask or another Web3 wallet.");
    }
  };

  return (
    <Button
      onClick={addWipToken}
      className={cn(
        variant === "secondary" && "bg-arche-gold/20 text-arche-gold border border-arche-gold/30 hover:bg-arche-gold/30",
        variant === "outline" && "border border-arche-gold text-arche-gold hover:bg-arche-gold hover:text-arche-navy",
        variant === "ghost" && "text-arche-gold hover:bg-arche-gold/10 hover:text-arche-gold/90",
        className
      )}
      variant={variant}
    >
      <Plus className="w-3 h-3" />
      Add $WIP
    </Button>
  );
}