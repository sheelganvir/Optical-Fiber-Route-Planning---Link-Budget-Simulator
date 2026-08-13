-- Optical Fiber Route Planning & Link Budget Simulator
-- PostgreSQL Migration & Schema Definition for Supabase

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  organization TEXT DEFAULT 'Telecom Engineering',
  role TEXT DEFAULT 'Network Planning Engineer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Telecom Sites Table
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  site_code TEXT NOT NULL UNIQUE,
  site_type TEXT NOT NULL CHECK (site_type IN ('POP', 'Data Center', 'Customer Site', 'Base Station', 'NOC', 'Aggregation Site')),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fiber Profiles Table
CREATE TABLE IF NOT EXISTS public.fiber_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fiber_type TEXT NOT NULL, -- Single Mode G.652D, Single Mode G.655, Custom
  wavelength_nm INT NOT NULL, -- 1310, 1550, 1625
  attenuation_db_km DOUBLE PRECISION NOT NULL, -- 0.35, 0.22, etc.
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fiber Routes Table
CREATE TABLE IF NOT EXISTS public.fiber_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_site_id UUID REFERENCES public.sites(id) ON DELETE RESTRICT,
  destination_site_id UUID REFERENCES public.sites(id) ON DELETE RESTRICT,
  route_name TEXT NOT NULL,
  distance_km DOUBLE PRECISION NOT NULL DEFAULT 0,
  number_of_segments INT DEFAULT 1,
  number_of_splices INT DEFAULT 0,
  number_of_connectors INT DEFAULT 4,
  estimated_cost DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'FEASIBLE', 'UNFEASIBLE', 'COMMISSIONED')),
  geometry JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of [lat, lng] coordinates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Route Points Table
CREATE TABLE IF NOT EXISTS public.route_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES public.fiber_routes(id) ON DELETE CASCADE,
  sequence_index INT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  point_type TEXT DEFAULT 'WAYPOINT' CHECK (point_type IN ('SOURCE', 'WAYPOINT', 'SPLICE_POINT', 'DESTINATION')),
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Site Readiness Checklist Table
CREATE TABLE IF NOT EXISTS public.site_readiness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID UNIQUE REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  coordinates_confirmed BOOLEAN DEFAULT FALSE,
  power_availability BOOLEAN DEFAULT FALSE,
  equipment_space_available BOOLEAN DEFAULT FALSE,
  existing_duct_available BOOLEAN DEFAULT FALSE,
  fiber_termination_available BOOLEAN DEFAULT FALSE,
  access_permission BOOLEAN DEFAULT FALSE,
  safety_clearance BOOLEAN DEFAULT FALSE,
  readiness_score INT DEFAULT 0, -- 0 to 100%
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('READY', 'PENDING', 'BLOCKED')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Link Calculations Table (History)
CREATE TABLE IF NOT EXISTS public.link_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.fiber_routes(id) ON DELETE SET NULL,
  fiber_profile_id UUID REFERENCES public.fiber_profiles(id) ON DELETE SET NULL,
  fiber_length DOUBLE PRECISION NOT NULL,
  attenuation DOUBLE PRECISION NOT NULL,
  splice_count INT NOT NULL,
  splice_loss DOUBLE PRECISION NOT NULL,
  connector_count INT NOT NULL,
  connector_loss DOUBLE PRECISION NOT NULL,
  additional_loss DOUBLE PRECISION NOT NULL DEFAULT 0,
  tx_power DOUBLE PRECISION NOT NULL,
  rx_sensitivity DOUBLE PRECISION NOT NULL,
  physical_loss DOUBLE PRECISION NOT NULL,
  received_power DOUBLE PRECISION NOT NULL,
  link_margin DOUBLE PRECISION NOT NULL,
  safety_margin DOUBLE PRECISION NOT NULL,
  remaining_margin DOUBLE PRECISION NOT NULL,
  feasible BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Route Comparisons Table
CREATE TABLE IF NOT EXISTS public.route_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_site_id UUID REFERENCES public.sites(id),
  destination_site_id UUID REFERENCES public.sites(id),
  compared_routes JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_route_id UUID,
  ranking_weights JSONB DEFAULT '{"distanceWeight":0.3,"lossWeight":0.3,"costWeight":0.2,"spliceWeight":0.2}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Simulation Scenarios Table
CREATE TABLE IF NOT EXISTS public.simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'BASELINE',
  scenario_params JSONB NOT NULL,
  expected_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_title TEXT NOT NULL,
  calculation_id UUID REFERENCES public.link_calculations(id) ON DELETE SET NULL,
  report_data JSONB NOT NULL,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiber_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiber_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sites Policies
CREATE POLICY "Users can CRUD own sites" ON public.sites FOR ALL USING (auth.uid() = user_id);

-- Fiber Profiles Policies
CREATE POLICY "Users can CRUD own fiber profiles" ON public.fiber_profiles FOR ALL USING (auth.uid() = user_id);

-- Fiber Routes Policies
CREATE POLICY "Users can CRUD own fiber routes" ON public.fiber_routes FOR ALL USING (auth.uid() = user_id);

-- Site Readiness Policies
CREATE POLICY "Users can CRUD own site readiness" ON public.site_readiness FOR ALL USING (auth.uid() = user_id);

-- Calculations Policies
CREATE POLICY "Users can CRUD own calculations" ON public.link_calculations FOR ALL USING (auth.uid() = user_id);

-- Route Comparisons Policies
CREATE POLICY "Users can CRUD own comparisons" ON public.route_comparisons FOR ALL USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can CRUD own reports" ON public.reports FOR ALL USING (auth.uid() = user_id);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON public.sites(user_id);
CREATE INDEX IF NOT EXISTS idx_fiber_routes_user_id ON public.fiber_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_link_calculations_user_id ON public.link_calculations(user_id);
