import { useState, useEffect } from "react";
import { MapHeader } from "./MapHeader";
import { NearbyReportsSidebar } from "./NearbyReportsSidebar";
import { InteractiveMap } from "./InteractiveMap";
import { ReportButton } from "./ReportButton";
import { ReportModal } from "./ReportModal/ReportModal";
import { useReports } from "../hooks/useReports";
import { useMapBounds } from "../hooks/useMapBounds";

export const MapPageContent = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { reports, isLoadingReports, loadReports } = useReports();
  const { mapBounds, setMapBounds, nearbyReports } = useMapBounds(reports);

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

        <InteractiveMap reports={reports} />
      </div>

      {/* Floating Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-20 z-5000 z-[1000] bg-white text-black p-3 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-all shadow-lg ${
          isSidebarOpen ? 'left-[336px]' : 'left-4'
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
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
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
