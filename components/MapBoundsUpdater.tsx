"use client";

import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import { MapBounds } from "@/types";

interface MapBoundsUpdaterProps {
  onMapBoundsChange?: (bounds: MapBounds) => void;
}

export const MapBoundsUpdater = ({
  onMapBoundsChange,
}: MapBoundsUpdaterProps) => {
  const map = useMapEvents({
    moveend: () => {
      if (onMapBoundsChange) {
        const bounds = map.getBounds();
        const mapBounds: MapBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        onMapBoundsChange(mapBounds);
      }
    },
    zoomend: () => {
      if (onMapBoundsChange) {
        const bounds = map.getBounds();
        const mapBounds: MapBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        onMapBoundsChange(mapBounds);
      }
    },
  });

  // Update bounds on initial load
  useEffect(() => {
    if (onMapBoundsChange && map) {
      const bounds = map.getBounds();
      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };
      onMapBoundsChange(mapBounds);
    }
  }, [map, onMapBoundsChange]);

  return null;
};
