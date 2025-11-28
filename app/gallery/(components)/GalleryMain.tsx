"use client";

import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { GalleryGrid } from "@/app/gallery/(components)/gallery-grid"; // We can reuse the existing grid component if it's generic enough
import { useGallery } from "@/app/gallery/(hooks)/useGallery";
import { Loader2 } from "lucide-react";

export function GalleryMain() {
  const { items, loading } = useGallery();

  return (
    <div className="min-h-screen bg-arche-navy flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 pt-8 pb-10">
        <SectionTitle
          eyebrow="Archive"
          title="The Arche Gallery"
          description="A curated stream of all creativity registered on the protocol."
        />
        
        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-arche-gold animate-spin" />
            </div>
        ) : (
            <div className="mt-8">
                {/* We need to adapt the items to match GalleryGrid props or update GalleryGrid */}
                {/* For now, let's assume GalleryGrid expects {id, title, date, storyId} based on previous page content */}
                {/* But wait, the previous page had hardcoded types. Let's check gallery-grid.tsx content first if we want to be precise. */}
                {/* Since I can't see gallery-grid content in this turn, I'll render a simple grid here directly to be safe and clean */}
                
                {items.length === 0 ? (
                    <div className="text-center py-20 text-white/40 border border-dashed border-white/10 rounded-xl">
                        No artworks found in the gallery yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-900">
                                {item.imageUri ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={item.imageUri.startsWith("ipfs") ? item.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") : item.imageUri}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/20">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
                                    <h3 className="text-lg font-bold text-white line-clamp-2">{item.title}</h3>
                                    <p className="text-xs text-white/60 font-mono mt-1">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}
