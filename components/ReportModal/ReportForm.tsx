import { FormEvent, ChangeEvent } from "react";
import { ReportFormData, OSMPlace } from "@/types";
import { ImageUpload } from "./ImageUpload";
import { AudioRecorder } from "./AudioRecorder";
import { PlaceSearch } from "./PlaceSearch";

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
}

export const ReportForm = ({
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
}: ReportFormProps) => {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Text/Audio Toggle */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => onInputChange("inputMode", "text")}
          className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
            formData.inputMode === "text"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => onInputChange("inputMode", "audio")}
          className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
            formData.inputMode === "audio"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Audio
        </button>
      </div>

      {/* Test Data Button */}
      <button
        type="button"
        onClick={onFillTestData}
        className="w-full py-2 px-4 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
      >
        Fill with test data
      </button>

      {/* Form Fields */}
      <div className="space-y-4">
        {formData.inputMode === "text" ? (
          <>
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
                onChange={(e) => onInputChange("postcode", e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. S10 5GG"
                required
              />
            </div>

            {/* Address Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have any other address details e.g property number or
                road name? Can you tell us anything that will help us identify
                the location?
              </label>
              <textarea
                value={formData.addressDetails}
                onChange={(e) =>
                  onInputChange("addressDetails", e.target.value)
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
                placeholder="Additional location details..."
              />
            </div>

            {/* Place Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for a specific place or landmark (optional)
              </label>
              <PlaceSearch
                selectedPlace={formData.selectedPlace}
                onPlaceSelect={onPlaceSelect}
                placeholder="e.g. Sheffield University, Meadowhall Shopping Centre..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps provide more precise location information alongside
                your postcode
              </p>
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
                onChange={(e) => onInputChange("whenHappened", e.target.value)}
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
                onChange={(e) => onInputChange("whatHappened", e.target.value)}
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
                onChange={(e) => onInputChange("peopleDetails", e.target.value)}
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
                  onInputChange("peopleAppearance", e.target.value)
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
                  onInputChange("contactDetails", e.target.value)
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
                onChange={(e) => onInputChange("hasVehicle", e.target.checked)}
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
                onChange={(e) => onInputChange("hasWeapon", e.target.checked)}
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
            <ImageUpload
              selectedImages={selectedImages}
              onImageSelect={onImageSelect}
              onRemoveImage={onRemoveImage}
            />
          </>
        ) : (
          <>
            {/* Audio Recording Mode - ONLY AUDIO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Record your crime report{" "}
                <span className="text-red-500">(Required)</span>
              </label>
              <div className="mb-4">
                <AudioRecorder
                  audioBlob={audioBlob}
                  onAudioRecorded={onAudioRecorded}
                  disabled={isUploading || isTranscribing}
                />
              </div>

              {/* Processing Status */}
              {audioBlob && (isTranscribing || isParsing) && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium text-blue-700">
                      {isTranscribing && "Converting speech to text..."}
                      {isParsing && "Structuring data with AI..."}
                    </span>
                  </div>
                </div>
              )}

              {/* Parsed Data Display */}
              {parsedData && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Structured Data
                    </label>
                    <span className="text-xs text-blue-600 font-medium">
                      ✓ Parsed by AI
                    </span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {parsedData.location && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Location:
                        </span>
                        <div className="text-gray-800">
                          {parsedData.location}
                        </div>
                      </div>
                    )}
                    {parsedData.timeOfIncident && (
                      <div>
                        <span className="font-medium text-gray-600">Time:</span>
                        <div className="text-gray-800">
                          {parsedData.timeOfIncident}
                        </div>
                      </div>
                    )}
                    {parsedData.description && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Description:
                        </span>
                        <div className="text-gray-800">
                          {parsedData.description}
                        </div>
                      </div>
                    )}
                    {parsedData.peopleInvolved && (
                      <div>
                        <span className="font-medium text-gray-600">
                          People Involved:
                        </span>
                        <div className="text-gray-800">
                          {parsedData.peopleInvolved}
                        </div>
                      </div>
                    )}
                    {parsedData.appearance && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Appearance:
                        </span>
                        <div className="text-gray-800">
                          {parsedData.appearance}
                        </div>
                      </div>
                    )}
                    {parsedData.contactInfo && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Contact Info:
                        </span>
                        <div className="text-gray-800">
                          {parsedData.contactInfo}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">
                          Vehicle:
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            parsedData.hasVehicle
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {parsedData.hasVehicle ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">
                          Weapon:
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            parsedData.hasWeapon
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {parsedData.hasWeapon ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Please include everything in your recording: where it happened,
                when it happened, what happened, details about people involved,
                their appearance, contact information, vehicles, weapons, and
                any other relevant details.
              </p>
            </div>
          </>
        )}
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
  );
};
