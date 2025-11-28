import { useState, useEffect, useCallback } from "react";

export interface Version {
  id: string;
  label: string;
  timestamp: string;
  type: "GENESIS" | "DRAFT" | "REMIX";
  status?: string;
  prompt?: string;
  imageUri?: string;
  name?: string; // Add name property
}

export function useProjectHistory(userAddress?: string, contextId?: string | null, limit?: number) {
  const [history, setHistory] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userAddress) return;
    
    // If explicitly new (contextId === 'new'), don't fetch any history initially
    // unless it's a Remix (not handled here yet, Remix lineage fetching would be ideal)
    if (contextId === 'new') {
        setHistory([]);
        return;
    }

    try {
      let url = `/api/graph/get-history?userAddress=${userAddress}`;
      if (contextId) {
          url += `&contextId=${contextId}`;
      }
      if (limit) {
          url += `&limit=${limit}`;
      }

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      
      if (data.versions) {
        const formatted = data.versions.map((v: any) => {
          const displayLabel = (v.name && v.name !== "Untitled Asset") ? v.name : (v.prompt || "Untitled Draft");
          return {
            id: v.id,
            label: displayLabel,
            timestamp: new Date(v.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            type: v.type || (v.status === 'DRAFT' ? 'DRAFT' : 'GENESIS'),
            status: v.status,
            prompt: v.prompt,
            imageUri: v.imageUri,
            name: v.name // Include name in the formatted object
          };
        });
        setHistory(formatted);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  }, [userAddress, contextId, limit]);

  const saveDraft = async (prompt: string, parentIpId?: string, versionOfId?: string, imageUrl?: string) => {
      if (!userAddress) return;
      setLoading(true);
      try {
        const res = await fetch('/api/graph/save-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                userAddress,
                parentIpId,
                versionOfId,
                imageUri: imageUrl 
            })
        });
        const data = await res.json();
        
        // After saving, we might want to re-fetch history contextually if we now have an ID
        // But the component will likely switch ID, triggering fetchHistory automatically.
        // We still call fetchHistory here to be safe or for immediate updates if ID didn't change.
        await fetchHistory(); 
        
        return data.draftId;
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const deleteDraft = async (draftId: string) => {
    if (!userAddress) return;
    try {
      const res = await fetch(`/api/studio/draft?id=${draftId}&userAddress=${userAddress}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete draft");
      
      // Update local state immediately
      setHistory(prev => prev.filter(item => item.id !== draftId));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, saveDraft, deleteDraft, fetchHistory, loading };
}
