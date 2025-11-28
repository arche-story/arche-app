"use client";

import { Plus, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Version } from "@/hooks/useProjectHistory";
import { motion } from "framer-motion";

interface StudioDashboardProps {
  history: Version[];
  onSelectDraft: (draftId: string, prompt: string, imageUrl?: string) => void;
  onNewProject: () => void;
}

export function StudioDashboard({ history, onSelectDraft, onNewProject }: StudioDashboardProps) {
  // Separate drafts from registered/archived items if needed, 
  // but history hook returns a mixed list sorted by date. 
  // We'll display them all as "Recent Activity" for now.

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-arche-navy min-h-full p-8">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Hero / Welcome */}
        <div className="space-y-6 text-center md:text-left py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-arche-gold">Creator</span>.
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Your studio is ready. Start a new masterpiece or continue evolving your previous ideas.
          </p>
          
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-3 px-8 py-4 bg-arche-gold text-arche-navy rounded-full font-bold text-base hover:bg-white transition-all shadow-[0_0_30px_rgba(248,232,176,0.2)] hover:shadow-[0_0_50px_rgba(248,232,176,0.4)] group"
          >
            <Plus className="w-5 h-5" />
            Start New Canvas
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        </div>

        {/* Recent Activity Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-arche-gold" />
              Recent Activity
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-white/40">No recent projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectDraft(item.id, item.prompt || "", item.imageUri)}
                  className="group flex flex-col text-left bg-[#0F213E] border border-white/5 rounded-xl overflow-hidden hover:border-arche-gold/30 hover:shadow-xl transition-all duration-300 h-64"
                >
                  {/* Thumbnail Preview */}
                  <div className="flex-1 w-full bg-black/20 relative overflow-hidden">
                    {item.imageUri ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={item.imageUri.startsWith("ipfs") ? item.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") : item.imageUri} 
                        alt={item.label} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                        <span className="text-white/20 text-xs font-mono">No Preview</span>
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-md",
                            item.status === "REGISTERED"
                                ? "bg-arche-gold/20 border-arche-gold/50 text-arche-gold"
                                : "bg-white/10 border-white/20 text-white/60"
                        )}>
                            {item.status === "REGISTERED" ? "REGISTERED" : "DRAFT"}
                        </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-2 bg-[#0F213E] group-hover:bg-[#132745] transition-colors">
                    <h3 className="font-semibold text-white truncate" title={item.label || item.prompt}>
                        {item.label || "Untitled Draft"}
                    </h3>
                    <p className="text-xs text-white/40 font-mono">
                        Last edited: {item.timestamp}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
