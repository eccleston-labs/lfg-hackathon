import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get the audio file from FormData
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Audio file is required" },
        { status: 400 }
      );
    }

    console.log("Transcribing audio file:", audioFile.name);
    console.log("Audio file size:", audioFile.size, "bytes");
    console.log("Audio file type:", audioFile.type);

    // Send to OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Explicitly set to English
      response_format: "verbose_json", // Get confidence scores and other metadata
    });

    console.log("Transcription completed successfully");
    console.log("Transcript length:", transcription.text.length);

    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
      // Include segments if available for debugging
      segments: transcription.segments?.slice(0, 5), // First 5 segments only
    });
  } catch (error) {
    console.error("Transcription error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Transcription failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown transcription error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "transcribe-audio",
    openai_configured: !!process.env.OPENAI_API_KEY,
  });
}
