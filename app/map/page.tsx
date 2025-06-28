"use client";

import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface Report {
  id: string;
  created_at: string;
  raw_text: string;
  postcode: string;
  location_hint: string;
  time_description: string;
  crime_type: string;
  status: string;
  people_appearance?: string;
  has_vehicle: boolean;
  has_weapon: boolean;
  coordinates?: [number, number];
  photos?: { id: string; file_path: string }[];
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Simple marker that definitely works
const createSimpleMarker = () => {
  if (typeof window === "undefined") return null;

  const L = require("leaflet");
  return L.divIcon({
    html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

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

function MapPageContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [mapKey, setMapKey] = useState(0); // Force map remount
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [nearbyReports, setNearbyReports] = useState<Report[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    postcode: "",
    addressDetails: "",
    whenHappened: "",
    whatHappened: "",
    peopleDetails: "",
    peopleAppearance: "",
    contactDetails: "",
    hasVehicle: false,
    hasWeapon: false,
  });

  // Postcode geocoding using postcodes.io API
  const postcodeCache = new Map<string, [number, number]>();

  const postcodeToCoords = async (
    postcode: string
  ): Promise<[number, number] | null> => {
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
        console.warn(`Postcode API error for ${normalized}:`, response.status);
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
  };

  // Get map center from URL parameters or default to London
  const getMapCenter = (): [number, number] => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      // Validate coordinates are reasonable (within world bounds)
      if (!isNaN(latitude) && !isNaN(longitude) && 
          latitude >= -90 && latitude <= 90 && 
          longitude >= -180 && longitude <= 180) {
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

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);

  // Update nearby reports when reports or map bounds change
  useEffect(() => {
    if (!mapBounds || !reports.length) {
      setNearbyReports([]);
      return;
    }

    const filtered = reports
      .filter(
        (report) =>
          report.coordinates && isWithinBounds(report.coordinates, mapBounds)
      )
      .slice(0, 10) // Limit to 10 reports
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ); // Most recent first

    setNearbyReports(filtered);
  }, [reports, mapBounds]);

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
  }, [reports, mapBounds]);

  const loadReports = async () => {
    try {
      setIsLoadingReports(true);

      // Load reports with photos
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsError) {
        console.error("Error loading reports:", reportsError);
        return;
      }

      console.log("Loaded reports from DB:", reportsData);

      // Geocode postcodes for all reports
      const reportsWithCoords = await Promise.all(
        (reportsData || []).map(async (report) => {
          console.log(`Geocoding postcode: ${report.postcode}`);
          const coords = await postcodeToCoords(report.postcode);
          console.log(`Geocoded ${report.postcode} to:`, coords);
          return {
            ...report,
            coordinates: coords,
          };
        })
      );

      console.log("Reports with coordinates:", reportsWithCoords);
      console.log(
        "Reports that will render (have coordinates):",
        reportsWithCoords.filter((r) => r.coordinates)
      );

      setReports(reportsWithCoords);
    } catch (error) {
      console.error("Unexpected error loading reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate files
    const validFiles = files.filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return false;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`);
        return false;
      }

      return true;
    });

    // Check total count (max 5 images)
    if (selectedImages.length + validFiles.length > 5) {
      alert("Maximum 5 images allowed per report");
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of selectedImages) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data, error } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);

      // Upload images first
      const imageUrls = await uploadImages();

      // TODO: Replace with actual user authentication
      // For now, using a placeholder user_id - you'll need to implement proper auth
      const placeholder_user_id = "d8c36489-f008-4022-9b51-df6469dc81eb";

      const reportData = {
        raw_text: formData.whatHappened,
        postcode: formData.postcode,
        location_hint: formData.addressDetails,
        time_description: formData.whenHappened,
        time_known: Boolean(formData.whenHappened.trim()),
        people_names: formData.peopleDetails,
        people_appearance: formData.peopleAppearance,
        people_contact_info: formData.contactDetails,
        has_vehicle: formData.hasVehicle,
        has_weapon: formData.hasWeapon,
        crime_type: "theft",
        is_anonymous: true,
        shared_with_crimestoppers: false,
        status: "submitted",
        user_id: placeholder_user_id,
      };

      console.log("Attempting to submit report with data:", reportData);

      const { data, error } = await supabase
        .from("reports")
        .insert([reportData])
        .select();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          reportData: reportData,
        });
        alert(`Error submitting report: ${error.message}`);
        return;
      }

      const newReport = data[0];
      console.log("Report submitted successfully:", newReport);

      // Now create photo records if we have images
      if (imageUrls.length > 0 && newReport) {
        const photoData = imageUrls.map((url) => ({
          report_id: newReport.id,
          file_path: url,
        }));

        const { error: photoError } = await supabase
          .from("report_photos")
          .insert(photoData);

        if (photoError) {
          console.error("Error saving photos:", photoError);
          alert("Report saved but some photos failed to attach");
        }
      }

      alert("Report submitted successfully!");
      setIsReportModalOpen(false);

      // Reload reports to show the new one
      await loadReports();

      // Reset form and images
      setFormData({
        postcode: "",
        addressDetails: "",
        whenHappened: "",
        whatHappened: "",
        peopleDetails: "",
        peopleAppearance: "",
        contactDetails: "",
        hasVehicle: false,
        hasWeapon: false,
      });
      setSelectedImages([]);
    } catch (error) {
      console.error("Unexpected error during submission:", {
        error: error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData,
      });
      alert(
        `Unexpected error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      postcode: "S10 5GG",
      addressDetails: "Outside Tesco Metro, 123 High Street",
      whenHappened: "Yesterday around 3:30 PM",
      whatHappened: "Shoplifting - person took items from store without paying",
      peopleDetails: "Male, approximately 20 years old, lives locally",
      peopleAppearance:
        "Male, 20 years old, 5'8\", brown hair, wearing dark hoodie and jeans",
      contactDetails: "No known contact details",
      hasVehicle: false,
      hasWeapon: false,
    });
  };

  return (
    <main className="relative h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center z-[1000]">
        <h1 className="text-2xl font-bold text-gray-900">ProtectOurStreets</h1>
        <div className="flex gap-6">
          <button className="text-gray-700 hover:text-gray-900 font-medium">
            Map
          </button>
          <button className="text-gray-700 hover:text-gray-900 font-medium">
            Dashboard
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-300 flex flex-col">
          {/* Nearby Reports Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Nearby reports
            </h2>
            <div className="space-y-3">
              {nearbyReports.length > 0 ? (
                nearbyReports.map((report) => (
                  <div
                    key={report.id}
                    className="border-2 border-black rounded-lg p-4 bg-white"
                  >
                    <div className="font-medium text-gray-900 mb-2 flex items-center justify-between">
                      <span>
                        {report.crime_type || "Crime"} at{" "}
                        {report.location_hint || report.postcode}
                      </span>
                      {report.photos && report.photos.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                          📷 {report.photos.length}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {report.time_description &&
                        `When: ${report.time_description}`}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                      {report.raw_text}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {report.has_vehicle && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Vehicle
                        </span>
                      )}
                      {report.has_weapon && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Weapon
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {mapBounds ? (
                    <div>
                      <div className="text-lg mb-2">📍</div>
                      <div>No reports in this area</div>
                      <div className="text-sm mt-1">
                        Try zooming out or moving the map
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg mb-2">🗺️</div>
                      <div>Move the map to see nearby reports</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reports Info */}
          <div className="px-6 pb-4">
            {isLoadingReports ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm font-medium">Loading reports...</span>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <div className="font-medium">
                  <span className="text-blue-600">
                    {reports.filter((r) => r.coordinates).length}
                  </span>{" "}
                  reports on map
                </div>
                <div className="text-xs text-gray-500">
                  {reports.length} total reports loaded
                </div>
                {reports.length >
                  reports.filter((r) => r.coordinates).length && (
                  <div className="text-xs text-orange-600">
                    {reports.length -
                      reports.filter((r) => r.coordinates).length}{" "}
                    reports couldn&apos;t be geocoded
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            key={`main-map-${mapKey}`}
            center={getMapCenter()}
            zoom={13}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Report Markers */}
            {reports.map((report) => {
              const coords = report.coordinates;
              if (!coords) return null;

              const simpleIcon = createSimpleMarker();

              return (
                <Marker key={report.id} position={coords} icon={simpleIcon}>
                  <Popup>
                    <div className="p-2 max-w-xs">
                      <div className="font-bold text-lg mb-2 capitalize">
                        {report.crime_type || "Crime Report"}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Location:</span>{" "}
                          {report.postcode}
                          {report.location_hint && ` - ${report.location_hint}`}
                        </div>
                        {report.time_description && (
                          <div>
                            <span className="font-semibold">When:</span>{" "}
                            {report.time_description}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold">Description:</span>{" "}
                          {report.raw_text}
                        </div>
                        {report.people_appearance && (
                          <div>
                            <span className="font-semibold">
                              Description of people:
                            </span>{" "}
                            {report.people_appearance}
                          </div>
                        )}

                        {/* Images */}
                        {report.photos && report.photos.length > 0 && (
                          <div>
                            <span className="font-semibold">Photos:</span>
                            <div className="mt-2 grid grid-cols-2 gap-1">
                              {report.photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo.file_path}
                                  alt={`Report photo ${index + 1}`}
                                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                                  onClick={() =>
                                    window.open(photo.file_path, "_blank")
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          {report.has_vehicle && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              Vehicle
                            </span>
                          )}
                          {report.has_weapon && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              Weapon
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Reported:{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Report Button */}
          <button
            className="absolute bottom-6 right-6 bg-white text-black font-bold text-lg px-6 py-3 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors shadow-lg z-[1000]"
            onClick={() => setIsReportModalOpen(true)}
          >
            Report
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitReport} className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Report a crime</h2>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Greyed out Text/Audio Toggle */}
              <div className="flex gap-4 border-b border-gray-200 opacity-50 pointer-events-none">
                <button
                  type="button"
                  className="pb-2 px-1 border-b-2 border-transparent text-gray-400 font-medium"
                >
                  Text
                </button>
                <button
                  type="button"
                  className="pb-2 px-1 border-b-2 border-transparent text-gray-400 font-medium"
                >
                  Audio
                </button>
              </div>

              {/* Test Data Button */}
              <button
                type="button"
                onClick={fillTestData}
                className="w-full py-2 px-4 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
              >
                Fill with test data
              </button>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Postcode - VITAL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Town or city or Postcode{" "}
                    <span className="text-red-500 font-bold">
                      (VITAL INFORMATION)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) =>
                      handleInputChange("postcode", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. S10 5GG"
                    required
                  />
                </div>

                {/* Address Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have any other address details e.g property number or
                    road name? Can you tell us anything that will help us
                    identify the location?
                  </label>
                  <textarea
                    value={formData.addressDetails}
                    onChange={(e) =>
                      handleInputChange("addressDetails", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
                    placeholder="Additional location details..."
                  />
                </div>

                {/* When it happened */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you know when it happened?{" "}
                    <span className="text-red-500">(Required Info)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.whenHappened}
                    onChange={(e) =>
                      handleInputChange("whenHappened", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Date and time..."
                    required
                  />
                </div>

                {/* What happened */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe what happened.{" "}
                    <span className="text-red-500">(Required Info)</span>
                  </label>
                  <textarea
                    value={formData.whatHappened}
                    onChange={(e) =>
                      handleInputChange("whatHappened", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-24 resize-none"
                    placeholder="Describe what happened..."
                    required
                  />
                </div>

                {/* People details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you know about the person / people? Can you tell us
                    their names, age or where they live (if different from the
                    address of the crime)?
                  </label>
                  <textarea
                    value={formData.peopleDetails}
                    onChange={(e) =>
                      handleInputChange("peopleDetails", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
                    placeholder="Names, ages, addresses..."
                  />
                </div>

                {/* People appearance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What does the person / people look like?
                  </label>
                  <textarea
                    value={formData.peopleAppearance}
                    onChange={(e) =>
                      handleInputChange("peopleAppearance", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
                    placeholder="Physical description..."
                  />
                </div>

                {/* Contact details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you know any contact details for the person / people?
                  </label>
                  <input
                    type="text"
                    value={formData.contactDetails}
                    onChange={(e) =>
                      handleInputChange("contactDetails", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Phone numbers, social media, etc..."
                  />
                </div>

                {/* Vehicle access */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasVehicle"
                    checked={formData.hasVehicle}
                    onChange={(e) =>
                      handleInputChange("hasVehicle", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="hasVehicle"
                    className="text-sm font-medium text-gray-700"
                  >
                    Do any of the people involved in the crime have access to a
                    vehicle/vehicles?
                  </label>
                </div>

                {/* Weapon access */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasWeapon"
                    checked={formData.hasWeapon}
                    onChange={(e) =>
                      handleInputChange("hasWeapon", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="hasWeapon"
                    className="text-sm font-medium text-gray-700"
                  >
                    Do any of the people involved in the crime have access to a
                    weapon/weapons?
                  </label>
                </div>

                {/* Attach Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach photos (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <span>Choose photos (max 5, 5MB each)</span>
                  </label>

                  {/* Image Previews */}
                  {selectedImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gray-900 text-white font-bold text-lg py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Uploading images & submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <span className="ml-2">Loading map...</span>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
