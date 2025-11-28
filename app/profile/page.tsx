"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { useWallet } from "@/components/wrapper/WalletProvider";
import {
  Wallet,
  FileEdit,
  ShieldCheck,
  ExternalLink,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  imageUri: string;
  prompt: string;
  createdAt: string;
  txHash?: string;
  name?: string;
};

export default function ProfilePage() {
  const { account, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<"DRAFTS" | "COLLECTION">("COLLECTION");
  const [drafts, setDrafts] = useState<Asset[]>([]);
  const [collection, setCollection] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!account) return;
      
      setLoading(true);
      try {
        const res = await fetch(
          `/api/graph/user-assets?userAddress=${account}`
        );
        const data = await res.json();
        if (data.drafts) setDrafts(data.drafts);
        if (data.registered) setCollection(data.registered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    if (account) {
        fetchData();
    }
  }, [account]);

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
                    Connect your wallet to view your registered IP assets and draft history on Arche.
                </p>
                <button 
                    onClick={connectWallet}
                    className="px-8 py-3 bg-arche-gold text-arche-navy font-bold rounded-full hover:bg-white transition-colors"
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-10 pb-20">
        {/* Header / Identity */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-arche-gold to-purple-600 p-1 shadow-[0_0_30px_rgba(248,232,176,0.2)]">
            <div className="w-full h-full rounded-full bg-[#0b1628] flex items-center justify-center overflow-hidden relative">
                {/* Placeholder Avatar or Blockie could go here */}
                <Wallet className="w-8 h-8 text-white/50" />
            </div>
          </div>
          <div className="text-center md:text-left space-y-2 flex-1">
            <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "..."}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-arche-gold/10 border border-arche-gold/20 text-arche-gold">
                <ShieldCheck className="w-4 h-4" />
                {collection.length} Registered IP
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <FileEdit className="w-4 h-4 text-white/40" />
                {drafts.length} Drafts
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab("COLLECTION")}
            className={cn(
              "px-6 py-3 text-sm font-bold tracking-wide uppercase transition-colors relative",
              activeTab === "COLLECTION"
                ? "text-arche-gold"
                : "text-white/40 hover:text-white/70"
            )}
          >
            Verified Collection
            {activeTab === "COLLECTION" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-arche-gold shadow-[0_0_10px_rgba(248,232,176,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("DRAFTS")}
            className={cn(
              "px-6 py-3 text-sm font-bold tracking-wide uppercase transition-colors relative",
              activeTab === "DRAFTS"
                ? "text-arche-gold"
                : "text-white/40 hover:text-white/70"
            )}
          >
            My Drafts
            {activeTab === "DRAFTS" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-arche-gold shadow-[0_0_10px_rgba(248,232,176,0.5)]" />
            )}
          </button>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-arche-gold/50 animate-pulse">
            <div className="w-8 h-8 border-2 border-arche-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono">Fetching Provenance Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "DRAFTS" &&
              drafts.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-[#0F213E]/50 backdrop-blur border border-white/5 rounded-xl p-5 hover:bg-[#0F213E] hover:border-white/10 transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/10 text-white/50 text-[10px] px-2 py-1 rounded uppercase tracking-wide font-bold">
                      Draft
                    </div>
                    <span className="text-[10px] text-white/30 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {asset.prompt || "Untitled Draft"}
                  </p>
                  <Link
                    href={`/studio/${asset.id}`}
                    className="block w-full text-center bg-white/5 text-slate-300 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-arche-gold hover:text-arche-navy transition-all"
                  >
                    Resume Editing
                  </Link>
                </div>
              ))}

            {activeTab === "COLLECTION" &&
              collection.map((asset) => (
                <div
                  key={asset.id}
                  className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/10 group bg-[#0b1628]"
                >
                  {asset.imageUri && (asset.imageUri.startsWith("http") || asset.imageUri.startsWith("ipfs")) ? (
                    <Image
                      // Quick fix for IPFS URIs if needed, currently handling HTTP placeholders
                      src={asset.imageUri.startsWith("ipfs") ? asset.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") : asset.imageUri}
                      alt={asset.name || asset.prompt || "Asset"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0F213E] to-black p-6 flex items-center justify-center">
                      <p className="text-white/40 text-xs text-center font-mono">
                        {asset.name || asset.prompt}
                      </p>
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
                      {asset.name || "Arche Asset"}
                    </h3>
                    <p className="text-white/60 text-xs line-clamp-1 mb-4">
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
                      className="flex items-center justify-center gap-2 w-full bg-arche-gold text-arche-navy py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      View on StoryScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === "DRAFTS" && drafts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <FileEdit className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm">No drafts found.</p>
                <Link href="/studio" className="mt-4 text-arche-gold text-xs font-bold uppercase tracking-widest hover:underline">
                    Start Creating
                </Link>
              </div>
            )}
            {activeTab === "COLLECTION" && collection.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm">No registered IP assets found.</p>
                <p className="text-xs mt-2 max-w-xs text-center leading-relaxed">
                    Your registered Intellectual Property on Story Protocol will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}