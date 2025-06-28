import { useState, useCallback } from "react";
import { OSMPlace } from "@/types";

export const usePlaceSearch = () => {
  const [searchResults, setSearchResults] = useState<OSMPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchPlaces = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=10&addressdetails=1&extratags=1`
      );

      if (!response.ok) {
        console.warn("OSM Nominatim API error:", response.status);
        setSearchResults([]);
        return;
      }

      const data = await response.json();

      // Transform the response to match our OSMPlace interface
      const places: OSMPlace[] = data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
        category: item.category,
        importance: item.importance || 0,
      }));

      setSearchResults(places);
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    searchPlaces,
    clearResults,
  };
};
