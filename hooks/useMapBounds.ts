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

  // Initial map bounds will be set by the map component itself
  // No need for hardcoded initial bounds

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
