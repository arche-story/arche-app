"use client";

import { useState, useEffect, useCallback } from "react";
import { GraphData } from "@/types";
import { useWallet } from "@/components/wrapper/WalletProvider";

export type FilterType = "ALL" | "GENESIS" | "REMIX" | "MINE";
export type SortType = "NEWEST" | "OLDEST" | "POPULAR";

export function useExplore() {
  const { account } = useWallet();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("NEWEST");
  
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"GRID" | "GRAPH">("GRAPH");

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("filter", filter);
      params.set("sort", sort);
      if (account) params.set("owner", account);

      const res = await fetch(`/api/graph/explore?${params.toString()}`);
      const data = await res.json();
      
      if (data.nodes) {
        setGraphData(data);
      } else if (data.assets) {
        setGraphData({ nodes: data.assets, links: [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, filter, sort, account]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAssets]); 

  // Helper function to resolve IPFS URIs
  const resolveImageUri = (uri: string) => {
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return uri;
  };

  return {
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
    graphData,
    loading,
    viewMode,
    setViewMode,
    resolveImageUri
  };
}
