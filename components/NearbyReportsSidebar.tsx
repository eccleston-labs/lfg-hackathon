import { Report } from "@/types";
import { ReportCard } from "./ReportCard";

interface NearbyReportsSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  nearbyReports: Report[];
  reports: Report[];
  isLoadingReports: boolean;
  mapBounds: any;
}

export const NearbyReportsSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  nearbyReports,
  reports,
  isLoadingReports,
  mapBounds,
}: NearbyReportsSidebarProps) => {
  return (
    <aside
      className={`
        w-80 bg-white border-r border-gray-300 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-40
      `}
    >
      {/* Nearby Reports Section */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nearby reports</h2>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {nearbyReports.length > 0 ? (
            nearbyReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {mapBounds ? (
                <div>
                  <div className="text-lg mb-2">📍</div>
                  <div>No reports in this area</div>
                  <div className="text-sm mt-1">
                    Try zooming out or moving the map
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg mb-2">🗺️</div>
                  <div>Move the map to see nearby reports</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reports Info */}
      <div className="px-6 pb-4 border-t border-gray-200">
        {isLoadingReports ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm font-medium">Loading reports...</span>
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <div className="font-medium">
              <span className="text-blue-600">
                {reports.filter((r) => r.coordinates).length}
              </span>{" "}
              reports on map
            </div>
            <div className="text-xs text-gray-500">
              {reports.length} total reports loaded
            </div>
            {reports.length > reports.filter((r) => r.coordinates).length && (
              <div className="text-xs text-orange-600">
                {reports.length - reports.filter((r) => r.coordinates).length}{" "}
                reports couldn&apos;t be geocoded
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
