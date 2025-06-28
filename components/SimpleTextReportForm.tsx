import { FormEvent } from "react";
import { ReportFormData } from "@/types";

interface SimpleTextReportFormProps {
  formData: ReportFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: FormEvent) => void;
  isUploading: boolean;
}

export default function SimpleTextReportForm({
  formData,
  onInputChange,
  onSubmit,
  isUploading,
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
