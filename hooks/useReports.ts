import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Report } from "@/types";
import { useGeocoding } from "./useGeocoding";

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

      // Geocode postcodes for all reports
      const reportsWithCoords = await Promise.all(
        reportsWithPhotos.map(async (report) => {
          console.log(`Geocoding postcode: ${report.postcode}`);
          const coords = await postcodeToCoords(report.postcode);
          console.log(`Geocoded ${report.postcode} to:`, coords);
          return {
            ...report,
            coordinates: coords,
          };
        })
      );

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

  return {
    reports,
    isLoadingReports,
    loadReports,
  };
};
