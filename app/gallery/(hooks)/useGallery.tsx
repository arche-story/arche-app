"use client";

import { useState, useEffect } from "react";

export interface GalleryItem {
  id: string;
  title: string;
  imageUri: string;
  createdAt: string;
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        // We can reuse the explore endpoint which returns all assets if no query
        // Ideally, we should have a paginated /api/graph/gallery endpoint
        const res = await fetch("/api/graph/explore");
        const data = await res.json();
        
        const assets = data.nodes || data.assets || [];
        
        const formatted = assets.map((item: any) => ({
            id: item.id,
            title: item.prompt || item.name || "Untitled",
            imageUri: item.imageUri,
            createdAt: item.createdAt
        }));

        setItems(formatted);
      } catch (e) {
        console.error("Failed to fetch gallery", e);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  return { items, loading };
}
