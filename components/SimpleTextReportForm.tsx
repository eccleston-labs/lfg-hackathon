import { FormEvent, ChangeEvent } from "react";
import { ReportFormData } from "@/types";
import { ImageUpload } from "./ReportModal/ImageUpload";

interface ParsedFields {
  location?: string;
  timeOfIncident?: string;
  incidentDate?: string;
  description?: string;
  peopleInvolved?: string;
  appearance?: string;
  contactInfo?: string;
  hasVehicle?: boolean;
  hasWeapon?: boolean;
  crimeType?: string;
}

interface SimpleTextReportFormProps {
  formData: ReportFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: FormEvent) => void;
  isUploading: boolean;
  textParsedData: ParsedFields | null;
  isParsingText: boolean;
  onParseText: (text: string) => void;
  selectedImages: File[];
  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export default function SimpleTextReportForm({
  formData,
  onInputChange,
  onSubmit,
  isUploading,
  textParsedData,
  isParsingText,
  onParseText,
  selectedImages,
  onImageSelect,
  onRemoveImage,
}: SimpleTextReportFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="text-center mb-6">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Quick Text Report
        </h3>

        <p className="text-gray-500 mb-4">
          Describe what happened in your own words. Keep it simple and clear.
        </p>
      </div>

      {/* Simple Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What happened? <span className="text-red-500">(Required)</span>
        </label>
        <textarea
          value={formData.whatHappened}
          onChange={(e) => onInputChange("whatHappened", e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-32 resize-none text-gray-900"
          placeholder="Describe the incident in your own words..."
          required
        />
      </div>

      {/* Process Text Button */}
      {formData.whatHappened.trim() && !textParsedData && !isParsingText && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
          <div className="mb-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
          <h4 className="text-lg font-medium text-blue-900 mb-2">
            Ready to Extract Details
          </h4>
          <p className="text-blue-700 text-sm mb-4">
            Click below to use AI to automatically extract location, time,
            people descriptions, and other details from your report.
          </p>
          <button
            type="button"
            onClick={() => onParseText(formData.whatHappened)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
          >
            🤖 Extract Details with AI
          </button>
        </div>
      )}

      {/* Processing Status */}
      {isParsingText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <div className="text-blue-700">
              Analyzing text and extracting details...
            </div>
          </div>
        </div>
      )}

      {/* Parsed Data Display */}
      {textParsedData && !isParsingText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="text-green-800 font-medium">
              Details Extracted from Text
            </h4>
          </div>

          <div className="space-y-3 text-sm">
            {textParsedData.crimeType && (
              <div>
                <span className="font-medium text-green-800">Crime Type:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {textParsedData.crimeType}
                </span>
              </div>
            )}

            {textParsedData.location && (
              <div>
                <span className="font-medium text-green-800">Location:</span>
                <span className="ml-2 text-green-700">
                  {textParsedData.location}
                </span>
              </div>
            )}

            {textParsedData.timeOfIncident && (
              <div>
                <span className="font-medium text-green-800">Time:</span>
                <span className="ml-2 text-green-700">
                  {textParsedData.timeOfIncident}
                </span>
              </div>
            )}

            {textParsedData.incidentDate && (
              <div>
                <span className="font-medium text-green-800">Exact Date:</span>
                <span className="ml-2 text-green-700">
                  {new Date(textParsedData.incidentDate).toLocaleString(
                    "en-GB"
                  )}
                </span>
              </div>
            )}

            {textParsedData.peopleInvolved && (
              <div>
                <span className="font-medium text-green-800">
                  People Involved:
                </span>
                <span className="ml-2 text-green-700">
                  {textParsedData.peopleInvolved}
                </span>
              </div>
            )}

            {textParsedData.appearance && (
              <div>
                <span className="font-medium text-green-800">Appearance:</span>
                <span className="ml-2 text-green-700">
                  {textParsedData.appearance}
                </span>
              </div>
            )}

            {textParsedData.contactInfo && (
              <div>
                <span className="font-medium text-green-800">
                  Contact Info:
                </span>
                <span className="ml-2 text-green-700">
                  {textParsedData.contactInfo}
                </span>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-800">Vehicle:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    textParsedData.hasVehicle
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {textParsedData.hasVehicle ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-green-800">Weapon:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    textParsedData.hasWeapon
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {textParsedData.hasWeapon ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-green-600">
            This information was automatically extracted from your text report.
          </div>
        </div>
      )}

      {/* Attach Photos */}
      <div>
        <ImageUpload
          selectedImages={selectedImages}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
        />
      </div>

      {/* CrimeStoppers Checkbox */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="submitToCrimeStoppers"
          checked={formData.submitToCrimeStoppers}
          onChange={(e) =>
            onInputChange("submitToCrimeStoppers", e.target.checked)
          }
          className="w-5 h-5 mt-0.5"
        />
        <label
          htmlFor="submitToCrimeStoppers"
          className="text-sm font-semibold text-gray-700 cursor-pointer"
        >
          Submit report to{" "}
          <a
            href="https://crimestoppers-uk.org/give-information/forms/pre-form"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Crimestoppers UK
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUploading || !formData.whatHappened.trim()}
        className="w-full bg-gray-900 text-white font-bold text-lg py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Submitting report...
          </div>
        ) : (
          "Submit Report"
        )}
      </button>
    </form>
  );
}
