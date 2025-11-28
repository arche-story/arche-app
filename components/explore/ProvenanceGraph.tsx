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
        img.src = node.imageUri;
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
        nodeLabel="prompt"
        backgroundColor="#050c19"
        linkColor={() => "#F8E473"} // Arche Gold
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
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
          const r = size;

          // Draw Image (Clipped Circle)
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.clip();

          const img = images[node.id];
          if (img && img.complete && img.naturalWidth !== 0) {
            try {
              // Cast to CanvasImageSource to satisfy TypeScript
              // HTMLImageElement is a valid CanvasImageSource
              ctx.drawImage(
                img as unknown as CanvasImageSource,
                node.x - r,
                node.y - r,
                r * 2,
                r * 2
              );
            } catch {
              // Fallback color if image fails to draw (CORS usually)
              ctx.fillStyle = node.type === "GENESIS" ? "#a855f7" : "#3b82f6";
              ctx.fill();
            }
          } else {
            ctx.fillStyle = node.type === "GENESIS" ? "#a855f7" : "#3b82f6";
            ctx.fill();
          }
          ctx.restore();

          // Draw Border (Gold for Remix, White/Purple for Genesis)
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.lineWidth = 1.5 / globalScale;
          ctx.strokeStyle =
            node.id === selectedNode?.id
              ? "#F8E473"
              : node.type === "REMIX"
              ? "#F8E473"
              : "#ffffff40";
          ctx.stroke();

          // Draw Label on Hover or Selection
          // Only show text if scale is high enough
          if (globalScale > 2 || node.id === selectedNode?.id) {
            const label =
              node.prompt?.length > 15
                ? node.prompt.substring(0, 15) + "..."
                : node.prompt;
            const fontSize = 3;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
            ctx.fillText(label, node.x, node.y + r + fontSize + 2);
          }
        }}
        onNodeClick={handleNodeClick}
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
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span>Genesis Asset</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Remix Asset</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-[1px] bg-[#F8E473]"></div>
          <span>Remix Link</span>
        </div>
      </div>
    </div>
  );
}
