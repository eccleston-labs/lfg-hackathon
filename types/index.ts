export interface Report {
  id: string;
  created_at: string;
  raw_text: string;
  postcode: string;
  location_hint: string;
  time_description: string;
  crime_type: string;
  status: string;
  people_appearance?: string;
  has_vehicle: boolean;
  has_weapon: boolean;
  coordinates?: [number, number];
  photos?: { id: string; file_path: string }[];
  ai_summary?: string;
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
