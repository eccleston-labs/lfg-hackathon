import { Report } from "@/types";
import { useState } from "react";
import { createPortal } from 'react-dom';

interface ReportCardProps {
  report: Report;
}

export const ReportCard = ({ report }: ReportCardProps) => {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="border-2 border-black rounded-lg p-4 bg-white">
      <div className="font-medium text-gray-900 mb-2 flex items-center justify-between">
        <span>
          {report.crime_type || "Crime"} at{" "}
          {report.location_hint || report.postcode}
        </span>
        {Array.isArray(report.photos) && report.photos.length > 0 && (
          <button
            type="button"
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1"
            onClick={() => report.photos && setModalImage(report.photos[0].file_path)}
            title="View photo"
          >
            📷 {report.photos.length}
          </button>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {report.time_description && `When: ${report.time_description}`}
      </div>
      <div className="text-sm text-gray-700 line-clamp-3">
        {report.raw_text}
      </div>
      <div className="flex gap-1 mt-2">
        {report.has_vehicle && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
            Vehicle
          </span>
        )}
        {report.has_weapon && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
            Weapon
          </span>
        )}
      </div>
      {/* Modal */}
      {modalImage && createPortal(
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Report"
            className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      , document.body)}
    </div>
  );
};
