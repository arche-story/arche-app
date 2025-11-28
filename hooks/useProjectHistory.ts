import { useState, useEffect, useCallback } from "react";

export interface Version {
  id: string;
  label: string;
  timestamp: string;
  type: "GENESIS" | "DRAFT" | "REMIX";
  status?: string;
  prompt?: string;
  imageUri?: string;
}

export function useProjectHistory(userAddress?: string, contextId?: string | null) {
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

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      
      if (data.versions) {
        const formatted = data.versions.map((v: any) => ({
          id: v.id,
          label: v.name || v.label || "Untitled",
          timestamp: new Date(v.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type: v.type || (v.status === 'DRAFT' ? 'DRAFT' : 'GENESIS'),
          status: v.status,
          prompt: v.prompt,
          imageUri: v.imageUri
        }));
        setHistory(formatted);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  }, [userAddress, contextId]);

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

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, saveDraft, fetchHistory, loading };
}
