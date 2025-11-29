"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/components/wrapper/WalletProvider";
import { toast } from "sonner";
import { parseEther } from "viem";
// 1. Import actions and config
import { getWalletClient, switchChain } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { aeneid } from "@/lib/wagmi"; // Import chain definition
import { addWipTokenToMetaMask, hasAddedWipToken } from "@/lib/utils";

interface Listing {
  listingId: string;
  price: string;
  asset: {
    id: string;
    title: string;
    prompt: string;
    imageUri: string;
  };
  seller: {
    address: string;
    username: string;
  };
}

interface ListingCardProps {
  listing: Listing;
  onBuySuccess: () => void;
}

// WIP Token Address (from your SUMMARY)
const WIP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_WIP_TOKEN_ADDRESS || "0x1514000000000000000000000000000000000000";

export function ListingCard({ listing, onBuySuccess }: ListingCardProps) {
  // Ambil account untuk cek ownership & display, tapi JANGAN bergantung pada walletClient dari sini untuk eksekusi
  const { account, connectWallet } = useWallet();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async () => {
    if (!account) {
      connectWallet();
      return;
    }

    setIsBuying(true);
    const toastId = toast.loading("Initializing purchase...");

    try {
      // 2. FETCH IMPERATIVE
      let activeClient = await getWalletClient(config);

      // 3. Auto-Switch Network (SAFE CHECK)
      // Cek apakah client ada, dan jika chain-nya terdeteksi, pastikan ID-nya benar.
      // Jika chain undefined, kita asumsikan perlu switch/init ulang.
      const currentChainId = activeClient?.chain?.id;

      if (!activeClient || currentChainId !== aeneid.id) {
        toast.loading("Switching network...", { id: toastId });
        try {
             await switchChain(config, { chainId: aeneid.id });
             // Ambil ulang setelah switch untuk memastikan state terbaru
             activeClient = await getWalletClient(config);
        } catch (switchError: any) {
             throw new Error(switchError?.message?.includes("rejected")
                ? "Network switch cancelled"
                : "Please switch your wallet to Aeneid Testnet.");
        }
      }

      // Double check setelah switch
      if (!activeClient) {
        throw new Error("Wallet connection failed. Please reconnect.");
      }

      console.log("Wallet Client Ready:", activeClient);

      // 4. Eksekusi Transaksi
      const priceInWei = parseEther(listing.price);
      let hash: `0x${string}`;

      // For 0-price items, no token transfer is needed
      if (priceInWei.toString() === "0") {
        // Create a mock transaction hash for 0-price items
        hash = `0x0000000000000000000000000000000000000000000000000000000000000000`;

        toast.loading("Processing free purchase...", { id: toastId });
      } else {
        toast.loading("Please confirm in your wallet...", { id: toastId });

        hash = await activeClient.writeContract({
          address: WIP_TOKEN_ADDRESS as `0x${string}`,
          abi: [{
              name: 'transfer',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
              outputs: [{ name: '', type: 'bool' }]
          }],
          functionName: 'transfer',
          args: [listing.seller.address as `0x${string}`, priceInWei],
          account: account as `0x${string}`,
          chain: aeneid
        });

        toast.loading("Transaction submitted. Waiting for confirmation...", { id: toastId });
      }

      // 5. Call API to update DB
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.listingId,
          buyerAddress: account,
          txHash: hash
        })
      });

      if (!res.ok) throw new Error("Failed to update ownership record");

      toast.success("Asset purchased successfully!", {
        id: toastId,
        // Logic Pintar: Cuma munculin tombol Add WIP kalau belum pernah di-add
        action: !hasAddedWipToken() ? {
          label: "Add WIP to Wallet",
          onClick: () => addWipTokenToMetaMask()
        } : undefined
      });
      onBuySuccess();

    } catch (error: any) {
      console.error("Purchase error:", error);
      if (error.message?.includes("rejected") || error.code === 4001) {
         toast.error("Transaction cancelled", { id: toastId });
      } else {
         toast.error(`Purchase failed: ${error.message || "Unknown error"}`, { id: toastId });
      }
    } finally {
      setIsBuying(false);
    }
  };

  const resolveImageUri = (uri: string) => {
    if (uri?.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return uri || "";
  };

  const isOwner = account?.toLowerCase() === listing.seller.address.toLowerCase();

  return (
    <div className="group relative bg-[#0F213E]/50 backdrop-blur border border-white/5 rounded-xl overflow-hidden hover:border-arche-gold/30 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square bg-[#0b1628] overflow-hidden">
        {listing.asset.imageUri ? (
          <Image
            src={resolveImageUri(listing.asset.imageUri)}
            alt={listing.asset.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
            No Preview
          </div>
        )}

        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10">
          {listing.price} WIP
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white truncate text-base" title={listing.asset.title}>
            {listing.asset.title || listing.asset.prompt}
          </h3>
          <p className="text-xs text-white/60 mt-1 truncate">
            Seller: {listing.seller.username !== "Unknown Seller" ? listing.seller.username : listing.seller.address.slice(0,6) + "..."}
          </p>
        </div>

        <button
          onClick={handleBuy}
          disabled={isBuying || isOwner}
          className="w-full mt-4 py-2.5 rounded-lg bg-arche-gold text-arche-navy dark:text-slate-900 font-bold text-sm hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isBuying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isOwner ? (
            "You Own This"
          ) : (
            "Buy Now"
          )}
        </button>
      </div>
    </div>
  );
}
