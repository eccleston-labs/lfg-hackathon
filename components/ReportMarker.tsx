import dynamic from "next/dynamic";
import { Report } from "@/types";
import { useState } from "react";
import { createPortal } from "react-dom";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Simple marker that definitely works
const createSimpleMarker = () => {
  if (typeof window === "undefined") return null;

  const L = require("leaflet");
  return L.divIcon({
    html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface ReportMarkerProps {
  report: Report;
}

export const ReportMarker = ({ report }: ReportMarkerProps) => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const coords = report.coordinates;
  if (!coords) return null;

  const simpleIcon = createSimpleMarker();

  return (
    <Marker key={report.id} position={coords} icon={simpleIcon}>
      <Popup>
        <div className="w-80 -m-3">
          {/* Header Section */}
          <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {report.crime_type || "Crime Report"}
              </h3>
              <div className="flex items-center gap-2">
                {report.has_vehicle && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                    🚗 Vehicle
                  </span>
                )}
                {report.has_weapon && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                    ⚠️ Weapon
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-4 py-3 space-y-3">
            {/* Location & Time */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400">📍</span>
                  <span className="text-sm font-semibold text-gray-700">
                    Location
                  </span>
                </div>
                <p className="text-gray-900 pl-6">
                  {report.postcode}
                  {report.location_hint && (
                    <span className="text-gray-600">
                      {" "}
                      • {report.location_hint}
                    </span>
                  )}
                </p>
              </div>

              {report.time_description && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400">🕐</span>
                    <span className="text-sm font-semibold text-gray-700">
                      When
                    </span>
                  </div>
                  <p className="text-gray-900 pl-6">
                    {report.time_description}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400">📝</span>
                <span className="text-sm font-semibold text-gray-700">
                  Description
                </span>
              </div>
              <p className="text-gray-900 pl-6">{report.raw_text}</p>
            </div>

            {/* People Description */}
            {report.people_appearance && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400">👤</span>
                  <span className="text-sm font-semibold text-gray-700">
                    People Involved
                  </span>
                </div>
                <p className="text-gray-900 pl-6">{report.people_appearance}</p>
              </div>
            )}

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400">📷</span>
                  <span className="text-sm font-semibold text-gray-700">
                    Photos ({report.photos.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-6">
                  {report.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setModalImage(photo.file_path)}
                    >
                      <img
                        src={photo.file_path}
                        alt={`Report photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 rounded-b-lg border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Reported on{" "}
              {new Date(report.created_at).toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </Popup>
      {/* Modal */}
      {modalImage &&
        createPortal(
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
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </Marker>
  );
};
