import { useEffect, useState, useRef, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Report } from "@/types";

interface UseRealtimeReportsProps {
  onNewReport?: (report: Report) => void;
  enabled?: boolean;
}

export const useRealtimeReports = ({
  onNewReport,
  enabled = true,
}: UseRealtimeReportsProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  // Stable callback reference
  const onNewReportRef = useRef(onNewReport);
  useEffect(() => {
    onNewReportRef.current = onNewReport;
  }, [onNewReport]);

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

    console.log("Setting up realtime subscription...");
    console.log("Supabase URL:", supabaseRef.current.supabaseUrl);
    console.log(
      "Supabase Key:",
      supabaseRef.current.supabaseKey?.substring(0, 20) + "..."
    );

    // Create realtime subscription with more explicit setup
    const channel = supabaseRef.current
      .channel("reports", {
        config: {
          broadcast: { self: true },
          presence: { key: "" },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          console.log("New report received via realtime:", payload);

          if (payload.new && onNewReportRef.current) {
            onNewReportRef.current(payload.new as Report);
          }
        }
      )
      .subscribe(async (status, error) => {
        console.log("Realtime subscription status:", status);
        if (error) {
          console.error("Realtime subscription error:", error);
        }

        setIsConnected(status === "SUBSCRIBED");

        if (status === "SUBSCRIPTION_ERROR") {
          console.error("Realtime subscription error occurred");
        }

        if (status === "CLOSED") {
          console.log("Realtime subscription closed");
        }

        if (status === "CHANNEL_ERROR") {
          console.error("Realtime channel error");
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
  }, [enabled, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    isConnected,
    disconnect,
  };
};
