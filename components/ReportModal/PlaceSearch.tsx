import { useState, useEffect, useRef } from "react";
import { OSMPlace } from "@/types";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";

interface PlaceSearchProps {
  selectedPlace?: OSMPlace;
  onPlaceSelect: (place: OSMPlace | undefined) => void;
  placeholder?: string;
}

export const PlaceSearch = ({
  selectedPlace,
  onPlaceSelect,
  placeholder = "Search for a place...",
}: PlaceSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(
    selectedPlace?.display_name || ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchResults, isSearching, searchPlaces, clearResults } =
    usePlaceSearch();

  // Update search query when selectedPlace changes
  useEffect(() => {
    setSearchQuery(selectedPlace?.display_name || "");
  }, [selectedPlace]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim() && !selectedPlace) {
      const timeout = setTimeout(() => {
        searchPlaces(searchQuery);
        setIsDropdownOpen(true);
      }, 300);
      searchTimeoutRef.current = timeout;
    } else if (!searchQuery.trim()) {
      clearResults();
      setIsDropdownOpen(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchPlaces, clearResults, selectedPlace]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlaceSelect = (place: OSMPlace) => {
    onPlaceSelect(place);
    setSearchQuery(place.display_name);
    setIsDropdownOpen(false);
    clearResults();
  };

  const handleClearSelection = () => {
    onPlaceSelect(undefined);
    setSearchQuery("");
    clearResults();
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If user starts typing and there's a selected place, clear it
    if (selectedPlace && value !== selectedPlace.display_name) {
      onPlaceSelect(undefined);
    }
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none pr-10 text-gray-900"
          placeholder={placeholder}
        />

        {selectedPlace && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}

        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isDropdownOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {searchResults.map((place) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => handlePlaceSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="font-medium text-gray-900 truncate">
                {place.display_name}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {place.type} • {place.category}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedPlace && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
          <div className="font-medium text-green-800">Selected Place:</div>
          <div className="text-green-700 truncate">
            {selectedPlace.display_name}
          </div>
          <div className="text-green-600 text-xs">
            Coordinates: {parseFloat(selectedPlace.lat).toFixed(4)},{" "}
            {parseFloat(selectedPlace.lon).toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};
