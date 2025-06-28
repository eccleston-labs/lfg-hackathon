"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const supabase = createClient();
  const router = useRouter();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [postcodeInput, setPostcodeInput] = useState("");
  const [isGeocodingPostcode, setIsGeocodingPostcode] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);

  // Postcode geocoding using postcodes.io API (same as map page)
  const postcodeToCoords = async (
    postcode: string
  ): Promise<[number, number] | null> => {
    if (!postcode) return null;

    const normalized = postcode.toUpperCase().trim();

    try {
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`
      );

      if (!response.ok) {
        console.warn(`Postcode API error for ${normalized}:`, response.status);
        return null;
      }

      const data = await response.json();

      if (data.status === 200 && data.result) {
        const coords: [number, number] = [
          data.result.latitude,
          data.result.longitude,
        ];
        return coords;
      } else {
        console.warn(`Invalid postcode: ${normalized}`);
        return null;
      }
    } catch (error) {
      console.error(`Error geocoding postcode ${normalized}:`, error);
      return null;
    }
  };

  const handleUseMyLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Navigate to map page with coordinates as URL parameters
        router.push(`/map?lat=${latitude}&lng=${longitude}`);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access was denied. Please enable location services and try again.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An unknown error occurred while getting your location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handlePostcodeGo = async () => {
    if (!postcodeInput.trim()) {
      setPostcodeError("Please enter a postcode.");
      return;
    }

    setIsGeocodingPostcode(true);
    setPostcodeError(null);

    try {
      const coords = await postcodeToCoords(postcodeInput);
      
      if (coords) {
        // Navigate to map page with coordinates
        router.push(`/map?lat=${coords[0]}&lng=${coords[1]}`);
      } else {
        setPostcodeError("Invalid postcode. Please check and try again.");
      }
    } catch (error) {
      setPostcodeError("Error looking up postcode. Please try again.");
    } finally {
      setIsGeocodingPostcode(false);
    }
  };

  const handlePostcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePostcodeGo();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Header */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            ProtectOurStreets
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0">
            Report crimes and anti-social behaviour in your area; view a
            real-time map of user reports.
          </p>
        </div>

        {/* Search Form */}
        <div className="space-y-4 sm:space-y-5 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="relative flex gap-2">
            <input
              type="text"
              value={postcodeInput}
              onChange={(e) => setPostcodeInput(e.target.value)}
              onKeyPress={handlePostcodeKeyPress}
              placeholder="Enter a UK postcode, street, or address"
              className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-base sm:text-lg md:text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
            <button
              type="button"
              onClick={handlePostcodeGo}
              disabled={isGeocodingPostcode}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg md:text-xl font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeocodingPostcode ? "..." : "Go"}
            </button>
          </div>

          {/* Postcode Error message */}
          {postcodeError && (
            <div className="text-red-600 text-sm sm:text-base mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              {postcodeError}
            </div>
          )}

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
            className="w-full bg-gray-900 text-white text-base sm:text-lg md:text-xl font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGettingLocation ? "Getting your location..." : "Use my location"}
          </button>

          {/* Location Error message */}
          {locationError && (
            <div className="text-red-600 text-sm sm:text-base mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              {locationError}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
