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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);
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
    inputMode: "text",
  });
  const supabase = createClient();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAutoTranscribeAndStructure = async (blob: Blob) => {
    try {
      setIsTranscribing(true);

      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const transcribeResponse = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription failed: ${transcribeResponse.status}`);
      }

      const transcribeResult = await transcribeResponse.json();

      if (!transcribeResult.success) {
        throw new Error(transcribeResult.error || "Transcription failed");
      }

      const transcript = transcribeResult.transcript;
      setTranscript(transcript);
      setIsTranscribing(false);

      // Step 2: Parse transcript into structured data
      setIsParsing(true);

      const parseResponse = await fetch("/api/parse-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!parseResponse.ok) {
        throw new Error(`Parsing failed: ${parseResponse.status}`);
      }

      const parseResult = await parseResponse.json();

      if (!parseResult.success) {
        throw new Error(parseResult.error || "Parsing failed");
      }

      setParsedData(parseResult.extractedFields);
      setIsParsing(false);
    } catch (error) {
      console.error("Auto-transcribe and structure error:", error);
      setIsTranscribing(false);
      setIsParsing(false);

      // Show user-friendly error
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process audio. Please try again."
      );
    }
  };

  const handleAudioRecorded = async (blob: Blob | null) => {
    setAudioBlob(blob);
    setTranscript(null);
    setParsedData(null);

    // Auto-transcribe and structure when audio is recorded
    if (blob) {
      await handleAutoTranscribeAndStructure(blob);
    }
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
      setIsUploading(true);

      // Validate input based on mode
      if (formData.inputMode === "text") {
        if (!formData.whatHappened.trim()) {
          alert("Please describe what happened");
          setIsUploading(false);
          return;
        }

        // Validate postcode for text mode
        const loc_gps = await postcodeToCoordsPoint(formData.postcode);
        if (!loc_gps) {
          setPostcodeError(
            "Invalid postcode. Please enter a valid UK postcode."
          );
          setIsUploading(false);
          return;
        }
        setPostcodeError(null); // Clear error if valid
      } else {
        // Audio mode validation
        if (!parsedData) {
          alert("Please record and process your audio report first");
          setIsUploading(false);
          return;
        }

        if (!parsedData.location && !parsedData.description) {
          alert(
            "Could not extract location information from your audio. Please try recording again with more location details."
          );
          setIsUploading(false);
          return;
        }
      }

      // Get location coordinates
      let loc_gps: string | null = null;

      if (formData.inputMode === "text") {
        loc_gps = await postcodeToCoordsPoint(formData.postcode);
      } else {
        // For audio mode, try to extract postcode from location or use a default
        if (parsedData?.location) {
          // Try to extract a postcode from the location string
          const postcodeMatch = parsedData.location.match(
            /[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/i
          );
          if (postcodeMatch) {
            loc_gps = await postcodeToCoordsPoint(postcodeMatch[0]);
          }

          // If no postcode found or geocoding failed, use a default Sheffield location
          if (!loc_gps) {
            console.log("Using default Sheffield location for audio report");
            loc_gps = "POINT(53.3811 -1.4701)"; // Sheffield city center
          }
        } else {
          // Fallback to Sheffield if no location provided
          loc_gps = "POINT(53.3811 -1.4701)";
        }
      }

      // Upload files
      const imageUrls = await uploadImages();

      // Placeholder user ID (should be replaced with actual auth)
      const placeholder_user_id = "d8c36489-f008-4022-9b51-df6469dc81eb";

      // Prepare report data based on input mode
      const reportData = {
        raw_text:
          formData.inputMode === "text"
            ? formData.whatHappened
            : parsedData?.description ||
              "Audio report - see location_hint for details",
        postcode:
          formData.inputMode === "text"
            ? formData.postcode
            : parsedData?.location?.match(
                /[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/i
              )?.[0] || "AUDIO",
        location: loc_gps,
        location_hint:
          formData.inputMode === "text"
            ? formData.addressDetails +
              (formData.selectedPlace
                ? ` | Selected place: ${formData.selectedPlace.display_name}`
                : "")
            : parsedData?.location || "",
        incident_date: null, // We could parse this from time_description in the future
        time_description:
          formData.inputMode === "text"
            ? formData.whenHappened
            : parsedData?.timeOfIncident || "",
        time_known:
          formData.inputMode === "text"
            ? Boolean(formData.whenHappened.trim())
            : Boolean(parsedData?.timeOfIncident),
        people_description:
          formData.inputMode === "text"
            ? [
                formData.peopleDetails,
                formData.peopleAppearance,
                formData.contactDetails,
              ]
                .filter(Boolean)
                .join(" | ")
            : [
                parsedData?.peopleInvolved,
                parsedData?.appearance,
                parsedData?.contactInfo,
              ]
                .filter(Boolean)
                .join(" | "),
        people_names:
          formData.inputMode === "text"
            ? formData.peopleDetails
            : parsedData?.peopleInvolved || "",
        people_appearance:
          formData.inputMode === "text"
            ? formData.peopleAppearance
            : parsedData?.appearance || "",
        people_contact_info:
          formData.inputMode === "text"
            ? formData.contactDetails
            : parsedData?.contactInfo || "",
        has_vehicle:
          formData.inputMode === "text"
            ? formData.hasVehicle
            : parsedData?.hasVehicle || false,
        has_weapon:
          formData.inputMode === "text"
            ? formData.hasWeapon
            : parsedData?.hasWeapon || false,
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
        inputMode: "text",
      });
      setSelectedImages([]);
      setAudioBlob(null);
      setTranscript(null);
      setParsedData(null);

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
      inputMode: "text",
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
          audioBlob={audioBlob}
          onAudioRecorded={handleAudioRecorded}
          isTranscribing={isTranscribing}
          parsedData={parsedData}
          isParsing={isParsing}
          isUploading={isUploading}
          onFillTestData={fillTestData}
          postcodeError={postcodeError}
        />
      </div>
    </div>
  );
};
