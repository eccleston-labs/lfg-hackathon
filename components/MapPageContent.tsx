import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MapHeader } from "./MapHeader";
import { NearbyReportsSidebar } from "./NearbyReportsSidebar";
import { InteractiveMap } from "./InteractiveMap";
import { ReportButton } from "./ReportButton";
import { ReportModal } from "./ReportModal/ReportModal";

import { useReports } from "../hooks/useReports";
import { useMapBounds } from "../hooks/useMapBounds";
import { useRealtimeReports } from "../hooks/useRealtimeReports";
import { Report } from "@/types";

export const MapPageContent = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    reports,
    isLoadingReports,
    loadReports,
    addReport,
    updateReportPhotos,
  } = useReports();
  const searchParams = useSearchParams();  
  const syntheticFilter = searchParams.has("synthetic");
  
  const filteredReports = !syntheticFilter
    ? reports.filter((r) => r.user_id != "f4b8320a-0fad-428a-abd5-9e885817551d")
    : reports;

  const { mapBounds, setMapBounds, nearbyReports } = useMapBounds(filteredReports);

  // Stable callback for new reports
  const handleNewReport = useCallback(
    (newReport: Report) => {
      console.log("Adding new report to map:", newReport);
      addReport(newReport);
    },
    [addReport]
  );

  // Stable callback for photo updates
  const handleReportPhotosUpdate = useCallback(
    (reportId: string, photos: any[]) => {
      console.log("Updating photos for report:", reportId, photos);
      updateReportPhotos(reportId, photos);
    },
    [updateReportPhotos]
  );

  // Set up realtime subscription for new reports and photos
  const { isConnected } = useRealtimeReports({
    onNewReport: handleNewReport,
    onReportPhotosUpdate: handleReportPhotosUpdate,
    enabled: true,
  });

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  return (
    <main className="h-screen flex flex-col">
      <MapHeader />

      {/* Realtime Status Indicator (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div
          className={`fixed top-2 right-2 z-[9999] px-2 py-1 rounded text-xs ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          Realtime:{" "}
          {isConnected ? "Connected (Reports + Photos)" : "Disconnected"}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && (
          <NearbyReportsSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            nearbyReports={nearbyReports}
            reports={filteredReports}
            isLoadingReports={isLoadingReports}
            mapBounds={mapBounds}
          />
        )}

        <InteractiveMap reports={filteredReports} onMapBoundsChange={setMapBounds} />
      </div>

      {/* Floating Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-20 z-5000 z-[1000] bg-white text-black p-3 rounded-lg border-2 border-gray-300 hover:bg-gray-100 shadow-lg ${
          isSidebarOpen ? "left-[336px]" : "left-4"
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
          />
        </svg>
      </button>

      <ReportButton onClick={() => setIsReportModalOpen(true)} />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={loadReports}
      />
    </main>
  );
};
