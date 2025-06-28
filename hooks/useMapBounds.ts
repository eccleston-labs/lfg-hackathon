import { useState, useEffect, useMemo } from "react";
import { MapBounds, Report } from "@/types";

// Check if coordinates are within map bounds
const isWithinBounds = (
  coords: [number, number],
  bounds: MapBounds
): boolean => {
  const [lat, lng] = coords;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
};

export const useMapBounds = (reports: Report[]) => {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  // Set initial map bounds (rough estimate for London area)
  useEffect(() => {
    if (reports.length > 0 && !mapBounds) {
      // Set initial bounds to London area
      setMapBounds({
        north: 51.6,
        south: 51.4,
        east: 0.1,
        west: -0.3,
      });
    }
  }, [reports.length, mapBounds]);

  // Calculate nearby reports based on current map bounds
  const nearbyReports = useMemo(() => {
    if (!mapBounds || !reports.length) {
      return [];
    }

    return reports
      .filter(
        (report) =>
          report.coordinates && isWithinBounds(report.coordinates, mapBounds)
      )
      .slice(0, 10) // Limit to 10 reports
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ); // Most recent first
  }, [reports, mapBounds]);

  return {
    mapBounds,
    setMapBounds,
    nearbyReports,
  };
};
