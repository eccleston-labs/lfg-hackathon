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
            setLocationError(
              "Location access was denied. Please enable location services and try again."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError(
              "An unknown error occurred while getting your location."
            );
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
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
    if (e.key === "Enter") {
      handlePostcodeGo();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-first responsive container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Header Section */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 tracking-tight leading-tight px-2">
              ProtectOurStreets
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-700 leading-relaxed max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto px-2">
              Report crimes and anti-social behaviour in your area; view a
              real-time map of user reports.
            </p>
          </div>

          {/* Search Section */}
          <div className="space-y-4 sm:space-y-5 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            {/* Postcode Input */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={postcodeInput}
                  onChange={(e) => setPostcodeInput(e.target.value)}
                  onKeyPress={handlePostcodeKeyPress}
                  placeholder="Enter a UK postcode, street, or address"
                  className="flex-1 px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors w-full"
                />
                <button
                  type="button"
                  onClick={handlePostcodeGo}
                  disabled={isGeocodingPostcode}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 bg-blue-600 text-white text-sm sm:text-base md:text-lg font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[80px] sm:min-w-[100px]"
                >
                  {isGeocodingPostcode ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </div>
                  ) : (
                    "Go"
                  )}
                </button>
              </div>

              {/* Postcode Error */}
              {postcodeError && (
                <div className="text-red-600 text-xs sm:text-sm p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                  {postcodeError}
                </div>
              )}
            </div>

            {/* Location Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isGettingLocation}
                className="w-full bg-gray-900 text-white text-sm sm:text-base md:text-lg font-semibold py-3 sm:py-3.5 md:py-4 px-4 sm:px-6 rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Getting your location...</span>
                  </div>
                ) : (
                  "Use my location"
                )}
              </button>

              {/* Location Error */}
              {locationError && (
                <div className="text-red-600 text-xs sm:text-sm p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                  {locationError}
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="pt-4 sm:pt-6 lg:pt-8">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-gray-500">
                Help your community stay safe by reporting incidents you witness
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
                <span>📍 View local reports</span>
                <span>📝 Submit anonymously</span>
                <span>🗺️ Interactive map</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © 2024 ProtectOurStreets. Helping communities stay safe.
          </p>
        </div>
      </footer>
    </main>
  );
}
