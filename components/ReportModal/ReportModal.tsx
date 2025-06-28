import { useState, ChangeEvent, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportFormData, OSMPlace } from "@/types";
import ReportForm from "./ReportForm";
import { useEffect, useRef } from "react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
}

export const ReportModal = ({
  isOpen,
  onClose,
  onReportSubmitted,
}: ReportModalProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReportFormData>({
    postcode: "",
    addressDetails: "",
    whenHappened: "",
    whatHappened: "",
    peopleDetails: "",
    peopleAppearance: "",
    contactDetails: "",
    hasVehicle: false,
    hasWeapon: false,
    selectedPlace: undefined,
  });
  const supabase = createClient();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlaceSelect = (place: OSMPlace | undefined) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlace: place,
    }));
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
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
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }

      return true;
    });

    // Check total count
    if (selectedImages.length + validFiles.length > 5) {
      alert("Maximum 5 images allowed per report");
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);

    // Reset the input
    event.target.value = "";
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

  // Postcode geocoding using postcodes.io API (same as map page)
  const postcodeToCoordsPoint = async (
    postcode: string
  ): Promise<string | null> => {
    if (!postcode) return null;

    const normalized = postcode.toUpperCase().trim();

    try {
      console.log(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`
      );
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`
      );

      if (!response.ok) {
        console.warn(`Postcode API error for ${normalized}:`, response.status);
        return null;
      }

      const data = await response.json();

      if (data.status === 200 && data.result) {
        return `POINT(${data.result.latitude} ${data.result.longitude})`;
      } else {
        console.warn(`Invalid postcode: ${normalized}`);
        return null;
      }
    } catch (error) {
      console.error(`Error geocoding postcode ${normalized}:`, error);
      return null;
    }
  };

  const handleSubmitReport = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Validate postcode
      const loc_gps = await postcodeToCoordsPoint(formData.postcode);
      if (!loc_gps) {
        setPostcodeError("Invalid postcode. Please enter a valid UK postcode.");
        setIsUploading(false);
        return;
      }
      setPostcodeError(null); // Clear error if valid

      setIsUploading(true);

      // Upload images first
      const imageUrls = await uploadImages();

      // Placeholder user ID (should be replaced with actual auth)
      const placeholder_user_id = "d8c36489-f008-4022-9b51-df6469dc81eb";

      // Prepare report data
      const reportData = {
        raw_text: formData.whatHappened,
        postcode: formData.postcode,
        location: loc_gps,
        location_hint:
          formData.addressDetails +
          (formData.selectedPlace
            ? ` | Selected place: ${formData.selectedPlace.display_name}`
            : ""),
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

      // Insert report
      const { data, error } = await supabase
        .from("reports")
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        alert(`Error submitting report: ${error.message}`);
        return;
      }

      const newReport = data; // Fixed: .single() returns object, not array
      console.log("Report submitted successfully:", newReport);

      // Insert photos if any
      if (imageUrls.length > 0 && newReport) {
        const photoInserts = imageUrls.map((url) => ({
          report_id: newReport.id,
          file_path: url,
          uploaded_at: new Date().toISOString(), // Added missing timestamp
        }));

        const { error: photoError } = await supabase
          .from("report_photos")
          .insert(photoInserts);

        if (photoError) {
          console.error("Error inserting photos:", photoError);
          alert("Report saved but some photos failed to attach");
        }
      }

      alert("Report submitted successfully!");
      onClose();

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
        selectedPlace: undefined,
      });
      setSelectedImages([]);

      // Reload reports to show the new one
      onReportSubmitted();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
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
      selectedPlace: {
        place_id: 12345,
        display_name:
          "University of Sheffield, Western Bank, Sheffield, South Yorkshire, England, United Kingdom",
        lat: "53.3811",
        lon: "-1.4879",
        type: "university",
        category: "amenity",
        importance: 0.8,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-0">
          <h2 className="text-2xl font-bold">Report a crime</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <ReportForm
          formData={formData}
          onInputChange={handleInputChange}
          onPlaceSelect={handlePlaceSelect}
          onSubmit={handleSubmitReport}
          selectedImages={selectedImages}
          onImageSelect={handleImageSelect}
          onRemoveImage={removeImage}
          isUploading={isUploading}
          onFillTestData={fillTestData}
          postcodeError={postcodeError}
        />
      </div>
    </div>
  );
};
