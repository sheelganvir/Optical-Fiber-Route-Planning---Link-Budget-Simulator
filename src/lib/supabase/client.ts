import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Site,
  FiberProfile,
  FiberRoute,
  SiteReadiness,
  LinkCalculationRecord,
  ScenarioPreset,
} from "../types/database";
import {
  INITIAL_SITES,
  INITIAL_FIBER_PROFILES,
  INITIAL_ROUTES,
  INITIAL_READINESS,
  INITIAL_CALCULATIONS,
  PRESET_SCENARIOS,
} from "./mock-db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith("https://") &&
    supabaseAnonKey &&
    supabaseAnonKey !== "your-supabase-anon-key-here"
);

export const supabase = isSupabaseConfigured
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

// LOCAL STORAGE HYBRID STORAGE HELPER
const STORAGE_KEYS = {
  SITES: "ofc_sites",
  FIBER_PROFILES: "ofc_fiber_profiles",
  ROUTES: "ofc_routes",
  READINESS: "ofc_readiness",
  CALCULATIONS: "ofc_calculations",
};

function getLocalData<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// -------------------------------------------------------------
// SITES SERVICE
// -------------------------------------------------------------
export async function fetchSites(): Promise<Site[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("sites").select("*").order("created_at", { ascending: false });
    if (!error && data) return data as Site[];
  }
  return getLocalData<Site[]>(STORAGE_KEYS.SITES, INITIAL_SITES);
}

export async function saveSite(site: Omit<Site, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<Site> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    if (site.id) {
      const { data } = await supabase.from("sites").update({ ...site, updated_at: now }).eq("id", site.id).select().single();
      if (data) return data as Site;
    } else {
      const { data } = await supabase.from("sites").insert({ ...site, created_at: now, updated_at: now }).select().single();
      if (data) return data as Site;
    }
  }

  // Fallback
  const current = getLocalData<Site[]>(STORAGE_KEYS.SITES, INITIAL_SITES);
  if (site.id) {
    const updated = current.map((s) => (s.id === site.id ? { ...s, ...site, updated_at: now } : s));
    setLocalData(STORAGE_KEYS.SITES, updated);
    return updated.find((s) => s.id === site.id)!;
  } else {
    const newSite: Site = {
      ...site,
      id: `site-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    const updated = [newSite, ...current];
    setLocalData(STORAGE_KEYS.SITES, updated);

    // Auto-create readiness record
    const readinessList = getLocalData<SiteReadiness[]>(STORAGE_KEYS.READINESS, INITIAL_READINESS);
    readinessList.push({
      id: `sr-${newSite.id}`,
      site_id: newSite.id,
      coordinates_confirmed: true,
      power_availability: true,
      equipment_space_available: false,
      existing_duct_available: false,
      fiber_termination_available: false,
      access_permission: false,
      safety_clearance: false,
      readiness_score: 28,
      status: "PENDING",
      notes: "Newly created site. Pending infrastructure readiness audit.",
      updated_at: now,
    });
    setLocalData(STORAGE_KEYS.READINESS, readinessList);

    return newSite;
  }
}

export async function deleteSite(siteId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("sites").delete().eq("id", siteId);
    if (!error) return true;
  }

  const current = getLocalData<Site[]>(STORAGE_KEYS.SITES, INITIAL_SITES);
  const updated = current.filter((s) => s.id !== siteId);
  setLocalData(STORAGE_KEYS.SITES, updated);

  const readiness = getLocalData<SiteReadiness[]>(STORAGE_KEYS.READINESS, INITIAL_READINESS);
  setLocalData(
    STORAGE_KEYS.READINESS,
    readiness.filter((r) => r.site_id !== siteId)
  );

  return true;
}

// -------------------------------------------------------------
// FIBER PROFILES SERVICE
// -------------------------------------------------------------
export async function fetchFiberProfiles(): Promise<FiberProfile[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("fiber_profiles").select("*");
    if (!error && data) return data as FiberProfile[];
  }
  return getLocalData<FiberProfile[]>(STORAGE_KEYS.FIBER_PROFILES, INITIAL_FIBER_PROFILES);
}

export async function saveFiberProfile(profile: Omit<FiberProfile, "id" | "created_at"> & { id?: string }): Promise<FiberProfile> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    if (profile.id) {
      const { data } = await supabase.from("fiber_profiles").update(profile).eq("id", profile.id).select().single();
      if (data) return data as FiberProfile;
    } else {
      const { data } = await supabase.from("fiber_profiles").insert(profile).select().single();
      if (data) return data as FiberProfile;
    }
  }

  const current = getLocalData<FiberProfile[]>(STORAGE_KEYS.FIBER_PROFILES, INITIAL_FIBER_PROFILES);
  if (profile.id) {
    const updated = current.map((p) => (p.id === profile.id ? { ...p, ...profile } : p));
    setLocalData(STORAGE_KEYS.FIBER_PROFILES, updated);
    return updated.find((p) => p.id === profile.id)!;
  } else {
    const newProf: FiberProfile = {
      ...profile,
      id: `fp-${Date.now()}`,
      created_at: now,
    };
    const updated = [...current, newProf];
    setLocalData(STORAGE_KEYS.FIBER_PROFILES, updated);
    return newProf;
  }
}

// -------------------------------------------------------------
// FIBER ROUTES SERVICE
// -------------------------------------------------------------
export async function fetchRoutes(): Promise<FiberRoute[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("fiber_routes").select("*").order("created_at", { ascending: false });
    if (!error && data) return data as FiberRoute[];
  }
  return getLocalData<FiberRoute[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
}

export async function saveRoute(route: Omit<FiberRoute, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<FiberRoute> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    if (route.id) {
      const { data } = await supabase.from("fiber_routes").update({ ...route, updated_at: now }).eq("id", route.id).select().single();
      if (data) return data as FiberRoute;
    } else {
      const { data } = await supabase.from("fiber_routes").insert({ ...route, created_at: now, updated_at: now }).select().single();
      if (data) return data as FiberRoute;
    }
  }

  const current = getLocalData<FiberRoute[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
  if (route.id) {
    const updated = current.map((r) => (r.id === route.id ? { ...r, ...route, updated_at: now } : r));
    setLocalData(STORAGE_KEYS.ROUTES, updated);
    return updated.find((r) => r.id === route.id)!;
  } else {
    const newRoute: FiberRoute = {
      ...route,
      id: `route-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    const updated = [newRoute, ...current];
    setLocalData(STORAGE_KEYS.ROUTES, updated);
    return newRoute;
  }
}

