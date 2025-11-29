"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, GitFork, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IPAsset } from "@/types";

interface AssetDialogProps {
  asset: IPAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDrawer({ asset, isOpen, onClose }: AssetDialogProps) {
  if (!asset) return null;

  const resolveImageUri = (uri: string) => {
    if (!uri) return "";
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return uri;
  };

  const shortenAddress = (addr: string) => {
    if (!addr) return "Unknown";
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-[#0b1628] p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0b1628] shrink-0">
            <div className="flex items-center gap-3">
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
                <Dialog.Title className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
                    {asset.title || asset.prompt}
                </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                
                {/* Left: Image */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20 relative">
                        {asset.imageUri ? (
                            <Image
                            src={resolveImageUri(asset.imageUri)}
                            alt={asset.prompt}
                            fill
                            className="object-cover"
                            unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-xs text-white/30 italic">No Preview</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => navigator.clipboard.writeText(asset.id)}
                            className="bg-white/5 border border-white/10 text-white py-2 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                            title={asset.id}
                        >
                            <Copy className="w-3.5 h-3.5" />
                            Copy ID
                        </button>
                        <a
                            href={`https://aeneid.storyscan.xyz/address/${asset.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 border border-white/10 text-white py-2 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            StoryScan
                        </a>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Full Prompt</h3>
                        <div className="p-4 bg-black/30 rounded-xl border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                {asset.prompt}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-xs text-white/40">Created</span>
                            <span className="text-xs text-white font-mono">{new Date(asset.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-xs text-white/40">Owner</span>
                            <span className="text-xs text-white font-mono truncate max-w-[150px]" title={asset.owner || "Unknown"}>
                                {shortenAddress(asset.owner || "Unknown")}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-xs text-white/40">License</span>
                            <span className="text-xs text-white font-mono">PIL Commercial</span>
                        </div>
                    </div>

                    <Link
                        href={`/studio/new?remix=${asset.id}`}
                        className="w-full bg-arche-gold text-arche-navy dark:text-slate-900 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 transition-all shadow-lg shadow-arche-gold/10 mt-4"
                        onClick={onClose}
                    >
                        <GitFork className="w-4 h-4" />
                        Remix this Asset
                    </Link>
                </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}