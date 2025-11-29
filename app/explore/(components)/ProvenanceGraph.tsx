"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AssetDrawer } from "./AssetDrawer";
import { GraphData, GraphNode } from "@/types";
import type { ForceGraphMethods } from "react-force-graph-2d";

// Dynamically import ForceGraph2D to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/30 animate-pulse">
      Loading Graph Engine...
    </div>
  ),
});

interface ProvenanceGraphProps {
  data: GraphData;
}

export function ProvenanceGraph({ data }: ProvenanceGraphProps) {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 600,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer to make graph responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Load images for nodes
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const newImages: Record<string, HTMLImageElement> = {};
    data.nodes.forEach((node) => {
      if (node.imageUri && !images[node.id]) {
        const img = new Image();
        // Resolve IPFS URI to Gateway URL
        const src = node.imageUri.startsWith("ipfs://")
          ? node.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/")
          : node.imageUri;

        img.src = src;
        img.crossOrigin = "Anonymous"; // Helper for some CORS issues
        newImages[node.id] = img;
      }
    });
    if (Object.keys(newImages).length > 0) {
      setImages((prev) => ({ ...prev, ...newImages }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nodes]); // Only run when nodes change (or initial load)

  const handleNodeClick = (nodeObj: object) => {
    const node = nodeObj as GraphNode;
    setSelectedNode(node);
    // Center camera on node
    if (node.x !== undefined && node.y !== undefined) {
      graphRef.current?.centerAt(node.x, node.y, 1000);
      graphRef.current?.zoom(4, 1000);
    }
  };

  // Check if a link is connected to the highlighted node
  const isLinkActive = (link: any) => {
    const nodeId = hoverNode?.id || selectedNode?.id;
    if (!nodeId) return false;
    return link.source.id === nodeId || link.target.id === nodeId;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-[#050c19] overflow-hidden rounded-xl border border-white/10 shadow-inner"
    >
      <ForceGraph2D
        ref={graphRef}
        width={containerDimensions.width}
        height={containerDimensions.height}
        graphData={data}
        nodeLabel="title"
        backgroundColor="#050c19"
        
        // Link Styling
        linkColor={(link) => isLinkActive(link) ? "#F8E473" : "#ffffff20"}
        linkWidth={(link) => isLinkActive(link) ? 2 : 1}
        linkDirectionalParticles={(link) => isLinkActive(link) ? 4 : 0}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleSpeed={0.005}
        
        // Custom Node Rendering
        nodeCanvasObject={(
          nodeObj: object,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const node = nodeObj as GraphNode;
          if (node.x === undefined || node.y === undefined) return;

          const size = 8;
          const isHovered = node.id === hoverNode?.id;
          const isSelected = node.id === selectedNode?.id;
          const isRemix = node.type === "REMIX";

          // Draw Shape
          ctx.save();
          ctx.beginPath();

          if (isRemix) {
            // Rounded Rect for Remix
            const r = size;
            // @ts-ignore - roundRect exists in modern browsers
            if (ctx.roundRect) {
                 // @ts-ignore
                ctx.roundRect(node.x - r, node.y - r, r * 2, r * 2, 4);
            } else {
                ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
            }
          } else {
            // Circle for Genesis
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          }
          
          ctx.clip();

          const img = images[node.id];
          if (img && img.complete && img.naturalWidth !== 0) {
            try {
              ctx.drawImage(
                img as unknown as CanvasImageSource,
                node.x - size,
                node.y - size,
                size * 2,
                size * 2
              );
            } catch {
              ctx.fillStyle = isRemix ? "#3b82f6" : "#a855f7";
              ctx.fill();
            }
          } else {
            ctx.fillStyle = isRemix ? "#3b82f6" : "#a855f7";
            ctx.fill();
          }
          ctx.restore();

          // Draw Border
          ctx.beginPath();
          if (isRemix) {
             const r = size;
              // @ts-ignore
             if (ctx.roundRect) {
                 // @ts-ignore
                 ctx.roundRect(node.x - r, node.y - r, r * 2, r * 2, 4);
             } else {
                 ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
             }
          } else {
             ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          }

          ctx.lineWidth = (isSelected || isHovered ? 2 : 1.5) / globalScale;
          ctx.strokeStyle =
            isSelected || isHovered
              ? "#F8E473"
              : isRemix
              ? "#3b82f6aa"
              : "#a855f7aa";
          ctx.stroke();

          // Draw Label
          if (globalScale > 2.5 || isSelected || isHovered) {
            const labelText = node.title || node.prompt;
            const label =
              labelText?.length > 15
                ? labelText.substring(0, 15) + "..."
                : labelText;
            const fontSize = isHovered ? 4 : 3;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = isHovered ? "#F8E473" : "white";
            ctx.fillText(label, node.x, node.y + size + fontSize + 2);
          }
        }}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => setHoverNode(node ? node as GraphNode : null)}
        cooldownTicks={100}
      />

      <AssetDrawer
        asset={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-white/10 text-[10px] text-white/70 space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 border border-purple-300/50"></div>
          <span>Genesis (Circle)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-blue-500 border border-blue-300/50"></div>
          <span>Remix (Square)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-[1px] bg-[#F8E473]"></div>
          <span>Link</span>
        </div>
      </div>
    </div>
  );
}
