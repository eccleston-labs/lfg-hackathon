export interface Report {
  id: string;
  created_at: string;
  incident_date?: string; // ISO date string
  raw_text: string;
  is_anonymous: boolean;
  shared_with_crimestoppers: boolean;
  status: string;
  location: string; // WKB format from database
  crime_type: string;
  location_hint: string;
  postcode: string;
  time_known: boolean;
  time_description: string;
  people_description: string;
  people_names: string;
  people_appearance: string;
  people_contact_info: string;
  has_vehicle: boolean;
  has_weapon: boolean;
  user_id: string;
  ai_summary?: string;
  // Additional computed fields for UI
  coordinates?: [number, number];
  photos?: { id: string; file_path: string }[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface OSMPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
  importance: number;
}

export interface ReportFormData {
  postcode: string;
  addressDetails: string;
  whenHappened: string;
  whatHappened: string;
  peopleDetails: string;
  peopleAppearance: string;
  contactDetails: string;
  hasVehicle: boolean;
  hasWeapon: boolean;
  selectedPlace?: OSMPlace;
  inputMode: "text" | "audio" | "manual";
  submitToCrimeStoppers: boolean;
}
