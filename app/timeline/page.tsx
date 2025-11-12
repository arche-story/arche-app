import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { TimelineList } from "@/app/timeline/(components)/timeline-list";

const MOCK = [
  { id: "v1", title: "First draft", date: "Nov 10, 2025", status: "draft" },
  { id: "v2", title: "Color variation", date: "Nov 10, 2025", status: "draft" },
  {
    id: "v3",
    title: "Final piece",
    date: "Nov 10, 2025",
    status: "registered",
  },
] as const;

export default function TimelinePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <SectionTitle
          eyebrow="Journey"
          title="Your Creative Journey"
          description="Every version you saved in Arche appears here."
        />
        <TimelineList items={MOCK} />
      </main>
    </>
  );
}
