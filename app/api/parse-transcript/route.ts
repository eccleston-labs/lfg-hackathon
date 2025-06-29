import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParseRequest {
  transcript: string;
}

interface ParsedReportData {
  success: boolean;
  extractedFields: {
    location?: string;
    timeOfIncident?: string;
    description?: string;
    peopleInvolved?: string;
    appearance?: string;
    contactInfo?: string;
    hasVehicle?: boolean;
    hasWeapon?: boolean;
  };
  confidence?: number;
  rawTranscript: string;
  processingNotes?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ParseRequest = await request.json();
    
    if (!body.transcript || !body.transcript.trim()) {
      return NextResponse.json(
        { success: false, error: 'Transcript is required' },
        { status: 400 }
      );
    }

    console.log('Parsing transcript:', body.transcript.substring(0, 100) + '...');

    const prompt = `Parse this crime report transcript and extract structured information:

"${body.transcript}"

Extract the following information if mentioned in the transcript:
- LOCATION: Where did this happen? (address, postcode, area, landmarks, street names)
- TIME: When did this happen? (date, time, timeframe like "yesterday", "this morning")
- DESCRIPTION: What happened? (main incident description, what crime occurred)
- PEOPLE: Who was involved? (names, ages, relationships, "the suspect", "a man", etc.)
- APPEARANCE: Physical descriptions of people (height, clothing, hair, age, gender)
- CONTACT: Phone numbers, social media accounts, email addresses, or other contact details mentioned
- VEHICLE: Any mention of cars, bikes, motorcycles, etc. (respond with true/false)
- WEAPON: Any mention of weapons, knives, guns, etc. (respond with true/false)
- POSTCODE: Calculate the postcode based on the location information provided

Important rules:
- Only extract information that is explicitly mentioned in the transcript
- If information isn't clear or mentioned, mark that field as null
- For VEHICLE and WEAPON, respond with true only if explicitly mentioned
- Keep original wording where possible
- If multiple people are mentioned, include all relevant details

Respond with valid JSON in exactly this format:
{
  "location": "extracted location or null",
  "timeOfIncident": "extracted time or null", 
  "description": "extracted description or null",
  "peopleInvolved": "extracted people details or null",
  "appearance": "extracted appearance details or null", 
  "contactInfo": "extracted contact info or null",
  "postcode": "calculated postcode"
}`;

    // Send to OpenAI GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured information from crime reports. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user', 
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', responseText);

    // Parse JSON response
    let extractedFields;
    try {
      extractedFields = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      throw new Error('Invalid JSON response from AI parser');
    }

    console.log('Parsed fields:', extractedFields);

    const result: ParsedReportData = {
      success: true,
      extractedFields,
      rawTranscript: body.transcript,
      processingNotes: [`Processed with GPT-4o-mini`]
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Parsing error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parsing failed',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Unknown parsing error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'parse-transcript',
    model: 'gpt-4o-mini',
    openai_configured: !!process.env.OPENAI_API_KEY,
  });
} 