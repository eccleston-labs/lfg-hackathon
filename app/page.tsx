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
    <main className="min-h-screen flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image */}
        <img
          src="/grayscale_with_red_dots.png"
          alt="Crime reports map background"
          className="absolute inset-0 w-full h-full object-cover opacity-80 blur-sm"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/40 to-white/50 z-10"></div>

        {/* Foreground content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto text-center space-y-12 sm:space-y-10 md:space-y-12">
            {/* Header Section */}
            <div className="space-y-6 sm:space-y-5 md:space-y-6">
              <h1 className="text-3xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-gray-900 tracking-tight leading-tight px-2 whitespace-nowrap">
                OpenCrimeReports
              </h1>
              <p className="text-base sm:text-base md:text-lg lg:text-2xl text-gray-800 font-medium max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-2">
                Report crimes and anti-social behaviour in your area; view a
                real-time map of user reports.
              </p>
            </div>

            {/* Search Section */}
            <div className="w-full max-w-md sm:max-w-lg mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-6">
                  Get Started
                </h3>

                {/* Postcode Input */}
                <div className="space-y-6 sm:space-y-5">
                  <div className="flex flex-col gap-4 sm:gap-4">
                    <div className="w-full">
                      <input
                        type="text"
                        value={postcodeInput}
                        onChange={(e) => setPostcodeInput(e.target.value)}
                        onKeyPress={handlePostcodeKeyPress}
                        placeholder="Enter a UK postcode (e.g. SW1A 1AA)"
                        className="w-full px-4 py-3 sm:py-3.5 text-base border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                      />
                      {postcodeError && (
                        <p className="mt-2 text-sm text-red-600">
                          {postcodeError}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handlePostcodeGo}
                      disabled={isGeocodingPostcode}
                      className="w-full sm:w-auto sm:min-w-[120px] px-6 py-4 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isGeocodingPostcode ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          Search
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Location Button */}
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isGettingLocation}
                    className="w-full bg-gray-900 text-white font-semibold py-4 sm:py-3.5 px-4 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isGettingLocation ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm sm:text-base">
                          Getting your location...
                        </span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm sm:text-base">
                          Use my current location
                        </span>
                      </span>
                    )}
                  </button>

                  {locationError && (
                    <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                      {locationError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-20 py-4 sm:py-4 px-6 border-t border-gray-200/30 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-sm sm:text-sm text-gray-700">
              © 2025 OpenCrimeReports. Helping communities stay safe.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
