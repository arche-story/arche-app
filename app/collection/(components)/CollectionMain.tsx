"use client";

import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import { Trash2, Loader2, Edit, ExternalLink, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useCollection } from "@/app/collection/(hooks)/useCollection";

export function CollectionMain() {
  const router = useRouter();
  const {
    account,
    connectWallet,
    loading,
    activeTab,
    setActiveTab,
    items,
    page,
    setPage,
    totalPages,
    deletingId,
    itemToDelete,
    setItemToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    toggleFavorite
  } = useCollection();

  if (!account) {
    return (
      <div className="min-h-screen bg-arche-navy flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Connect Your Wallet</h1>
          <p className="text-white/60 max-w-md">
            Please connect your wallet to view your collection and manage your creative assets.
          </p>
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-arche-gold text-slate-900 rounded-full font-bold hover:bg-white transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arche-navy flex flex-col">
      <SiteHeader />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Draft?"
        description="Are you sure you want to delete this draft? This action cannot be undone and the artwork will be lost forever."
        actionLabel="Delete Draft"
        variant="danger"
        isLoading={!!deletingId}
        onAction={handleConfirmDelete}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 space-y-10">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Collection</h1>
            <p className="text-white/60">Manage your registered IPs and ongoing drafts.</p>
          </div>
          
          {/* Tabs */}
          <div className="flex p-1 bg-white/5 rounded-full self-start md:self-auto border border-white/10">
            <button
              onClick={() => setActiveTab("verified")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === "verified"
                  ? "bg-arche-gold text-slate-900 shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              Verified Assets
            </button>
            <button
              onClick={() => setActiveTab("drafts")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === "drafts"
                  ? "bg-arche-gold text-slate-900 shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-arche-gold animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <div className="text-6xl mb-4 opacity-20">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
            <p className="text-white/40 max-w-md mx-auto">
              {activeTab === "verified" 
                ? "You haven't registered any IP assets yet. Go to the Studio to create and register your work."
                : "You don't have any saved drafts. Start a new project in the Studio."}
            </p>
            <button 
                onClick={() => router.push('/studio/new')}
                className="mt-6 px-6 py-2 border border-white/20 rounded-full text-white/80 hover:bg-white/10 transition-colors text-sm"
            >
                Go to Studio
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative bg-[#0F213E] border border-white/5 rounded-xl overflow-hidden hover:border-arche-gold/30 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                    {/* Image Area */}
                    <div className="relative aspect-square bg-black/40 overflow-hidden">
                        {item.imageUri ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={item.imageUri.startsWith("ipfs") ? item.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") : item.imageUri}
                            alt={item.label}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                            <span className="text-white/20 text-xs">No Preview</span>
                        </div>
                        )}
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                            {activeTab === "verified" ? (
                                <>
                                    <button 
                                        onClick={() => router.push(`/gallery?id=${item.id}`)}
                                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                                        title="View in Gallery"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => toggleFavorite(item.id)}
                                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                                        title={item.isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                        <Heart className={cn("w-5 h-5 transition-colors", item.isFavorited ? "fill-red-500 text-red-500" : "text-white")} />
                                    </button>
                                    <button 
                                        onClick={() => router.push(`/studio/new?remix=${item.id}`)}
                                        className="px-4 py-2 rounded-full bg-arche-gold text-slate-900 font-bold text-sm hover:bg-white transition-colors"
                                    >
                                        Remix
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => router.push(`/studio/${item.id}`)}
                                        className="px-4 py-2 rounded-full bg-arche-gold text-slate-900 font-bold text-sm hover:bg-white transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(item.id)}
                                        disabled={deletingId === item.id}
                                        className="p-3 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white backdrop-blur-sm transition-colors disabled:opacity-50"
                                        title="Delete Draft"
                                    >
                                        {deletingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between bg-[#0F213E] group-hover:bg-[#132745] transition-colors">
                        <div>
                            <h3 className="font-semibold text-white truncate text-sm mb-1" title={item.label}>{item.label || "Untitled"}</h3>
                            {item.prompt && item.label !== item.prompt && (
                                <p className="text-xs text-white/40 line-clamp-2 mb-2">{item.prompt}</p>
                            )}
                            <p className="text-[10px] text-white/30 font-mono">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        {activeTab === "verified" && (
                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] uppercase tracking-wider text-arche-gold/80">On-Chain</span>
                                <span className="text-[10px] text-white/30 font-mono">{item.id.slice(0,6)}...{item.id.slice(-4)}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="flex items-center text-sm text-white/60 font-mono">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}