import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export const RealtimeTest = () => {
  const [status, setStatus] = useState("Not connected");
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    console.log("Testing basic realtime connection...");

    const channel = supabase
      .channel("test-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        (payload) => {
          console.log("Received payload:", payload);
          setLastMessage(payload);
        }
      )
      .subscribe((status, error) => {
        console.log("Test subscription status:", status);
        setStatus(status);
        if (error) console.error("Test error:", error);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold">Realtime Test</h3>
      <p>
        Status:{" "}
        <span
          className={
            status === "SUBSCRIBED" ? "text-green-600" : "text-red-600"
          }
        >
          {status}
        </span>
      </p>
      {lastMessage && (
        <p className="text-xs">Last: {JSON.stringify(lastMessage, null, 2)}</p>
      )}
    </div>
  );
};
