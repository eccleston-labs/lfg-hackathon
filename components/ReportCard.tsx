import { Report } from "@/types";
import { useState } from "react";
import { createPortal } from "react-dom";

interface ReportCardProps {
  report: Report;
}

export const ReportCard = ({ report }: ReportCardProps) => {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Header with crime type and photo indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 capitalize">
            {report.crime_type || "Crime"}
          </span>
          <span className="text-gray-500 text-sm">• {report.postcode}</span>
        </div>
        {Array.isArray(report.photos) && report.photos.length > 0 && (
          <button
            type="button"
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200 transition-colors"
            onClick={() =>
              report.photos && setModalImage(report.photos[0].file_path)
            }
            title="View photo"
          >
            📷 {report.photos.length}
          </button>
        )}
      </div>

      {/* AI Summary - Main Content */}
      {report.ai_summary ? (
        <div className="text-gray-800 mb-3 leading-relaxed">
          {report.ai_summary}
        </div>
      ) : (
        <div className="text-gray-600 mb-3 line-clamp-2 text-sm">
          {report.raw_text}
        </div>
      )}

      {/* Footer with time and tags */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {report.time_description ||
            new Date(report.created_at).toLocaleDateString()}
        </div>
        <div className="flex gap-1">
          {report.has_vehicle && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
              Vehicle
            </span>
          )}
          {report.has_weapon && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
              Weapon
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalImage &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Report"
              className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </div>
  );
};
