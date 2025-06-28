import { FormEvent, ChangeEvent } from "react";
import { ReportFormData, OSMPlace } from "@/types";
import { ImageUpload } from "./ImageUpload";
import { AudioRecorder } from "./AudioRecorder";
import { PlaceSearch } from "./PlaceSearch";
import { useEffect, useRef, useState } from "react";
import TextReportForm from "../TextReportForm";
import AudioReportForm from "../AudioReportForm";
import SimpleTextReportForm from "../SimpleTextReportForm";

interface ParsedFields {
  location?: string;
  timeOfIncident?: string;
  description?: string;
  peopleInvolved?: string;
  appearance?: string;
  contactInfo?: string;
  hasVehicle?: boolean;
  hasWeapon?: boolean;
}

interface ReportFormProps {
  formData: ReportFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  onPlaceSelect: (place: OSMPlace | undefined) => void;
  onSubmit: (e: FormEvent) => void;
  selectedImages: File[];
  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  audioBlob: Blob | null;
  onAudioRecorded: (blob: Blob | null) => void;
  isTranscribing: boolean;
  parsedData: ParsedFields | null;
  isParsing: boolean;
  isUploading: boolean;
  onFillTestData: () => void;
  postcodeError?: string | null;
}

export default function ReportForm({
  formData,
  onInputChange,
  onPlaceSelect,
  onSubmit,
  selectedImages,
  onImageSelect,
  onRemoveImage,
  audioBlob,
  onAudioRecorded,
  isTranscribing,
  parsedData,
  isParsing,
  isUploading,
  onFillTestData,
  postcodeError,
}: ReportFormProps) {
  // Use inputMode from formData instead of local state
  const inputMode = formData.inputMode;

  const handleInputModeChange = (mode: "text" | "audio" | "manual") => {
    onInputChange("inputMode", mode);
  };

  return (
    <div>
      {/* Input Mode Toggle */}
      <div className="flex gap-4 border-b border-gray-200 p-6 pb-0">
        <button
          type="button"
          onClick={() => handleInputModeChange("audio")}
          className={`pb-2 px-1 border-b-2 font-medium ${
            inputMode === "audio"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400"
          }`}
        >
          Audio
        </button>
        <button
          type="button"
          onClick={() => handleInputModeChange("text")}
          className={`pb-2 px-1 border-b-2 font-medium ${
            inputMode === "text"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400"
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => handleInputModeChange("manual")}
          className={`pb-2 px-1 border-b-2 font-medium ${
            inputMode === "manual"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400"
          }`}
        >
          Manual
        </button>
      </div>

      {/* Conditional Rendering */}
      {inputMode === "text" ? (
        <SimpleTextReportForm
          formData={formData}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          isUploading={isUploading}
        />
      ) : inputMode === "audio" ? (
        <AudioReportForm
          onSubmit={onSubmit}
          isUploading={isUploading}
          audioBlob={audioBlob}
          onAudioRecorded={onAudioRecorded}
          isTranscribing={isTranscribing}
          parsedData={parsedData}
          isParsing={isParsing}
          formData={formData}
          onInputChange={onInputChange}
        />
      ) : (
        <TextReportForm
          formData={formData}
          onInputChange={onInputChange}
          onPlaceSelect={onPlaceSelect}
          onSubmit={onSubmit}
          selectedImages={selectedImages}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
          isUploading={isUploading}
          onFillTestData={onFillTestData}
          postcodeError={postcodeError}
        />
      )}
    </div>
  );
}
