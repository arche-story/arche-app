"use client";

import { SiteHeader } from "@/components/site-header";
import {
  Search,
  Sparkles,
  GitFork,
  Copy,
  LayoutGrid,
  Network,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { ProvenanceGraph } from "@/app/explore/(components)/ProvenanceGraph";
import Image from "next/image";
import Link from "next/link";
import { useExplore } from "@/app/explore/(hooks)/useExplore";

export function ExploreMain() {
  const { 
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
  } = useExplore();

  return (
    <div className="h-screen bg-arche-navy flex flex-col overflow-hidden selection:bg-arche-gold/30 selection:text-arche-gold">
      <SiteHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-6 pb-6 flex flex-col min-h-0">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6 shrink-0">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Explore the <span className="text-arche-gold">Constellation</span>
            </h1>
            <p className="text-white/60 text-sm max-w-md">
              Discover registered IP Assets. Trace their lineage. Remix the best
              ideas.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/30" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-arche-gold/50 transition-colors"
              />
            </div>

            {/* Filters & Sort */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-32">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Filter className="h-3.5 w-3.5 text-white/50" />
                 </div>
                 <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-8 text-sm text-white focus:outline-none focus:border-arche-gold/50 transition-colors cursor-pointer"
                 >
                    <option value="ALL">All Assets</option>
                    <option value="GENESIS">Genesis</option>
                    <option value="REMIX">Remix</option>
                    <option value="MINE">My Assets</option>
                 </select>
                 <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white/50"></div>
                 </div>
              </div>

              <div className="relative flex-1 md:w-32">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <ArrowUpDown className="h-3.5 w-3.5 text-white/50" />
                 </div>
                 <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-8 text-sm text-white focus:outline-none focus:border-arche-gold/50 transition-colors cursor-pointer"
                 >
                    <option value="NEWEST">Newest</option>
                    <option value="OLDEST">Oldest</option>
                    <option value="POPULAR">Popular</option>
                 </select>
                 <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white/50"></div>
                 </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex items-center gap-1 shrink-0">
              <button
                onClick={() => setViewMode("GRAPH")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "GRAPH"
                    ? "bg-white/10 text-arche-gold shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
                title="Graph View"
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "GRID"
                    ? "bg-white/10 text-arche-gold shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-white/5 bg-[#0b1628]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 animate-pulse">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-arche-gold/20 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-arche-gold/40 animate-spin border-t-transparent"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-arche-gold" />
                </div>
                <p className="text-white/40 text-sm font-mono tracking-wider uppercase">
                  Scanning Constellation...
                </p>
              </div>
            </div>
          ) : viewMode === "GRAPH" ? (
            /* GRAPH VIEW */
            <ProvenanceGraph data={graphData} />
          ) : (
            /* GRID VIEW */
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {graphData.nodes.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/5 hover:border-arche-gold/30 transition-all duration-300"
                  >
                    {/* Image */}
                    {asset.imageUri ? (
                      <Image
                        src={resolveImageUri(asset.imageUri)}
                        alt={asset.prompt || "Asset"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F213E] to-black p-6">
                        <p className="text-xs text-white/30 text-center italic line-clamp-4 font-mono">
                          {asset.prompt}
                        </p>
                      </div>
                    )}

                                      {/* Overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1628]/90 via-[#0b1628]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2 flex flex-col justify-end">
                                            <h3 className="text-white font-bold text-sm mb-1 drop-shadow-md line-clamp-1">
                                                {asset.title || "Untitled Asset"}
                                            </h3>
                                            <p className="text-white/70 text-xs font-medium mb-1 drop-shadow-md line-clamp-3">
                                                {asset.prompt}
                                            </p>
                                        </div>
                    
                                        <div className="flex gap-2 shrink-0">                        <Link
                          href={`/studio/new?remix=${asset.id}`}
                          className="flex-1 bg-arche-gold text-arche-navy dark:text-slate-900 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white hover:text-slate-900 transition-colors uppercase tracking-wider"
                        >
                          <GitFork className="w-3.5 h-3.5" />
                          Remix
                        </Link>
                        <button
                          onClick={() => navigator.clipboard.writeText(asset.id)}
                          className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
                          title="Copy IP ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white/70 text-[10px] px-2 py-1 rounded-full border border-white/10 font-mono">
                      {asset.type === "REMIX" ? "Remix" : "Genesis"}
                    </div>
                  </div>
                ))}
                {graphData.nodes.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/40 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">
                      No assets found matching your query.
                    </p>
                    <p className="text-xs text-center mt-2 max-w-xs leading-relaxed">
                      Try adjusting your search or check back later for new
                      creations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
