import { useEffect, useState, useRef, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Report } from "@/types";

interface UseRealtimeReportsProps {
  onNewReport?: (report: Report) => void;
  onReportPhotosUpdate?: (reportId: string, photos: any[]) => void;
  enabled?: boolean;
}

export const useRealtimeReports = ({
  onNewReport,
  onReportPhotosUpdate,
  enabled = true,
}: UseRealtimeReportsProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  // Stable callback references
  const onNewReportRef = useRef(onNewReport);
  const onReportPhotosUpdateRef = useRef(onReportPhotosUpdate);

  useEffect(() => {
    onNewReportRef.current = onNewReport;
  }, [onNewReport]);

  useEffect(() => {
    onReportPhotosUpdateRef.current = onReportPhotosUpdate;
  }, [onReportPhotosUpdate]);

  // Helper function to fetch photos for a report
  const fetchReportPhotos = useCallback(async (reportId: string) => {
    try {
      const { data: photosData, error } = await supabaseRef.current
        .from("report_photos")
        .select("*")
        .eq("report_id", reportId);

      if (error) {
        console.error("Error fetching photos for report:", error);
        return [];
      }

      return photosData || [];
    } catch (error) {
      console.error("Unexpected error fetching report photos:", error);
      return [];
    }
  }, []);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log("Cleaning up realtime subscription");
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    console.log("Setting up realtime subscriptions...");

    // Create realtime subscription for both reports and photos
    const channel = supabaseRef.current
      .channel("reports-and-photos", {
        config: {
          broadcast: { self: true },
          presence: { key: "" },
        },
      })
      // Listen to new reports
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
        },
        async (payload) => {
          console.log("New report received via realtime:", payload);

          if (payload.new && onNewReportRef.current) {
            const newReport = payload.new as Report;

            // Fetch photos for the new report (may be empty initially)
            const photos = await fetchReportPhotos(newReport.id);

            // Add photos to the report
            const reportWithPhotos = {
              ...newReport,
              photos: photos,
            };

            console.log("Report with photos:", reportWithPhotos);
            onNewReportRef.current(reportWithPhotos);
          }
        }
      )
      // Listen to new photos
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "report_photos",
        },
        async (payload) => {
          console.log("New photo received via realtime:", payload);

          if (payload.new && onReportPhotosUpdateRef.current) {
            const newPhoto = payload.new as any;
            const reportId = newPhoto.report_id;

            // Fetch all photos for this report
            const allPhotos = await fetchReportPhotos(reportId);

            console.log(`Updating photos for report ${reportId}:`, allPhotos);
            onReportPhotosUpdateRef.current(reportId, allPhotos);
          }
        }
      )
      .subscribe(async (status, error) => {
        console.log("Realtime subscription status:", status);
        if (error) {
          console.error("Realtime subscription error:", error);
        }

        setIsConnected(status === "SUBSCRIBED");

        // Log different status types for debugging
        switch (status) {
          case "SUBSCRIBED":
            console.log("Successfully subscribed to realtime updates");
            break;
          case "CLOSED":
            console.log("Realtime subscription closed");
            break;
          default:
            console.log("Realtime status:", status);
            break;
        }

        // Try to get current session info for debugging
        const {
          data: { session },
        } = await supabaseRef.current.auth.getSession();
        console.log(
          "Current session:",
          session ? "Authenticated" : "Anonymous"
        );
      });

    channelRef.current = channel;

    // Cleanup on unmount or dependency change
    return cleanup;
  }, [enabled, cleanup, fetchReportPhotos]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    isConnected,
    disconnect,
  };
};
