type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold text-slate-50">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm text-slate-100/70">{description}</p>
      ) : null}
    </div>
  );
}
