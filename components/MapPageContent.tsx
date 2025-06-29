import { useState, useEffect, useCallback } from "react";
import { MapHeader } from "./MapHeader";
import { NearbyReportsSidebar } from "./NearbyReportsSidebar";
import { InteractiveMap } from "./InteractiveMap";
import { ReportButton } from "./ReportButton";
import { ReportModal } from "./ReportModal/ReportModal";
import { RealtimeTest } from "./RealtimeTest";
import { useReports } from "../hooks/useReports";
import { useMapBounds } from "../hooks/useMapBounds";
import { useRealtimeReports } from "../hooks/useRealtimeReports";
import { Report } from "@/types";

export const MapPageContent = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { reports, isLoadingReports, loadReports, addReport } = useReports();
  const { mapBounds, setMapBounds, nearbyReports } = useMapBounds(reports);

  // Stable callback for new reports
  const handleNewReport = useCallback(
    (newReport: Report) => {
      console.log("Adding new report to map:", newReport);
      addReport(newReport);
    },
    [addReport]
  );

  // Set up realtime subscription for new reports
  const { isConnected } = useRealtimeReports({
    onNewReport: handleNewReport,
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
      <MapHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && (
          <NearbyReportsSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            nearbyReports={nearbyReports}
            reports={reports}
            isLoadingReports={isLoadingReports}
            mapBounds={mapBounds}
          />
        )}

        <InteractiveMap reports={reports} onMapBoundsChange={setMapBounds} />
      </div>

      {/* Floating Sidebar Toggle Button */}
      <button
        onClick={() => {
          setIsSidebarOpen(!isSidebarOpen);
          // Close mobile menu when opening sidebar to prevent conflicts
          if (!isSidebarOpen && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
          }
        }}
        className={`fixed z-[1000] bg-white text-black p-3 rounded-lg border-2 border-gray-300 hover:bg-gray-100 shadow-lg transition-all duration-200 ${
          isSidebarOpen ? "left-[336px]" : "left-4"
        } ${isMobileMenuOpen ? "top-[220px]" : "top-20"}`}
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
