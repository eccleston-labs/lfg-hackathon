"use client";

import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
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
}

export default function MapPage() {
  const supabase = createClient();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
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

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoadingReports(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading reports:", error);
        return;
      }

      console.log("Loaded reports:", data);
      setReports(data || []);
    } catch (error) {
      console.error("Unexpected error loading reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Simple postcode to coordinates conversion (UK-focused)
  // In production, you'd want to use a proper geocoding service
  const postcodeToCoords = (postcode: string): [number, number] | null => {
    // This is a very basic mapping - in production use a geocoding API
    const postcodeMap: { [key: string]: [number, number] } = {
      "S10 5GG": [53.3781, -1.4816], // Sheffield
      "SW1A 1AA": [51.5014, -0.1419], // London
      "M1 1AA": [53.4808, -2.2426], // Manchester
      "B1 1AA": [52.4862, -1.8904], // Birmingham
    };

    const normalized = postcode.toUpperCase().trim();

    // Check for exact match first
    if (postcodeMap[normalized]) {
      return postcodeMap[normalized];
    }

    // Extract postcode area (first part) for approximate location
    const postcodeArea = normalized.split(" ")[0];
    if (postcodeArea.startsWith("S1")) return [53.3781, -1.4816]; // Sheffield area
    if (postcodeArea.startsWith("SW")) return [51.5014, -0.1419]; // London SW
    if (postcodeArea.startsWith("M1")) return [53.4808, -2.2426]; // Manchester
    if (postcodeArea.startsWith("B1")) return [52.4862, -1.8904]; // Birmingham

    // Default to London if no match
    return [51.505, -0.09];
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

      console.log("Report submitted successfully:", data);
      alert("Report submitted successfully!");
      setIsReportModalOpen(false);

      // Reload reports to show the new one
      await loadReports();

      // Reset form
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
    <main className="relative h-screen w-full">
      <MapContainer
        center={[51.505, -0.09]} // London coordinates
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
          const coords = postcodeToCoords(report.postcode);
          if (!coords) return null;

          return (
            <Marker key={report.id} position={coords}>
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

      {/* Reports Info */}
      <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg p-3 z-[1000] border">
        {isLoadingReports ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm font-medium">Loading reports...</span>
          </div>
        ) : (
          <div className="text-sm font-medium">
            <span className="text-blue-600">{reports.length}</span> reports on
            map
          </div>
        )}
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gray-900 text-white font-bold text-lg py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
