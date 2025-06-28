import { FormEvent } from "react";
import { ReportFormData } from "@/types";

interface AudioReportFormProps {
  onSubmit: (e: FormEvent) => void;
  isUploading: boolean;
}

export default function AudioReportForm({
  onSubmit,
  isUploading,
}: AudioReportFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
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

        <h3 className="text-lg font-medium text-gray-900 mb-2">Audio Report</h3>

        <p className="text-gray-500 mb-6">
          Audio reporting functionality will be implemented here.
        </p>

        <p className="text-sm text-gray-500">
          This will include audio recording, transcription, and AI parsing.
        </p>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full bg-gray-900 text-white font-bold text-lg py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Audio Report
      </button>
    </form>
  );
}
