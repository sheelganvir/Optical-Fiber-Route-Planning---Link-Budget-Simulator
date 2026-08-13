export type SiteType =
  | "POP"
  | "Data Center"
  | "Customer Site"
  | "Base Station"
  | "NOC"
  | "Aggregation Site";

export type ReadinessStatus = "READY" | "PENDING" | "BLOCKED";
export type RouteStatus = "PLANNED" | "FEASIBLE" | "UNFEASIBLE" | "COMMISSIONED";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  organization: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  user_id?: string;
  site_name: string;
  site_code: string;
  site_type: SiteType;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FiberProfile {
  id: string;
  user_id?: string;
  name: string;
  fiber_type: string;
  wavelength_nm: number;
  attenuation_db_km: number;
  description: string;
  is_default: boolean;
  created_at: string;
}

export interface FiberRoute {
  id: string;
  user_id?: string;
  source_site_id: string;
  destination_site_id: string;
  route_name: string;
  distance_km: number;
  number_of_segments: number;
  number_of_splices: number;
  number_of_connectors: number;
  estimated_cost: number;
  status: RouteStatus;
  geometry: [number, number][]; // lat, lng pairs
  created_at: string;
  updated_at: string;
}

export interface SiteReadiness {
  id: string;
  site_id: string;
  user_id?: string;
  coordinates_confirmed: boolean;
  power_availability: boolean;
  equipment_space_available: boolean;
  existing_duct_available: boolean;
  fiber_termination_available: boolean;
  access_permission: boolean;
  safety_clearance: boolean;
  readiness_score: number; // 0 - 100
  status: ReadinessStatus;
  notes: string;
  updated_at: string;
}

export interface LinkCalculationRecord {
  id: string;
  user_id?: string;
  route_id?: string;
  fiber_profile_id?: string;
  fiber_length: number;
  attenuation: number;
  splice_count: number;
  splice_loss: number;
  connector_count: number;
  connector_loss: number;
  additional_loss: number;
  tx_power: number;
  rx_sensitivity: number;
  physical_loss: number;
  received_power: number;
  link_margin: number;
  safety_margin: number;
  remaining_margin: number;
  feasible: boolean;
  created_at: string;
}

export interface RouteComparisonRecord {
  id: string;
  user_id?: string;
  title: string;
  source_site_id: string;
  destination_site_id: string;
  compared_routes: any[];
  recommended_route_id?: string;
  created_at: string;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  description: string;
  category: string;
  scenario_params: {
    fiberLength: number;
    attenuation: number;
    spliceCount: number;
    spliceLoss: number;
    connectorCount: number;
    connectorLoss: number;
    additionalLoss: number;
    txPower: number;
    rxSensitivity: number;
    safetyMargin: number;
  };
  expected_outcome: string;
}
