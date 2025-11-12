type TimelineItem = {
  id: string;
  title: string;
  date: string;
  status: "draft" | "registered";
};

type TimelineListProps = {
  items: readonly TimelineItem[];
};

export function TimelineList({ items }: TimelineListProps) {
  return (
    <div className="mt-8 flex gap-6 overflow-x-auto pb-4">
      {items.map((item, index) => (
        <article
          key={item.id}
          className="relative min-w-[220px] rounded-2xl border border-white/5 bg-[#0F213E] p-4"
        >
          <p className="text-xs text-slate-100/50">Version {index + 1}</p>
          <h2 className="mt-1 text-base font-medium text-slate-50">
            {item.title}
          </h2>
          <p className="mt-2 text-xs text-slate-100/40">{item.date}</p>
          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] ${
              item.status === "registered"
                ? "bg-emerald-400/10 text-emerald-200"
                : "bg-slate-100/5 text-slate-100/70"
            }`}
          >
            {item.status === "registered" ? "Registered on Story" : "Draft"}
          </span>
        </article>
      ))}
    </div>
  );
}
