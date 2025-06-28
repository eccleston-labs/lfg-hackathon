import { useCallback } from "react";

export const useGeocoding = () => {
  const postcodeCache = new Map<string, [number, number]>();

  const postcodeToCoords = useCallback(
    async (postcode: string): Promise<[number, number] | null> => {
      if (!postcode) return null;

      const normalized = postcode.toUpperCase().trim();

      // Check cache first
      if (postcodeCache.has(normalized)) {
        return postcodeCache.get(normalized)!;
      }

      try {
        const response = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`
        );

        if (!response.ok) {
          console.warn(
            `Postcode API error for ${normalized}:`,
            response.status
          );
          return null;
        }

        const data = await response.json();

        if (data.status === 200 && data.result) {
          const coords: [number, number] = [
            data.result.latitude,
            data.result.longitude,
          ];
          // Cache the result
          postcodeCache.set(normalized, coords);
          return coords;
        } else {
          console.warn(`Invalid postcode: ${normalized}`);
          return null;
        }
      } catch (error) {
        console.error(`Error geocoding postcode ${normalized}:`, error);
        return null;
      }
    },
    []
  );

  return { postcodeToCoords };
};
