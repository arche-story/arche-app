type GalleryItem = {
  id: string;
  title: string;
  date: string;
  storyId: string;
};

type GalleryGridProps = {
  items: readonly GalleryItem[];
};

export function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="group rounded-2xl border border-white/5 bg-[#0F213E] p-4 transition hover:border-yellow-200/50"
        >
          <div className="aspect-4/3 rounded-xl bg-[#0F213E] shadow-inner" />
          <h2 className="mt-4 text-sm font-medium text-slate-50">
            {item.title}
          </h2>
          <p className="text-xs text-slate-100/40">{item.date}</p>
          <p className="mt-2 text-[10px] text-slate-100/40">
            Story ID: {item.storyId}
          </p>
          <button className="mt-3 text-xs text-yellow-200/90 transition group-hover:text-yellow-100">
            View on Story →
          </button>
        </article>
      ))}
    </div>
  );
}
