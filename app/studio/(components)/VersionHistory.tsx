"use client";

import * as React from "react";
import { Clock, FileClock, GitBranch, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Version {
  id: string;
  label: string;
  timestamp: string;
  type: "GENESIS" | "DRAFT" | "REMIX";
  status?: string; // Already optional?
  prompt?: string; // Added
  imageUri?: string; // Added
}

interface VersionHistoryProps {
  className?: string;
  history?: Version[]; // Accept real history
  onSelectVersion?: (versionId: string) => void;
}

export function VersionHistory({ className, history = [], onSelectVersion }: VersionHistoryProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Set active ID to the latest version if history exists and no active ID is set
  React.useEffect(() => {
      if (history.length > 0 && !activeId) {
          setActiveId(history[0].id);
      }
  }, [history, activeId]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    onSelectVersion?.(id);
  };

  return (
    <div className={cn("flex flex-col h-full backdrop-blur-md bg-[#0F213E]/50 border-r border-white/10 text-white", className)}>
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
        <FileClock className="w-4 h-4 text-arche-gold" />
        <h2 className="font-semibold text-xs tracking-[0.15em] uppercase text-slate-200">Version History</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {history.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <p className="text-xs text-slate-500 italic">No history yet.</p>
                <p className="text-[10px] text-slate-600 mt-1">Start creating to see versions.</p>
             </div>
        ) : (
            history.map((version) => (
              <button
                key={version.id}
                onClick={() => handleSelect(version.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group hover:bg-white/5",
                  activeId === version.id ? "bg-white/10 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.2)]" : "border border-transparent"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full flex-shrink-0",
                  version.type === "GENESIS" ? "bg-purple-500/20 text-purple-300" : 
                  version.type === "REMIX" ? "bg-emerald-500/20 text-emerald-300" :
                  "bg-blue-500/20 text-blue-300"
                )}>
                  <GitBranch className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-slate-200 truncate">{version.label}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{version.timestamp}</span>
                  </div>
                </div>
                {activeId === version.id && (
                  <ChevronRight className="w-3 h-3 text-arche-gold animate-in fade-in slide-in-from-left-1" />
                )}
              </button>
            ))
        )}
      </div>
    </div>
  );
}