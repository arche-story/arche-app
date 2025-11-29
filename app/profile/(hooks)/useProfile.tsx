"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useWallet } from "@/components/wrapper/WalletProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { IPAsset, MarketplaceListing } from "@/types";
import { graphService, marketplaceService } from "@/services/apiService";

export function useProfile() {
  const { account, connectWallet } = useWallet();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile(account || undefined);

  const [activeTab, setActiveTab] = useState<"DRAFTS" | "COLLECTION" | "FAVORITES" | "MY_LISTINGS">("FAVORITES");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Reset page on tab change
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // SWR key based on account, tab, and page
  const swrKey = account
    ? [
        activeTab,
        account,
        page,
        activeTab === "MY_LISTINGS" ? "listings" : "assets"
      ].join('-')
    : null;

  // Fetch data based on active tab
  const { data: items = [], error, isLoading, mutate } = useSWR(
    swrKey,
    async () => {
      if (!account) return [];

      try {
        if (activeTab === 'MY_LISTINGS') {
          // Fetch user's listings from marketplace
          const listings = await marketplaceService.getUserListings(account);

          // Transform listings to IPAsset format
          return listings.map((listing: MarketplaceListing) => ({
            id: listing.asset.id,
            imageUri: listing.asset.imageUri || "",
            prompt: listing.asset.prompt || "",
            name: listing.asset.name,
            title: listing.asset.title,
            label: listing.asset.title || listing.asset.name || "Untitled Asset",
            createdAt: listing.createdAt,
            status: listing.status,
            price: parseFloat(listing.price),
          }));
        } else {
          let status: 'DRAFT' | 'REGISTERED' | 'FAVORITES' | undefined;
          if (activeTab === 'DRAFTS') status = 'DRAFT';
          if (activeTab === 'FAVORITES') status = 'FAVORITES';

          // Fetch user's assets
          const response = await graphService.getUserAssets(account, status, page, 9);
          return response.items || [];
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Determine total pages (this may need to come from the API response)
  const totalPages = 1; // Placeholder - would need proper pagination data

  const handleSaveProfile = async (data: { username?: string; bio?: string; avatarUri?: string }) => {
    if (!account) return;

    try {
      await updateProfile({ ...data, address: account });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return {
    account,
    connectWallet,
    profile,
    profileLoading,
    assetsLoading: isLoading,
    activeTab,
    setActiveTab,
    items: items as IPAsset[],
    isEditOpen,
    setIsEditOpen,
    handleSaveProfile,
    page,
    setPage,
    totalPages,
    mutate,
    error
  };
}