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
      <MapHeader 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
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

        <InteractiveMap reports={reports} />
      </div>

      <ReportButton onClick={() => setIsReportModalOpen(true)} />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={loadReports}
      />
    </main>
  );
};
