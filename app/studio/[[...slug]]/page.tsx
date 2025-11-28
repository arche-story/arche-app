"use client";

import { Suspense } from "react";
import { StudioMain } from "@/app/studio/(components)/StudioMain";

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-arche-navy flex items-center justify-center text-white font-mono text-sm">
          Loading Studio...
        </div>
      }
    >
      <StudioMain />
    </Suspense>
  );
}