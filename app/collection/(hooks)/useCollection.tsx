"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/components/wrapper/WalletProvider";
import { useProjectHistory } from "@/hooks/useProjectHistory"; // Keep for deleteDraft logic only if needed, or move delete logic here

interface CollectionItem {
  id: string;
  status: string;
  createdAt: string;
  prompt: string;
  imageUri: string;
  label: string;
  isFavorited?: boolean;
}

export function useCollection() {
  const { account, connectWallet } = useWallet();
  
  // We still need deleteDraft from the old hook, or reimplement it.
  // Reimplementing fetch logic here for pagination support.
  const { deleteDraft } = useProjectHistory(account || undefined);

  const [activeTab, setActiveTab] = useState<"verified" | "drafts">("verified");
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
        const status = activeTab === "verified" ? "REGISTERED" : "DRAFT";
        const res = await fetch(
            `/api/graph/user-assets?userAddress=${account}&status=${status}&page=${page}&limit=8`
        );
        const data = await res.json();
        
        if (data.items) {
            setItems(data.items);
            setTotalPages(data.totalPages || 1);
        }
    } catch (e) {
        console.error("Failed to fetch collection", e);
    } finally {
        setLoading(false);
    }
  }, [account, activeTab, page]);

  // Refetch when tab or page changes
  useEffect(() => {
      fetchCollection();
  }, [fetchCollection]);

  // Reset page to 1 when tab changes
  useEffect(() => {
      setPage(1);
  }, [activeTab]);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeletingId(itemToDelete);
    if (deleteDraft) {
        const success = await deleteDraft(itemToDelete);
        if (success) {
            // Refresh list after delete
            fetchCollection();
        }
    }
    
    setDeletingId(null);
    setItemToDelete(null);
  };

  const toggleFavorite = async (ipId: string) => {
      if (!account) return;
      
      // Optimistic update
      setItems(prev => prev.map(item => 
          item.id === ipId ? { ...item, isFavorited: !item.isFavorited } : item
      ));

      try {
          await fetch('/api/graph/favorite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userAddress: account, ipId })
          });
          // Ideally we check response.success but for optimism we assume success or revert on error
      } catch (e) {
          console.error("Favorite failed", e);
          // Revert
          setItems(prev => prev.map(item => 
            item.id === ipId ? { ...item, isFavorited: !item.isFavorited } : item
        ));
      }
  };

  return {
    account,
    connectWallet,
    loading,
    activeTab,
    setActiveTab,
    items, // Used to be filteredItems
    page,
    setPage,
    totalPages,
    deletingId,
    itemToDelete,
    setItemToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    toggleFavorite
  };
}