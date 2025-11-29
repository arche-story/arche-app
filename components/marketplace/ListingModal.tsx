"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Tag, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/components/wrapper/WalletProvider";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetTitle: string;
}

export function ListingModal({ isOpen, onClose, assetId, assetTitle }: ListingModalProps) {
  const { account } = useWallet();
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
        toast.error("Please enter a valid price (0 or more)");
        return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipId: assetId,
          price: price,
          sellerAddress: account
        })
      });

      if (!res.ok) throw new Error("Failed to create listing");

      toast.success(`Asset listed successfully on Marketplace! ${Number(price) === 0 ? "Free listing for demo purposes." : ""}`);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Listing failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-[#0b1628] p-6 shadow-2xl duration-200 sm:rounded-2xl">
          
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-arche-gold" />
                List Asset for Sale
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-400">
              Set a price for <strong>{assetTitle}</strong>. Users can buy it directly using WIP tokens. Price can be 0 for free distribution (useful for demos).
            </Dialog.Description>
          </div>

          <form onSubmit={handleList} className="space-y-6 mt-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Price (WIP)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 0 (free) or 100"
                        min="0"
                        step="0.01"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-arche-gold/50 transition-colors pr-12"
                        autoFocus
                    />
                    <div className="absolute right-4 top-3 text-sm text-white/40 font-bold pointer-events-none">
                        WIP
                    </div>
                </div>
                <p className="text-xs text-white/30 italic">
                    * Platform fee (2.5%) will be deducted upon sale.
                </p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-arche-gold text-slate-900 font-bold text-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    List Item
                </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 p-2 rounded-full text-white/50 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
