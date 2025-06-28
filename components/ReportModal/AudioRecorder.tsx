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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check microphone permission on mount
    checkMicrophonePermission();

    return () => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop()); // Stop the test stream
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
        onAudioRecorded(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setHasPermission(false);
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

  if (hasPermission === false) {
    return (
      <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-700 font-medium mb-2">
          Microphone Access Required
        </div>
        <div className="text-sm text-red-600 mb-3">
          Please allow microphone access to record audio. Check your browser
          settings and reload the page.
        </div>
        <button
          type="button"
          onClick={checkMicrophonePermission}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
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

      <div className="flex items-center gap-3">
        {!audioBlob && !isRecording && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || hasPermission === null}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="w-3 h-3 bg-white rounded-full"></div>
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="w-3 h-3 bg-white"></div>
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <>
            <button
              type="button"
              onClick={isPlaying ? stopPlayback : playAudio}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {isPlaying ? (
                <>
                  <div className="w-3 h-3 bg-white"></div>
                  Stop
                </>
              ) : (
                <>
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
                  Play
                </>
              )}
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span className="text-sm">×</span>
              Delete
            </button>

            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="w-3 h-3 bg-white rounded-full"></div>
              Re-record
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="mt-3 flex items-center gap-2 text-red-600">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            Recording... Click "Stop Recording" when done
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
