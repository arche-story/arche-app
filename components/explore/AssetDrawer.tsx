"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, GitFork, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IPAsset } from "@/types";

interface AssetDrawerProps {
  asset: IPAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDrawer({ asset, isOpen, onClose }: AssetDrawerProps) {
  if (!asset) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-300" />
        <Dialog.Content 
          className="fixed right-0 top-0 h-screen w-full md:w-[450px] bg-[#0b1628] border-l border-white/10 z-50 shadow-2xl data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full transition-transform duration-300 ease-in-out grid grid-rows-[auto_1fr]"
        >
          {/* Header Section (Fixed) */}
          <div className="p-6 flex justify-between items-start border-b border-white/10">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    asset.type === "GENESIS"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-blue-500/20 border-blue-500/50 text-blue-300"
                  )}
                >
                  {asset.type}
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {asset.id.slice(0, 6)}...{asset.id.slice(-4)}
                </span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-white/50 hover:text-white p-2 -mr-2 -mt-2 rounded-sm hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto overflow-x-hidden p-6 space-y-6 min-h-0">
            <Dialog.Title className="text-xl font-semibold text-white leading-tight">
              {asset.prompt}
            </Dialog.Title>

            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20 relative shrink-0">
              {asset.imageUri && asset.imageUri.startsWith("http") ? (
                <Image
                  src={asset.imageUri}
                  alt={asset.prompt}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-white/5 to-white/0">
                  <p className="text-xs text-white/30 italic">
                    No Preview Available
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/studio/new?remix=${asset.id}`}
                className="col-span-2 bg-arche-gold text-arche-navy py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
                onClick={onClose}
              >
                <GitFork className="w-4 h-4" />
                Remix this Asset
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(asset.id);
                }}
                className="bg-white/5 border border-white/10 text-white py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy ID
              </button>
              <a
                href={`https://aeneid.storyscan.xyz/address/${asset.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 text-white py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Story Explorer
              </a>
            </div>

            {/* Details */}
            <div className="space-y-4 pt-4 border-t border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                Metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/40">Created</p>
                  <p className="text-sm text-white font-mono">
                    {new Date(asset.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Full Prompt</p>
                  <p className="text-sm text-white/80 leading-relaxed p-3 bg-black/20 rounded-lg mt-1 border border-white/5">
                    {asset.prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
