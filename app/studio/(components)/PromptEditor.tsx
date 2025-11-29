"use client";

type PromptEditorProps = {
  title: string;
  onTitleChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean; 
};

export function PromptEditor({
  title,
  onTitleChange,
  value,
  onChange,
  onGenerate,
  isGenerating,
}: PromptEditorProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0F213E]/50 backdrop-blur p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-arche-gold/80">
          Studio
        </p>
        <h1 className="text-2xl font-semibold text-slate-50">Arche Studio</h1>
        <p className="text-sm text-slate-100/70">
          Paint your idea. Save the stroke. Sign it on-chain.
        </p>
      </header>
      
      <div className="space-y-1">
        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold ml-1">Asset Name</label>
        <input 
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Give your asset a name (e.g. Cyber Samurai)"
            disabled={isGenerating}
            className="w-full rounded-xl border border-white/10 bg-[#08101d] px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-arche-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold ml-1">Prompt</label>
        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Describe your idea in detail — style, subject, emotion..."
            disabled={isGenerating} // Disable textarea when generating
            className="h-48 w-full rounded-xl border border-white/10 bg-[#08101d] p-4 text-sm text-slate-50 outline-none transition focus:border-arche-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating} // Disable button when generating
        className="rounded-full bg-arche-gold px-6 py-2 text-sm font-medium text-arche-navy dark:text-slate-900 transition hover:bg-yellow-200 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Painting..." : "Paint it"}
      </button>
    </section>
  );
}
