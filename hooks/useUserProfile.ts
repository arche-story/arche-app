import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  address: string;
  username?: string;
  bio?: string;
  avatarUri?: string;
  createdAt?: string;
}

export function useUserProfile(address?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/profile?address=${address}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      } else {
        // If user doesn't exist in DB yet, we might just return null or create it on the fly
        setProfile(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!address) return false;
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, address })
      });
      
      if (!res.ok) throw new Error("Failed to update profile");
      
      // Optimistic update
      setProfile(prev => prev ? { ...prev, ...data } : { address, ...data });
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, fetchProfile };
}
