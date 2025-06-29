import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Report } from "@/types";
import { useGeocoding } from "./useGeocoding";
import wkx from "wkx";

function parseWKB(locationBuffer: string) {
  if (!locationBuffer) return null;
  const buffer = Buffer.from(locationBuffer, "hex");
  const geom = wkx.Geometry.parse(buffer);

  if (geom instanceof wkx.Point) {
    return [geom.x, geom.y]; // [lon, lat]
  } else {
    throw new Error(`Expected Point geometry, got ${geom?.constructor?.name}`);
  }
}
export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const { postcodeToCoords } = useGeocoding();
  const supabase = createClient();

  const loadReports = useCallback(async () => {
    try {
      setIsLoadingReports(true);

      // Load all reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsError) {
        console.error("Error loading reports:", reportsError);
        return;
      }

      // Load photos for all reports
      const { data: photosData, error: photosError } = await supabase
        .from("report_photos")
        .select("*");

      if (photosError) {
        console.error("Error loading photos:", photosError);
        // Continue without photos rather than failing completely
      }

      // Group photos by report_id
      const photosByReportId = (photosData || []).reduce((acc, photo) => {
        if (!acc[photo.report_id]) {
          acc[photo.report_id] = [];
        }
        acc[photo.report_id].push(photo);
        return acc;
      }, {} as Record<string, any[]>);

      // Attach photos to reports
      const reportsWithPhotos = (reportsData || []).map((report) => ({
        ...report,
        photos: photosByReportId[report.id] || [],
      }));

      console.log("Loaded reports from DB:", reportsWithPhotos);

      // Duplicate location field into coordinates
      const reportsWithCoords = reportsWithPhotos.map((report) => {
        console.log(report.location);
        const parsedCoords = parseWKB(report.location);
        const coordinates: [number, number] | undefined =
          parsedCoords &&
          Array.isArray(parsedCoords) &&
          parsedCoords.length === 2
            ? [parsedCoords[0], parsedCoords[1]]
            : undefined;

        return {
          ...report,
          coordinates,
        };
      });

      console.log("Reports with coordinates:", reportsWithCoords);
      console.log(
        "Reports that will render (have coordinates):",
        reportsWithCoords.filter((r) => r.coordinates)
      );

      setReports(reportsWithCoords);
    } catch (error) {
      console.error("Unexpected error loading reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  }, [postcodeToCoords, supabase]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const addReport = useCallback((newReport: Report) => {
    try {
      // Process the new report the same way as in loadReports
      const parsedCoords = parseWKB(newReport.location);
      const coordinates: [number, number] | undefined =
        parsedCoords && Array.isArray(parsedCoords) && parsedCoords.length === 2
          ? [parsedCoords[0], parsedCoords[1]]
          : undefined;

      const reportWithCoords: Report = {
        ...newReport,
        coordinates,
        // Keep photos from the new report (should include fetched photos from realtime)
        photos: newReport.photos || [],
      };

      console.log("Adding real-time report:", reportWithCoords);

      // Add to the beginning of the array (newest first)
      setReports((prevReports) => [reportWithCoords, ...prevReports]);
    } catch (error) {
      console.error("Error adding real-time report:", error);
    }
  }, []);

  const updateReportPhotos = useCallback((reportId: string, photos: any[]) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, photos } : report
      )
    );
    console.log(`Updated photos for report ${reportId}:`, photos);
  }, []);

  return {
    reports,
    isLoadingReports,
    loadReports,
    addReport,
    updateReportPhotos,
  };
};
