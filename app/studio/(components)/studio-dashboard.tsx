"use client";

import { Plus, Clock, ArrowRight, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Version } from "@/hooks/useProjectHistory";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/hooks/useUserProfile";

interface StudioDashboardProps {
  history: Version[];
  userProfile?: UserProfile | null;
  onSelectDraft: (draftId: string, prompt: string, imageUrl?: string) => void;
  onNewProject: () => void;
  onRemixAsset?: (ipId: string) => void;
}

export function StudioDashboard({ history, userProfile, onSelectDraft, onNewProject, onRemixAsset }: StudioDashboardProps) {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-arche-navy min-h-full p-8">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Hero / Welcome */}
        <div className="space-y-6 text-center md:text-left py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-arche-gold">{userProfile?.username || "Creator"}</span>.
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Your studio is ready. Start a new masterpiece or continue evolving your previous ideas.
          </p>
          
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-3 px-8 py-4 bg-arche-gold text-arche-navy dark:text-slate-900 rounded-full font-bold text-base hover:bg-white hover:text-slate-900 transition-all shadow-[0_0_30px_rgba(248,232,176,0.2)] hover:shadow-[0_0_50px_rgba(248,232,176,0.4)] group"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {history.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#0F213E] border border-white/5 rounded-xl overflow-hidden hover:border-arche-gold/30 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative aspect-square bg-black/40 overflow-hidden">
                    {item.imageUri ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={item.imageUri.startsWith("ipfs") ? item.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") : item.imageUri} 
                        alt={item.label} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                        <span className="text-white/20 text-xs font-mono">No Preview</span>
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                        {item.status === "REGISTERED" ? (
                            <button 
                                onClick={() => onRemixAsset ? onRemixAsset(item.id) : router.push(`/studio/new?remix=${item.id}`)}
                                className="px-4 py-2 rounded-full bg-arche-gold text-slate-900 font-bold text-sm hover:bg-white transition-colors"
                            >
                                Remix
                            </button>
                        ) : (
                            <button 
                                onClick={() => onSelectDraft(item.id, item.prompt || "", item.imageUri)}
                                className="px-4 py-2 rounded-full bg-arche-gold text-slate-900 font-bold text-sm hover:bg-white transition-colors flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" /> Resume
                            </button>
                        )}
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-[#0F213E] group-hover:bg-[#132745] transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-semibold text-white truncate text-sm flex-1 mr-2" title={item.label}>
                                {item.label}
                            </h3>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md uppercase tracking-wide shrink-0",
                                item.status === "REGISTERED"
                                    ? "bg-arche-gold/10 border-arche-gold/30 text-arche-gold"
                                    : "bg-white/10 border-white/20 text-white/50"
                            )}>
                                {item.status === "REGISTERED" ? "IP" : "Draft"}
                            </span>
                        </div>
                        <p className="text-xs text-white/40 font-mono">
                            {item.timestamp}
                        </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}