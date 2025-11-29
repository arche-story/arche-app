"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Loader2, ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/explore");
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-arche-navy flex flex-col selection:bg-arche-gold/30 selection:text-arche-gold">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Marketplace</h1>
            <p className="text-white/60 text-sm max-w-lg">
              Buy and sell IP Licenses instantly. The Nasdaq for Intellectual Property.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-arche-gold/10 border border-arche-gold/30 rounded-full text-arche-gold text-sm font-medium">
            <ShoppingBag className="w-4 h-4" />
            <span>{listings.length} Items Listed</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-arche-gold" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <ShoppingBag className="w-12 h-12 text-white/30 opacity-50 mb-4" />
            <p className="text-white/40">No items listed yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.listingId}
                listing={listing}
                onBuySuccess={fetchListings}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
