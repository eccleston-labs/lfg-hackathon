import { useState, useRef, useEffect } from "react";

interface AudioRecorderProps {
  audioBlob: Blob | null;
  onAudioRecorded: (blob: Blob | null) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({
  audioBlob,
  onAudioRecorded,
  disabled = false,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check microphone permission on mount with delay for mobile
    const timer = setTimeout(() => {
      checkMicrophonePermission();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      // First, try to use the Permissions API if available (better for mobile)
      if ("permissions" in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          if (permissionStatus.state === "granted") {
            setHasPermission(true);
            setPermissionError(null);
            return;
          } else if (permissionStatus.state === "denied") {
            setHasPermission(false);
            setPermissionError(
              "Microphone access was denied. Please check your browser settings."
            );
            return;
          }
          // If 'prompt', we'll fall through to getUserMedia test
        } catch (permErr) {
          console.log(
            "Permissions API not fully supported, falling back to getUserMedia test"
          );
        }
      }

      // Fallback to getUserMedia test with mobile-optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          // Use lower sample rate for mobile compatibility
          sampleRate: { ideal: 44100, min: 8000 },
        },
      });

      setHasPermission(true);
      setPermissionError(null);

      // Clean up test stream
      stream.getTracks().forEach((track) => track.stop());
    } catch (error: any) {
      console.error("Microphone permission check failed:", error);
      setHasPermission(false);

      // Provide more specific error messages based on error type
      if (error.name === "NotAllowedError") {
        setPermissionError(
          "Microphone access was denied. Please allow microphone access and try again."
        );
      } else if (error.name === "NotFoundError") {
        setPermissionError(
          "No microphone found. Please check your device has a microphone."
        );
      } else if (error.name === "NotReadableError") {
        setPermissionError(
          "Microphone is being used by another application. Please close other apps using the microphone."
        );
      } else {
        setPermissionError(
          "Unable to access microphone. Please check your browser settings and try again."
        );
      }
    }
  };

  const startRecording = async () => {
    try {
      setPermissionError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Mobile-friendly sample rate
          sampleRate: { ideal: 44100, min: 8000 },
        },
      });

      streamRef.current = stream;

      // Check if MediaRecorder supports webm, fall back to other formats for mobile
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try alternative formats for mobile browsers
        const alternatives = [
          "audio/webm",
          "audio/mp4",
          "audio/aac",
          "audio/mpeg",
          "audio/wav",
        ];

        for (const type of alternatives) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        onAudioRecorded(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasPermission(true); // Update permission state on successful recording start

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error("Error starting recording:", error);
      setHasPermission(false);

      // Provide specific error messages
      if (error.name === "NotAllowedError") {
        setPermissionError(
          "Microphone access was denied. Please allow microphone access and try again."
        );
      } else if (error.name === "NotFoundError") {
        setPermissionError(
          "No microphone found. Please check your device has a microphone."
        );
      } else if (error.name === "NotReadableError") {
        setPermissionError(
          "Microphone is being used by another application. Please close other apps using the microphone."
        );
      } else {
        setPermissionError("Failed to start recording. Please try again.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    stopPlayback();
    onAudioRecorded(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show permission error state
  if (hasPermission === false) {
    return (
      <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-700 font-medium mb-2">
          Microphone Access Required
        </div>
        <div className="text-sm text-red-600 mb-3">
          {permissionError || "Please allow microphone access to record audio."}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={checkMicrophonePermission}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
          <div className="text-xs text-red-500">
            On mobile: Tap &quot;Try Again&quot; and allow microphone access
            when prompted
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking permissions
  if (hasPermission === null) {
    return (
      <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600">
            Checking microphone access...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Voice Recording
        </span>
        {(isRecording || audioBlob) && (
          <span className="text-sm text-gray-600">
            {formatTime(recordingTime)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {!audioBlob && !isRecording && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center justify-center gap-2 px-4 py-3 min-w-32 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
            </svg>
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center justify-center gap-2 px-4 py-3 min-w-32 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <>
            <button
              type="button"
              onClick={isPlaying ? stopPlayback : playAudio}
              className="flex items-center justify-center gap-2 px-4 py-3 min-w-32 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm"
            >
              {isPlaying ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Play
                </>
              )}
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              className="flex items-center justify-center gap-2 px-4 py-3 min-w-32 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>

            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center gap-2 px-4 py-3 min-w-32 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7" />
              </svg>
              Re-record
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="mt-3 flex items-center gap-2 text-red-600">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            Recording... Click &quot;Stop Recording&quot; when done
          </span>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="mt-3 text-sm text-green-600 font-medium">
          ✓ Audio recorded successfully
        </div>
      )}
    </div>
  );
};
