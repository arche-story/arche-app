"use client";

import Image from "next/image"; // Added
import { Sparkles } from "lucide-react"; // Added
import { cn } from "@/lib/utils"; // Added cn import

type AIOutputPanelProps = {
  output: string | null;
  imageUrl: string | null;
  onSave: () => void;
  onRegister: () => void;
  onRevert?: () => void;
  onImageLoad?: () => void; // Added callback
  isRegistering: boolean;
  isGenerating: boolean;
  isDirty?: boolean;
};

export function AIOutputPanel({
  output,
  imageUrl,
  onSave,
  onRegister,
  onRevert,
  onImageLoad,
  isRegistering,
  isGenerating,
  isDirty = false,
}: AIOutputPanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0F213E]/50 backdrop-blur p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-100/60">
              Current draft
            </p>
            {isDirty && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    UNSAVED
                </span>
            )}
          </div>
          <h2 className="text-base font-medium text-slate-50">
            Generated preview
          </h2>
        </div>
        <div className="flex gap-2">
          {isDirty && onRevert && (
             <button
                onClick={onRevert}
                disabled={isGenerating || isRegistering}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
             >
                Revert
             </button>
          )}
          <button
            onClick={onSave}
            disabled={isGenerating || isRegistering || !isDirty}
            className={cn(
                "rounded-full px-4 py-1.5 text-xs transition disabled:opacity-50 disabled:cursor-not-allowed",
                isDirty 
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                    : "border border-white/10 bg-white/5 text-slate-50 hover:bg-white/10"
            )}
          >
            {isDirty ? "Commit Version" : "Saved"}
          </button>
          <button
            onClick={onRegister}
            disabled={isRegistering || isGenerating || !imageUrl || isDirty}
            className="rounded-full bg-yellow-300/90 px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isDirty ? "Please commit version before signing" : "Register on Story Protocol"}
          >
            {isRegistering ? "Registering..." : "Sign on Story"}
          </button>
        </div>
      </div>
      <div className="min-h-[320px] rounded-xl border border-white/5 bg-[#0b1a2d] p-4 flex items-center justify-center relative overflow-hidden group">
        {isGenerating && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-arche-gold/50 bg-[#0b1a2d]/80 backdrop-blur-sm animate-pulse">
                <Sparkles className="w-8 h-8" />
                <p className="text-sm">Generating magic...</p>
            </div>
        )}
        
        {imageUrl ? (
            <Image
                src={imageUrl}
                alt={output || "Generated AI Art"}
                fill
                className={cn(
                    "object-contain transition-all duration-500",
                    isGenerating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}
                unoptimized 
                priority 
                onLoadingComplete={() => onImageLoad?.()}
            />
        ) : output ? (
          <p className="whitespace-pre-wrap text-sm text-slate-50">{output}</p>
        ) : (
          <p className="text-sm text-slate-100/40">
            No output yet. Describe your concept and paint it.
          </p>
        )}
      </div>
    </section>
  );
}
