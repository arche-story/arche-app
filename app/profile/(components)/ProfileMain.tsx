"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  Wallet,
  ShieldCheck,
  Edit2,
  Upload,
  Loader2,
  Clock,
  FileEdit,
  ExternalLink,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/app/profile/(hooks)/useProfile";

// --- Edit Profile Modal Component ---
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = DialogPrimitive.Overlay;
const DialogContent = DialogPrimitive.Content;

function EditProfileModal({ 
  open, 
  onOpenChange, 
  initialData, 
  onSave 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  initialData: any; 
  onSave: (data: any) => Promise<void>; 
}) {
  const [username, setUsername] = useState(initialData?.username || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUri || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(initialData?.username || "");
      setBio(initialData?.bio || "");
      setAvatarUrl(initialData?.avatarUri || "");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ username, bio, avatarUri: avatarUrl });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
          toast.error("Please upload an image file");
          return;
      }
      if (file.size > 5 * 1024 * 1024) { 
          toast.error("File size too large (max 5MB)");
          return;
      }

      const uploadToast = toast.loading("Uploading avatar to IPFS...");

      try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/ipfs/upload", {
              method: "POST",
              body: formData,
          });

          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Upload failed");
          }

          const data = await res.json();
          
          setAvatarUrl(data.ipfsUri); 
          toast.success("Avatar uploaded successfully!", { id: uploadToast });
      } catch (error: any) {
          console.error("Avatar upload error:", error);
          toast.error(`Upload failed: ${error.message}`, { id: uploadToast });
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogContent className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border border-white/10 bg-[#0b1628]/95 p-6 shadow-2xl sm:rounded-2xl backdrop-blur-xl ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-6">
            <DialogPrimitive.Title asChild>
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">Edit your username, bio, and avatar.</DialogPrimitive.Description>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full bg-white/5 overflow-hidden border border-white/10 group">
                 {avatarUrl ? (
                     <img src={avatarUrl.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/20">
                         <Upload className="w-6 h-6" />
                     </div>
                 )}
                 <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Edit2 className="w-6 h-6 text-white" />
                 </label>
              </div>
              <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Avatar Image</label>
                  <div className="flex items-center gap-2">
                    <input 
                        id="avatar-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <label 
                        htmlFor="avatar-upload"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/80 cursor-pointer transition-colors flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Choose File
                    </label>
                    <span className="text-xs text-white/30">Max 5MB</span>
                  </div>
              </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-arche-gold/50 focus:outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Bio</label>
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-arche-gold/50 focus:outline-none resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-arche-gold text-slate-900 hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                </button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function ProfileMain() {
  const { 
    account, 
    connectWallet, 
    profile, 
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
  } = useProfile();

  if (!account) {
      return (
        <div className="min-h-screen bg-arche-navy flex flex-col">
            <SiteHeader />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Wallet className="w-10 h-10 text-white/30" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-white/50 text-center max-w-md mb-8">
                    Connect your wallet to view your profile on Arche.
                </p>
                <button
                    onClick={connectWallet}
                    className="px-8 py-3 bg-arche-gold text-arche-navy dark:text-slate-900 font-bold rounded-full hover:bg-white hover:text-slate-900 transition-colors"
                >
                    Connect Wallet
                </button>
            </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-arche-navy flex flex-col selection:bg-arche-gold/30 selection:text-arche-gold">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-20">
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0F213E]/50 backdrop-blur-xl p-8 md:p-12">
           {/* Background Noise/Glow */}
           <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-arche-gold/5 rounded-full blur-[80px] pointer-events-none" />

           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              {/* Avatar */}
              <div className="relative shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-arche-gold to-purple-600 p-1 shadow-2xl shadow-arche-gold/10">
                    <div className="w-full h-full rounded-full bg-[#0b1628] flex items-center justify-center overflow-hidden relative">
                        {profile?.avatarUri ? (
                             <img 
                                src={profile.avatarUri.replace("ipfs://", "https://ipfs.io/ipfs/")} 
                                alt={profile.username || "User"} 
                                className="w-full h-full object-cover"
                             />
                        ) : (
                            <span className="text-4xl">👻</span>
                        )}
                    </div>
                  </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                  <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                          {profile?.username || "Unnamed Creator"}
                      </h1>
                      <p className="text-white/40 font-mono text-sm flex items-center justify-center md:justify-start gap-2">
                          <Wallet className="w-3 h-3" />
                          {account}
                      </p>
                  </div>

                  <p className="text-lg text-white/70 leading-relaxed max-w-xl mx-auto md:mx-0">
                      {profile?.bio || "No bio yet. Just a mysterious creator wandering the blockchain."}
                  </p>
                  
                  <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-arche-gold" />
                          Verified Creator
                      </div>
                  </div>
              </div>

              {/* Edit Action */}
              <button 
                onClick={() => setIsEditOpen(true)}
                className="absolute top-0 right-0 m-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Edit Profile"
              >
                  <Edit2 className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Favorites Section */}
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-6 text-center md:text-left">
                My Favorites
            </h2>
            {assetsLoading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-arche-gold/50 animate-pulse">
                <div className="w-8 h-8 border-2 border-arche-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-mono">Fetching your favorite creations...</p>
            </div>
            ) : items.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="mb-4 opacity-50">
                        <Heart className="w-12 h-12" />
                    </div>
                    <p className="text-sm">No favorite items found.</p>
                    <p className="text-xs mt-2 max-w-xs text-center leading-relaxed">
                        Favorite IPs from the Explore or Gallery pages will appear here.
                    </p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((asset) => (
                        <div
                        key={asset.id}
                        className="group relative flex flex-col bg-[#0F213E]/50 backdrop-blur border border-white/5 rounded-xl overflow-hidden hover:bg-[#0F213E] hover:border-white/10 transition-all h-full"
                        >
                        {/* Image Section */}
                        <div className="relative aspect-[4/5] w-full bg-[#0b1628]">
                                {asset.imageUri ? (
                                    <Image
                                    src={asset.imageUri.startsWith("ipfs") ? asset.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") : asset.imageUri}
                                    alt={asset.name || asset.prompt || "Asset"}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="text-white/40 text-xs font-mono">No Preview</p>
                                    </div>
                                )}
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1628] via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                                
                                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-1.5 text-arche-gold text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Registered IP
                                    </div>
                                    <h3 className="text-white text-base font-bold truncate mb-1 shadow-black drop-shadow-md">
                                        {asset.label || asset.name || "Untitled Asset"}
                                    </h3>
                                    <p className="text-white/60 text-xs line-clamp-1 mb-4 font-mono">
                                        {asset.id}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                        <Link
                                            href={`/studio/new?remix=${asset.id}`}
                                            className="flex items-center justify-center gap-2 w-full bg-white/10 backdrop-blur text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white hover:text-arche-navy transition-colors"
                                        >
                                            Remix
                                        </Link>
                                        <a
                                            href={`https://aeneid.storyscan.xyz/address/${asset.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-arche-gold text-arche-navy dark:text-slate-900 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white hover:text-slate-900 transition-colors"
                                        >
                                            Scan
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="flex items-center text-sm text-white/60 font-mono">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}
                </>
            )}
        </div>

      </main>

      <EditProfileModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen}
        initialData={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}