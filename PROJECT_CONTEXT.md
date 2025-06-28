# OpenCrimeReports - Project Context Document

## Project Overview

OpenCrimeReports is a community-driven crime reporting web application developed for a growth hackathon in London. The project aims to improve public safety across the UK by enabling citizens to report crimes and anti-social behavior incidents in real-time, while providing a visual map interface to view reported incidents in their area.

## Core Concept

The application allows users to:

- Report witnessed crimes or anti-social behavior (e.g., shoplifting, vandalism, harassment)
- View real-time reports from other users on an interactive map
- Search for specific locations or use their current location
- Contribute to community safety awareness and crime prevention

## Target Users

- UK residents who witness crimes or anti-social behavior
- Community members wanting to stay informed about local safety issues
- Local authorities and community groups (potential future integration)

## Technical Stack

- **Frontend Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: OpenStreetMap (OSM)
- **Deployment**: Vercel

## Application Architecture

### Current Structure

```
lfg-hackathon/
├── app/
│   ├── api/route.ts          # API endpoints
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing/welcome page
│   └── globals.css           # Global styles
├── utils/supabase/           # Supabase client configuration
│   ├── client.ts
│   ├── middleware.ts
│   └── server.ts
└── [config files]
```

### MVP User Flow

1. **Welcome Screen** (`app/page.tsx`)

   - Landing page with "OpenCrimeReports" branding
   - Location search input (UK postcodes, streets, addresses)
   - "Use my location" button for geolocation
   - Navigation to map view

2. **Map View** (to be implemented)

   - Interactive OpenStreetMap display
   - Crime report markers/pins showing incident locations
   - Incident details on marker interaction
   - Prominent "Report Incident" button

3. **Report Form** (to be implemented)
   - Incident reporting form
   - Location capture (manual or GPS)
   - Incident type/category selection
   - Description field
   - Timestamp capture
   - Submit to Supabase database

## Database Schema (Planned)

```sql
-- Incidents table structure
incidents {
  id: uuid (primary key)
  location_lat: decimal
  location_lng: decimal
  address: text
  incident_type: text
  description: text
  reported_at: timestamp
  status: text (default: 'active')
}
```

## Key Features (MVP)

- **Location-based reporting**: GPS and manual location entry
- **Real-time mapping**: Live display of community reports
- **Simple incident categorization**: Basic crime/anti-social behavior types
- **Anonymous reporting**: No user registration required for MVP
- **Responsive design**: Mobile-first approach for on-the-go reporting

## Development Context

- **Event**: Growth Hackathon, London
- **Timeline**: Hackathon timeframe (typically 24-48 hours)
- **Goal**: Create functional MVP demonstrating core concept
- **Focus**: Community safety improvement across the UK

## Future Enhancement Opportunities

- User authentication and profiles
- Incident photo uploads
- Integration with local police/authorities
- Advanced filtering and search
- Incident status updates
- Community moderation features
- Analytics and crime pattern insights

## Design Philosophy

- **Simplicity**: Quick, easy reporting process
- **Accessibility**: Works on all devices, especially mobile
- **Community-focused**: Empowering citizens to improve local safety
- **Real-time**: Immediate visibility of reported incidents
- **UK-specific**: Tailored for UK addresses, postcodes, and context

## Current Implementation Status

- ✅ Landing page with location search
- ✅ Supabase integration setup
- ✅ Responsive design foundation
- 🔄 Map view (in development)
- 🔄 Report form (in development)
- 🔄 Database schema implementation

## Technical Notes

- Uses Next.js App Router
- Tailwind CSS for styling with mobile-first responsive design
- OpenStreetMap chosen for cost-effectiveness and open-source nature
- Supabase provides real-time database capabilities for live map updates

This project represents a civic technology solution aimed at leveraging community participation to enhance public safety awareness and incident reporting across the UK.
