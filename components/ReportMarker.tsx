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
        <div className="p-2 max-w-xs">
          <div className="font-bold text-lg mb-2 capitalize">
            {report.crime_type || "Crime Report"}
          </div>

          {/* AI Summary */}
          {report.ai_summary && (
            <div className="text-sm text-blue-700 font-medium mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">🤖</span>
                <span className="italic">{report.ai_summary}</span>
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Location:</span> {report.postcode}
              {report.location_hint && ` - ${report.location_hint}`}
            </div>
            {report.time_description && (
              <div>
                <span className="font-semibold">When:</span>{" "}
                {report.time_description}
              </div>
            )}
            <div>
              <span className="font-semibold">Description:</span>{" "}
              {report.raw_text}
            </div>
            {report.people_appearance && (
              <div>
                <span className="font-semibold">Description of people:</span>{" "}
                {report.people_appearance}
              </div>
            )}

            {/* Images */}
            {report.photos && report.photos.length > 0 && (
              <div>
                <span className="font-semibold">Photos:</span>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {report.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.file_path}
                      alt={`Report photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                      onClick={() =>
                        report.photos && setModalImage(photo.file_path)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-2">
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
            <div className="text-xs text-gray-500 mt-2">
              Reported: {new Date(report.created_at).toLocaleDateString()}
            </div>
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
