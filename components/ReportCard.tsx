import { Report } from "@/types";

interface ReportCardProps {
  report: Report;
}

export const ReportCard = ({ report }: ReportCardProps) => {
  return (
    <div className="border-2 border-black rounded-lg p-4 bg-white">
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
        {report.time_description && `When: ${report.time_description}`}
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
  );
};
