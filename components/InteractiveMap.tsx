import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Report, MapBounds } from "@/types";
import { ReportMarker } from "./ReportMarker";
import { MapBoundsUpdater } from "./MapBoundsUpdater";
import "leaflet/dist/leaflet.css";

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const ZoomControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.ZoomControl),
  { ssr: false }
);

interface InteractiveMapProps {
  reports: Report[];
  onMapBoundsChange?: (bounds: MapBounds) => void;
}

export const InteractiveMap = ({
  reports,
  onMapBoundsChange,
}: InteractiveMapProps) => {
  const searchParams = useSearchParams();
  const [mapKey, setMapKey] = useState(0); // Force map remount

  // Get map center from URL parameters or default to London
  const getMapCenter = (): [number, number] => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      // Validate coordinates are reasonable (within world bounds)
      if (
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        return [latitude, longitude];
      }
    }

    // Default to London coordinates
    return [51.505, -0.09];
  };

  // Force map remount on component mount to prevent initialization errors
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex-1 relative">
      <MapContainer
        key={`main-map-${mapKey}`}
        center={getMapCenter()}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="topright" />

        {/* Map bounds updater */}
        <MapBoundsUpdater onMapBoundsChange={onMapBoundsChange} />

        {/* Report Markers */}
        {reports.map((report) => (
          <ReportMarker key={report.id} report={report} />
        ))}
      </MapContainer>
    </div>
  );
};
