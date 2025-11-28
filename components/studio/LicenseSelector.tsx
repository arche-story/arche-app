"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LicenseParams, LicenseType } from "@/types/license";
import { Check, Coins, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LicenseSelectorProps {
  value: LicenseParams;
  onChange: (value: LicenseParams) => void;
  disabled?: boolean;
}

export function LicenseSelector({ value, onChange, disabled }: LicenseSelectorProps) {
  const handleTypeChange = (type: LicenseType) => {
    onChange({ ...value, type });
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, mintingFee: e.target.value });
  };

  const handleRevShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(100, Math.max(0, Number(e.target.value)));
    onChange({ ...value, commercialRevShare: val });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-arche-gold/80">
          License Terms
        </h3>
        <p className="text-[10px] text-slate-400 leading-tight">
            Define how others can remix your work on Story Protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Non-Commercial Option */}
        <LicenseOption
          selected={value.type === "NON_COMMERCIAL"}
          onClick={() => handleTypeChange("NON_COMMERCIAL")}
          icon={Users}
          title="Social Remix"
          description="Free to remix for non-commercial use. Requires attribution."
          disabled={disabled}
        />

        {/* Commercial Option */}
        <LicenseOption
          selected={value.type === "COMMERCIAL"}
          onClick={() => handleTypeChange("COMMERCIAL")}
          icon={Coins}
          title="Commercial Remix"
          description="Monetize derivatives. Set minting fees and earn revenue share."
          disabled={disabled}
        />
      </div>

      {/* Commercial Settings Expansion */}
      <AnimatePresence initial={false}>
        {value.type === "COMMERCIAL" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-3 p-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-300 flex justify-between">
                    <span>Minting Fee ($IP)</span>
                    <span className="text-slate-500">Cost to remix</span>
                </label>
                <div className="relative">
                    <input
                      type="number"
                      value={value.mintingFee}
                      onChange={handleFeeChange}
                      disabled={disabled}
                      placeholder="0.0"
                      className="w-full bg-[#08101d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-arche-gold/50 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">IP</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-300 flex justify-between">
                    <span>Commercial Revenue Share (%)</span>
                    <span className="text-slate-500">Your cut</span>
                </label>
                 <div className="relative">
                    <input
                      type="number"
                      value={value.commercialRevShare}
                      onChange={handleRevShareChange}
                      disabled={disabled}
                      max={100}
                      min={0}
                      className="w-full bg-[#08101d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-arche-gold/50 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LicenseOption({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left p-3 rounded-xl border transition-all duration-200 group",
        selected
          ? "bg-arche-gold/10 border-arche-gold/50 shadow-[0_0_15px_rgba(248,232,176,0.1)]"
          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg transition-colors",
            selected ? "bg-arche-gold/20 text-arche-gold" : "bg-white/5 text-slate-400 group-hover:text-slate-200"
          )}
        >
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className={cn("text-sm font-medium", selected ? "text-arche-gold" : "text-slate-200")}>
              {title}
            </h4>
            {selected && <Check size={14} className="text-arche-gold" />}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
