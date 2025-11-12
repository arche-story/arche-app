"use client";

type PromptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
};

export function PromptEditor({
  value,
  onChange,
  onGenerate,
}: PromptEditorProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0F213E] p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/80">
          Studio
        </p>
        <h1 className="text-2xl font-semibold text-slate-50">Arche Studio</h1>
        <p className="text-sm text-slate-100/70">
          Paint your idea. Save the stroke. Sign it on-chain.
        </p>
      </header>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Describe your idea in detail — style, subject, emotion..."
        className="h-56 w-full rounded-xl border border-white/5 bg-[#0f1f38] p-4 text-sm text-slate-50 outline-none transition focus:border-yellow-200/80"
      />
      <button
        onClick={onGenerate}
        className="rounded-full bg-yellow-300 px-6 py-2 text-sm font-medium text-slate-900 transition hover:bg-yellow-200"
      >
        Paint it
      </button>
    </section>
  );
}
