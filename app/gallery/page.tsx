import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { GalleryGrid } from "@/app/gallery/(components)/gallery-grid";

const REGISTERED = [
  {
    id: "ip_01",
    title: "Midnight Swirl",
    date: "Nov 10, 2025",
    storyId: "0xabc123",
  },
  {
    id: "ip_02",
    title: "Sunlit Orchard",
    date: "Nov 10, 2025",
    storyId: "0xdef456",
  },
] as const;

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <SectionTitle
          eyebrow="Archive"
          title="My Arche"
          description="All pieces you have signed on Story Protocol."
        />
        <GalleryGrid items={REGISTERED} />
      </main>
    </>
  );
}