export async function deleteRoute(routeId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("fiber_routes").delete().eq("id", routeId);
    if (!error) return true;
  }

  const current = getLocalData<FiberRoute[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
  const updated = current.filter((r) => r.id !== routeId);
  setLocalData(STORAGE_KEYS.ROUTES, updated);
  return true;
}

// -------------------------------------------------------------
// SITE READINESS SERVICE
// -------------------------------------------------------------
export async function fetchSiteReadiness(): Promise<SiteReadiness[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("site_readiness").select("*");
    if (!error && data) return data as SiteReadiness[];
  }
  return getLocalData<SiteReadiness[]>(STORAGE_KEYS.READINESS, INITIAL_READINESS);
}

export async function updateSiteReadiness(record: SiteReadiness): Promise<SiteReadiness> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("site_readiness").upsert({ ...record, updated_at: now }).select().single();
    if (data) return data as SiteReadiness;
  }

  const current = getLocalData<SiteReadiness[]>(STORAGE_KEYS.READINESS, INITIAL_READINESS);
  const updated = current.map((r) => (r.id === record.id ? { ...record, updated_at: now } : r));
  setLocalData(STORAGE_KEYS.READINESS, updated);
  return record;
}

// -------------------------------------------------------------
// CALCULATIONS HISTORY SERVICE
// -------------------------------------------------------------
export async function fetchCalculations(): Promise<LinkCalculationRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("link_calculations").select("*").order("created_at", { ascending: false });
    if (!error && data) return data as LinkCalculationRecord[];
  }
  return getLocalData<LinkCalculationRecord[]>(STORAGE_KEYS.CALCULATIONS, INITIAL_CALCULATIONS);
}

export async function saveCalculation(calc: Omit<LinkCalculationRecord, "id" | "created_at">): Promise<LinkCalculationRecord> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("link_calculations").insert({ ...calc, created_at: now }).select().single();
    if (data) return data as LinkCalculationRecord;
  }

  const current = getLocalData<LinkCalculationRecord[]>(STORAGE_KEYS.CALCULATIONS, INITIAL_CALCULATIONS);
  const newCalc: LinkCalculationRecord = {
    ...calc,
    id: `calc-${Date.now()}`,
    created_at: now,
  };
  const updated = [newCalc, ...current];
  setLocalData(STORAGE_KEYS.CALCULATIONS, updated);
  return newCalc;
}

export async function deleteCalculation(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("link_calculations").delete().eq("id", id);
    if (!error) return true;
  }

  const current = getLocalData<LinkCalculationRecord[]>(STORAGE_KEYS.CALCULATIONS, INITIAL_CALCULATIONS);
  setLocalData(
    STORAGE_KEYS.CALCULATIONS,
    current.filter((c) => c.id !== id)
  );
  return true;
}

// -------------------------------------------------------------
// PRESET SCENARIOS
// -------------------------------------------------------------
export async function fetchScenarios(): Promise<ScenarioPreset[]> {
  return PRESET_SCENARIOS;
}
