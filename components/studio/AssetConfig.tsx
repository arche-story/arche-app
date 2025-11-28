"use client";

import * as React from "react";
import { Settings2, Info, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { LicenseSelector } from "@/components/studio/LicenseSelector";
import { LicenseParams } from "@/types/license";

interface AssetConfigProps {
  className?: string;
  licenseParams: LicenseParams;
  onLicenseChange: (params: LicenseParams) => void;
  parentIpId?: string;
  onParentIpIdChange?: (id: string) => void;
  disabled?: boolean;
}

type Tab = "REMIX" | "LICENSE";

export function AssetConfig({ 
    className, 
    licenseParams, 
    onLicenseChange,
    parentIpId = "",
    onParentIpIdChange,
    disabled 
}: AssetConfigProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>("LICENSE");

  return (
    <div className={cn("flex flex-col h-full backdrop-blur-md bg-[#0F213E]/50 border-l border-white/10 text-white", className)}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
        <Settings2 className="w-4 h-4 text-arche-gold" />
        <h2 className="font-semibold text-xs tracking-[0.15em] uppercase text-slate-200">Asset Configuration</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
         <button
          onClick={() => setActiveTab("LICENSE")}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors relative",
            activeTab === "LICENSE" ? "text-arche-gold bg-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          )}
        >
          Rights & Terms
          {activeTab === "LICENSE" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-arche-gold shadow-[0_0_10px_rgba(248,232,176,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("REMIX")}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors relative",
            activeTab === "REMIX" ? "text-arche-gold bg-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          )}
        >
          Provenance
          {activeTab === "REMIX" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-arche-gold shadow-[0_0_10px_rgba(248,232,176,0.5)]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {activeTab === "REMIX" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-arche-gold/70 flex items-center gap-1">
                Parent IP ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={parentIpId}
                  onChange={(e) => onParentIpIdChange?.(e.target.value)}
                  placeholder="0x..."
                  disabled={disabled}
                  className="w-full bg-[#08101d] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-arche-gold/50 transition-all font-mono"
                />
                {parentIpId && (
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500">
                       {/* Indicator valid */}
                   </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                If this is a remix, paste the Parent IP ID here. The Graph will automatically link them.
              </p>
            </div>
          </div>
        )}

        {activeTab === "LICENSE" && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <LicenseSelector 
                value={licenseParams}
                onChange={onLicenseChange}
                disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}