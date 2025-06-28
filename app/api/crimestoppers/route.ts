import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface CrimestoppersPayload {
  formID: string;
  title: string;
  siteType: number;
  isTwoWay: boolean;
  formFields: Record<string, string>;
}

interface FieldMapping {
  key: string;
  dbField: string;
  required: boolean;
  type: "string" | "boolean";
}

// Map crimestoppers form field labels to our database fields
const FIELD_MAPPINGS: FieldMapping[] = [
  {
    key: "Town or city or Postcode\n (VITAL INFORMATION)",
    dbField: "postcode",
    required: true,
    type: "string",
  },
  {
    key: "Do you have any other address details e.g property number or road name? Can you tell us anything that will help us identify the location?",
    dbField: "location_hint",
    required: false,
    type: "string",
  },
  {
    key: "Do you know when it happened?\n (Required Info)",
    dbField: "time_description",
    required: true,
    type: "string",
  },
  {
    key: "Please don't give information about the people involved as you will be asked details about this in the next section.\n (Required Info)",
    dbField: "raw_text",
    required: true,
    type: "string",
  },
  {
    key: "What do you know about the person  / people? \nCan you tell us their names, age or where they live (if different from the address of the crime)?",
    dbField: "people_names",
    required: false,
    type: "string",
  },
  {
    key: "What does the person  / people look like?",
    dbField: "people_appearance",
    required: false,
    type: "string",
  },
  {
    key: "Do you know any contact details for the person / people?",
    dbField: "people_contact_info",
    required: false,
    type: "string",
  },
  {
    key: "Do any of the people involved in the crime have access to a vehicle/vehicles?",
    dbField: "has_vehicle",
    required: false,
    type: "boolean",
  },
  {
    key: "Do any of the people involved in the crime have access to a weapon/weapons?",
    dbField: "has_weapon",
    required: false,
    type: "boolean",
  },
];

function validateAndMapFields(formFields: Record<string, string>) {
  const mappedData: Record<string, any> = {};
  const validationResults = {
    valid: true,
    errors: [] as string[],
    warnings: [] as string[],
    mappedFields: [] as string[],
    unmappedFields: [] as string[],
  };

  // Check each expected field mapping
  for (const mapping of FIELD_MAPPINGS) {
    const value = formFields[mapping.key];

    if (value !== undefined) {
      validationResults.mappedFields.push(mapping.key);

      if (mapping.type === "boolean") {
        // Convert string boolean values
        const boolValue = value.toLowerCase() === "true";
        mappedData[mapping.dbField] = boolValue;
      } else {
        // Handle string values
        const stringValue = value.trim();
        if (mapping.required && !stringValue) {
          validationResults.errors.push(
            `Required field '${mapping.key}' is empty`
          );
          validationResults.valid = false;
        }
        mappedData[mapping.dbField] = stringValue;
      }
    } else if (mapping.required) {
      validationResults.errors.push(
        `Required field '${mapping.key}' is missing`
      );
      validationResults.valid = false;
    }
  }

  // Check for unmapped fields
  for (const fieldKey of Object.keys(formFields)) {
    if (!FIELD_MAPPINGS.some((m) => m.key === fieldKey)) {
      validationResults.unmappedFields.push(fieldKey);
      validationResults.warnings.push(`Unknown field: '${fieldKey}'`);
    }
  }

  return { mappedData, validationResults };
}

export async function POST(request: NextRequest) {
  try {
    const body: CrimestoppersPayload = await request.json();

    // Validate required payload structure
    if (!body.formID || !body.formFields) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload: missing formID or formFields",
        },
        { status: 400 }
      );
    }

    console.log("Received crimestoppers payload:", {
      formID: body.formID,
      title: body.title,
      fieldCount: Object.keys(body.formFields).length,
    });

    // Validate and map form fields
    const { mappedData, validationResults } = validateAndMapFields(
      body.formFields
    );

    console.log("Field validation results:", validationResults);
    console.log("Mapped data:", mappedData);

    // If validation fails, return error
    if (!validationResults.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResults.errors,
        },
        { status: 400 }
      );
    }

    // Create report data for database insertion
    const reportData = {
      ...mappedData,
      crime_type: body.title || "Unknown",
      is_anonymous: true, // Crimestoppers submissions are anonymous
      shared_with_crimestoppers: true,
      status: "submitted",
      time_known: Boolean(
        mappedData.time_description && mappedData.time_description !== "False"
      ),
      // Use a system user ID for crimestoppers submissions
      user_id: "d8c36489-f008-4022-9b51-df6469dc81eb", // This should be a system/service user
    };

    // Insert into database
    const supabase = createClient(cookies());
    const { data: newReport, error: dbError } = await supabase
      .from("reports")
      .insert([reportData])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save report",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "Successfully created report from crimestoppers:",
      newReport.id
    );

    return NextResponse.json({
      success: true,
      reportId: newReport.id,
      validation: {
        mappedFields: validationResults.mappedFields.length,
        unmappedFields: validationResults.unmappedFields.length,
        warnings: validationResults.warnings,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "crimestoppers",
    supportedFields: FIELD_MAPPINGS.map((m) => ({
      label: m.key,
      dbField: m.dbField,
      required: m.required,
      type: m.type,
    })),
  });
}
