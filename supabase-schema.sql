-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.report_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_path text,
  uploaded_at timestamp without time zone,
  CONSTRAINT report_photos_pkey PRIMARY KEY (id),
  CONSTRAINT report_photos_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  incident_date timestamp without time zone,
  raw_text text,
  is_anonymous boolean,
  shared_with_crimestoppers boolean,
  status text,
  location USER-DEFINED,
  crime_type text,
  location_hint text,
  postcode text,
  time_known boolean,
  time_description text,
  people_description text,
  people_names text,
  people_appearance text,
  people_contact_info text,
  has_vehicle boolean,
  has_weapon boolean,
  user_id uuid NOT NULL,
  ai_summary text,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.users (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);