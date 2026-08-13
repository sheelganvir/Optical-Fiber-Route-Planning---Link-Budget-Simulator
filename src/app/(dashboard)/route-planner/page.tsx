"use client";

import { useState, useEffect } from "react";
import { fetchSites, saveRoute, fetchRoutes } from "@/lib/supabase/client";
import { Site, FiberRoute } from "@/lib/types/database";
import { FiberMap } from "@/components/map/fiber-map";
import { calculateRouteDistance } from "@/lib/calculations/route-distance";
import { calculateLinkBudget } from "@/lib/calculations/link-budget";
import { calculateDeploymentCost } from "@/lib/calculations/cost-calculator";
import { GitBranch, MapPin, Calculator, Save, RefreshCw, CheckCircle, AlertTriangle, Layers } from "lucide-react";

export default function RoutePlannerPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [routes, setRoutes] = useState<FiberRoute[]>([]);
  const [sourceId, setSourceId] = useState<string>("");
  const [destId, setDestId] = useState<string>("");
  const [routeName, setRouteName] = useState<string>("");
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [splices, setSplices] = useState<number>(10);
  const [connectors, setConnectors] = useState<number>(4);
  const [wavelength, setWavelength] = useState<number>(1550);
  const [attenuation, setAttenuation] = useState<number>(0.22);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const [sList, rList] = await Promise.all([fetchSites(), fetchRoutes()]);
      setSites(sList);
      setRoutes(rList);
      if (sList.length >= 2) {
        setSourceId(sList[0].id);
        setDestId(sList[1].id);
        setRouteName(`${sList[0].site_code} to ${sList[1].site_code} Fiber Cable`);
        setWaypoints([
          [sList[0].latitude, sList[0].longitude],
          [sList[1].latitude, sList[1].longitude],
        ]);
      }
    }
    load();
  }, []);

  // Update waypoints when source or dest site dropdown changes
  const handleSourceChange = (id: string) => {
    setSourceId(id);
    const sourceSite = sites.find((s) => s.id === id);
    const destSite = sites.find((s) => s.id === destId);
    if (sourceSite && destSite) {
      setRouteName(`${sourceSite.site_code} to ${destSite.site_code} Fiber Cable`);
      setWaypoints([
        [sourceSite.latitude, sourceSite.longitude],
        [destSite.latitude, destSite.longitude],
      ]);
    }
  };

  const handleDestChange = (id: string) => {
    setDestId(id);
    const sourceSite = sites.find((s) => s.id === sourceId);
    const destSite = sites.find((s) => s.id === id);
    if (sourceSite && destSite) {
      setRouteName(`${sourceSite.site_code} to ${destSite.site_code} Fiber Cable`);
      setWaypoints([
        [sourceSite.latitude, sourceSite.longitude],
        [destSite.latitude, destSite.longitude],
      ]);
    }
  };

  // Add click waypoint on map
  const handleMapClick = (lat: number, lng: number) => {
    if (waypoints.length < 2) return;
    // Insert new point before the destination point
    const newPoints = [...waypoints];
    newPoints.splice(newPoints.length - 1, 0, [lat, lng]);
    setWaypoints(newPoints);
  };

  const resetWaypoints = () => {
    const s = sites.find((item) => item.id === sourceId);
    const d = sites.find((item) => item.id === destId);
    if (s && d) {
      setWaypoints([
        [s.latitude, s.longitude],
        [d.latitude, d.longitude],
      ]);
    }
  };

  // Distance calculation via Haversine
  const distanceKm = calculateRouteDistance(waypoints);

  // Link budget preview calculation
  const budgetPreview = calculateLinkBudget({
    fiberLength: distanceKm > 0 ? distanceKm : 1,
    attenuation: attenuation,
    spliceCount: splices,
    spliceLoss: 0.1,
    connectorCount: connectors,
    connectorLoss: 0.5,
    additionalLoss: 1.0,
    txPower: 3,
    rxSensitivity: -20,
    safetyMargin: 3,
  });

  // Cost calculation
  const costPreview = calculateDeploymentCost({
    distanceKm: distanceKm,
    spliceCount: splices,
    connectorCount: connectors,
    currency: "INR",
  });

  const handleSaveRoute = async () => {
    if (!sourceId || !destId || !routeName) return;
    setSaving(true);
    await saveRoute({
      source_site_id: sourceId,
      destination_site_id: destId,
      route_name: routeName,
      distance_km: distanceKm,
      number_of_segments: Math.max(1, waypoints.length - 1),
      number_of_splices: splices,
      number_of_connectors: connectors,
      estimated_cost: costPreview.totalCost,
      status: budgetPreview.feasible ? "FEASIBLE" : "UNFEASIBLE",
      geometry: waypoints,
    });
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    const updated = await fetchRoutes();
    setRoutes(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5" /> Interactive GIS Fiber Routing Engine
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Optical Route Planner & Haversine Distance Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click map points to introduce fiber slack waypoints, auto-calculate route span & verify optical link budget feasibility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Configuration Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-sky-400" />
            1. Endpoint Site Selection
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source Site (Transmitter Node)</label>
              <select
                value={sourceId}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.site_code} — {s.site_name} ({s.site_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Site (Receiver Node)</label>
              <select
                value={destId}
                onChange={(e) => handleDestChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.site_code} — {s.site_name} ({s.site_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Route Identifier Name</label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 pt-2">
            <Layers className="w-4 h-4 text-amber-400" />
            2. Fiber Cable Specifications
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Wavelength Window</label>
              <select
                value={wavelength}
                onChange={(e) => {
                  const wl = Number(e.target.value);
                  setWavelength(wl);
                  setAttenuation(wl === 1550 ? 0.22 : 0.35);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
              >
                <option value={1310}>1310 nm (Standard)</option>
                <option value={1550}>1550 nm (Low Loss)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Attenuation (dB/km)</label>
              <input
                type="number"
                step="0.01"
                value={attenuation}
                onChange={(e) => setAttenuation(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Splice Count</label>
              <input
                type="number"
                value={splices}
                onChange={(e) => setSplices(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Connector Count</label>
              <input
                type="number"
                value={connectors}
                onChange={(e) => setConnectors(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Real-time Engineering Preview Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Real-Time Engineering Feasibility</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Haversine Distance:</span>
              <span className="font-mono font-bold text-sky-400 text-sm">{distanceKm} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Physical Link Loss:</span>
              <span className="font-mono text-amber-400 text-xs">{budgetPreview.physicalLoss} dB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Remaining Safety Margin:</span>
              <span className={`font-mono text-xs font-bold ${budgetPreview.feasible ? "text-emerald-400" : "text-rose-400"}`}>
                {budgetPreview.remainingMargin} dB
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="text-xs text-slate-400">Estimated Cost:</span>
              <span className="font-mono font-bold text-slate-200 text-xs">{costPreview.formattedTotal}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSaveRoute}
              disabled={saving}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Planned Route"}</span>
            </button>
            <button
              onClick={resetWaypoints}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
              title="Reset intermediate waypoints"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Route geometry & link budget successfully saved to database!
            </div>
          )}
        </div>

        {/* Right Column: GIS Leaflet Map & Interactive Waypoints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                Interactive Route Polyline Geometry
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Waypoints Count: {waypoints.length}
              </span>
            </div>

            <FiberMap
              sites={sites}
              routes={routes}
              selectedSourceId={sourceId}
              selectedDestinationId={destId}
              interactivePoints={waypoints}
              onAddPoint={handleMapClick}
              height="480px"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              💡 Tip: Click anywhere on the GIS map to add intermediate cable slack waypoints between source & destination nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
