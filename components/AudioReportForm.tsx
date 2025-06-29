import { FormEvent } from "react";
import { ReportFormData } from "@/types";
import { AudioRecorder } from "./ReportModal/AudioRecorder";

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

interface AudioReportFormProps {
  onSubmit: (e: FormEvent) => void;
  isUploading: boolean;
  audioBlob: Blob | null;
  onAudioRecorded: (blob: Blob | null) => void;
  isTranscribing: boolean;
  parsedData: ParsedFields | null;
  isParsing: boolean;
  formData: ReportFormData;
  onInputChange: (field: string, value: string | boolean) => void;
}

export default function AudioReportForm({
  onSubmit,
  isUploading,
  audioBlob,
  onAudioRecorded,
  isTranscribing,
  parsedData,
  isParsing,
  formData,
  onInputChange,
}: AudioReportFormProps) {
  const isProcessing = isTranscribing || isParsing;

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
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Audio Crime Report
        </h3>

        <p className="text-gray-500 mb-4">
          Record your voice to describe what happened. Your audio will be
          automatically processed to extract relevant details.
        </p>
      </div>

      {/* Audio Recorder */}
      <div className="mb-6">
        <AudioRecorder
          audioBlob={audioBlob}
          onAudioRecorded={onAudioRecorded}
          disabled={isProcessing}
        />
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <div className="text-blue-700">
              {isTranscribing && "Transcribing audio..."}
              {isParsing && "Analyzing and structuring data..."}
            </div>
          </div>
        </div>
      )}

      {/* Structured Data Display */}
      {parsedData && !isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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
              Report Details Extracted
            </h4>
          </div>

          <div className="space-y-3 text-sm">
            {parsedData.crimeType && (
              <div>
                <span className="font-medium text-green-800">Crime Type:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {parsedData.crimeType}
                </span>
              </div>
            )}

            {parsedData.location && (
              <div>
                <span className="font-medium text-green-800">Location:</span>
                <span className="ml-2 text-green-700">
                  {parsedData.location}
                </span>
              </div>
            )}

            {parsedData.timeOfIncident && (
              <div>
                <span className="font-medium text-green-800">Time:</span>
                <span className="ml-2 text-green-700">
                  {parsedData.timeOfIncident}
                </span>
              </div>
            )}

            {parsedData.incidentDate && (
              <div>
                <span className="font-medium text-green-800">Exact Date:</span>
                <span className="ml-2 text-green-700">
                  {new Date(parsedData.incidentDate).toLocaleString("en-GB")}
                </span>
              </div>
            )}

            {parsedData.description && (
              <div>
                <span className="font-medium text-green-800">Description:</span>
                <span className="ml-2 text-green-700">
                  {parsedData.description}
                </span>
              </div>
            )}

            {parsedData.peopleInvolved && (
              <div>
                <span className="font-medium text-green-800">
                  People Involved:
                </span>
                <span className="ml-2 text-green-700">
                  {parsedData.peopleInvolved}
                </span>
              </div>
            )}

            {parsedData.appearance && (
              <div>
                <span className="font-medium text-green-800">Appearance:</span>
                <span className="ml-2 text-green-700">
                  {parsedData.appearance}
                </span>
              </div>
            )}

            {parsedData.contactInfo && (
              <div>
                <span className="font-medium text-green-800">
                  Contact Info:
                </span>
                <span className="ml-2 text-green-700">
                  {parsedData.contactInfo}
                </span>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-800">Vehicle:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    parsedData.hasVehicle
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {parsedData.hasVehicle ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-green-800">Weapon:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    parsedData.hasWeapon
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {parsedData.hasWeapon ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-green-600">
            This information was automatically extracted from your audio
            recording.
          </div>
        </div>
      )}

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
        disabled={isUploading || isProcessing || !parsedData}
        className="w-full bg-gray-900 text-white font-bold text-lg py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Submitting report...
          </div>
        ) : !parsedData ? (
          "Record audio to continue"
        ) : (
          "Submit Audio Report"
        )}
      </button>
    </form>
  );
}
