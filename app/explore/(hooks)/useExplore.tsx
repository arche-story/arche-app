"use client";

import { useState, useEffect, useCallback } from "react";
import { GraphData } from "@/types";

export function useExplore() {
  const [query, setQuery] = useState("");
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"GRID" | "GRAPH">("GRAPH");

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graph/explore?q=${query}`);
      const data = await res.json();
      // The API now returns { nodes: [], links: [] }
      if (data.nodes) {
        setGraphData(data);
      } else if (data.assets) {
        // Fallback for older API response structure if mixed
        setGraphData({ nodes: data.assets, links: [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

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
    graphData,
    loading,
    viewMode,
    setViewMode,
    resolveImageUri
  };
}
