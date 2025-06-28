import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { report } = await request.json();

    if (!report) {
      return NextResponse.json(
        { error: "No report data provided" },
        { status: 400 }
      );
    }

    // Prepare the report context for the AI
    const reportContext = {
      description: report.raw_text || "",
      location: report.location_hint || report.postcode || "",
      time: report.time_description || "",
      crimeType: report.crime_type || "",
      people: report.people_description || "",
      hasVehicle: report.has_vehicle || false,
      hasWeapon: report.has_weapon || false,
    };

    const prompt = `Generate a concise, one-line summary of this crime report. Focus on the key facts: what happened, where, and when. Keep it under 80 characters and professional.

Report Details:
- Type: ${reportContext.crimeType}
- Location: ${reportContext.location}
- Time: ${reportContext.time}
- Description: ${reportContext.description}
- People involved: ${reportContext.people}
- Vehicle involved: ${reportContext.hasVehicle ? "Yes" : "No"}
- Weapon involved: ${reportContext.hasWeapon ? "Yes" : "No"}

Generate a brief, factual summary suitable for a crime report dashboard:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a police report summarization assistant. Generate concise, professional, one-line summaries of crime reports. Focus on facts: what, where, when. Keep summaries under 80 characters and appropriate for public viewing.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: summary,
    });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
