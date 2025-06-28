"use client";

import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issues with Next.js
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    
    // Delete the default icon to reset it
    delete L.Icon.Default.prototype._getIconUrl;
    
    // Set the icon options
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
};

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Fix Leaflet icons on component mount
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Get coordinates from URL parameters, fallback to London
  const { center, hasUserLocation } = useMemo(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      // Validate coordinates
      if (!isNaN(latitude) && !isNaN(longitude) && 
          latitude >= -90 && latitude <= 90 && 
          longitude >= -180 && longitude <= 180) {
        return {
          center: [latitude, longitude] as [number, number],
          hasUserLocation: true
        };
      }
    }
    
    // Fallback to London coordinates
    return {
      center: [51.505, -0.09] as [number, number],
      hasUserLocation: false
    };
  }, [searchParams]);

  return (
    <main className="h-screen w-full">
      <MapContainer
        center={center}
        zoom={hasUserLocation ? 15 : 13} // Zoom in more if we have user's location
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Show marker at user's location if available */}
        {hasUserLocation && (
          <Marker position={center}>
            <Popup>
              Your current location
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </main>
  );
}
