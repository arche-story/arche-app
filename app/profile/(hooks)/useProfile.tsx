"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/components/wrapper/WalletProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";

type Asset = {
  id: string;
  imageUri: string;
  prompt: string;
  createdAt: string;
  txHash?: string;
  name?: string;
  title?: string; // Added title
  label?: string;
  status: string;
  price?: number; // Added price for listings
};

export function useProfile() {
  const { account, connectWallet } = useWallet();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile(account || undefined);

  const [activeTab, setActiveTab] = useState<"DRAFTS" | "COLLECTION" | "FAVORITES" | "MY_LISTINGS">("FAVORITES");
  const [items, setItems] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAssets = useCallback(async () => {
    if (!account) return;

    setAssetsLoading(true);
    try {
      if (activeTab === 'MY_LISTINGS') {
        // Fetch user's listings from marketplace
        const res = await fetch(`/api/marketplace/my-listings?userAddress=${account}`);
        const data = await res.json();

        if (data.listings) {
          // Transform listings to asset format
          const transformedItems = data.listings.map((listing: any) => ({
            id: listing.asset.id,
            imageUri: listing.asset.imageUri,
            prompt: listing.asset.prompt,
            name: listing.asset.name,
            title: listing.asset.title,
            label: listing.asset.title || listing.asset.name || "Untitled Asset",
            createdAt: listing.createdAt,
            status: listing.status,
            price: listing.price,  // Include price from listing
          }));
          setItems(transformedItems);
          // For listings, we don't have pagination from the API yet, so set totalPages to 1
          setTotalPages(1);
        } else {
          setItems([]);
          setTotalPages(1);
        }
      } else {
        let status = 'REGISTERED';
        if (activeTab === 'DRAFTS') status = 'DRAFT';
        if (activeTab === 'FAVORITES') status = 'FAVORITES';

        const res = await fetch(
          `/api/graph/user-assets?userAddress=${account}&status=${status}&page=${page}&limit=9`
        );
        const data = await res.json();

        if (data.items) {
            setItems(data.items);
            setTotalPages(data.totalPages || 1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssetsLoading(false);
    }
  }, [account, activeTab, page]);

  useEffect(() => {
    if (account) {
        fetchAssets();
    }
  }, [fetchAssets, account]);

  // Reset page on tab change
  useEffect(() => {
      setPage(1);
  }, [activeTab]);

  const handleSaveProfile = async (data: any) => {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
  };

  return {
    account,
    connectWallet,
    profile,
    profileLoading,
    assetsLoading,
    activeTab,
    setActiveTab,
    items,
    isEditOpen,
    setIsEditOpen,
    handleSaveProfile,
    page,
    setPage,
    totalPages
  };
}