"use client";

import { Suspense } from "react";
import { MapPageContent } from "@/components/MapPageContent";

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-2">Loading map...</span>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
