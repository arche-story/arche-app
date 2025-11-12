"use client";

type AIOutputPanelProps = {
  output: string | null;
  onSave: () => void;
  onRegister: () => void;
};

export function AIOutputPanel({
  output,
  onSave,
  onRegister,
}: AIOutputPanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0F213E] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-100/60">
            Current draft
          </p>
          <h2 className="text-base font-medium text-slate-50">
            Generated preview
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-50 transition hover:bg-white/10"
          >
            Save stroke
          </button>
          <button
            onClick={onRegister}
            className="rounded-full bg-yellow-300/90 px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-yellow-200"
          >
            Sign on Story
          </button>
        </div>
      </div>
      <div className="min-h-[320px] rounded-xl border border-white/5 bg-[#0b1a2d] p-4">
        {output ? (
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
