"use client";

import { useEffect, useState } from "react";
import { Site, FiberRoute } from "@/lib/types/database";

interface FiberMapProps {
  sites: Site[];
  routes?: FiberRoute[];
  selectedSourceId?: string;
  selectedDestinationId?: string;
  onSelectSite?: (site: Site) => void;
  onAddPoint?: (lat: number, lng: number) => void;
  interactivePoints?: [number, number][];
  height?: string;
}

export function FiberMap(props: FiberMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="w-full bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2"
        style={{ height: props.height || "500px" }}
      >
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Initializing GIS Leaflet Map Engine...</span>
      </div>
    );
  }

  // Render Inner Map Component dynamically on client
  return <ClientLeafletMap {...props} />;
}

function ClientLeafletMap({
  sites,
  routes = [],
  selectedSourceId,
  selectedDestinationId,
  onSelectSite,
  onAddPoint,
  interactivePoints = [],
  height = "500px",
}: FiberMapProps) {
  // Dynamically import Leaflet inside client hook
  const [LModule, setLModule] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setLModule(leaflet.default);
    });
  }, []);

  if (!LModule) {
    return (
      <div
        className="w-full bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2"
        style={{ height }}
      >
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading OpenStreetMap Tile Layers...</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } = require("react-leaflet");

  // Center map on Bengaluru (12.9716, 77.5946) or first site
  const defaultCenter: [number, number] =
    sites.length > 0 ? [sites[0].latitude, sites[0].longitude] : [12.9716, 77.5946];

  // Helper to create custom SVG markers for Leaflet
  const createSiteIcon = (type: string, isSelected: boolean) => {
    let color = "#0284c7"; // default sky blue
    if (type === "POP") color = "#0ea5e9";
    if (type === "Data Center") color = "#8b5cf6";
    if (type === "NOC") color = "#f59e0b";
    if (type === "Base Station") color = "#10b981";
    if (type === "Customer Site") color = "#ec4899";

    if (isSelected) color = "#fbbf24";

    return LModule.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="
          background-color: ${color};
          width: ${isSelected ? "22px" : "16px"};
          height: ${isSelected ? "22px" : "16px"};
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px ${color};
          cursor: pointer;
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Component to handle map clicks for route drawing
  function MapClickHandler() {
    useMapEvents({
      click(e: any) {
        if (onAddPoint) {
          onAddPoint(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      <MapContainer center={defaultCenter} zoom={11} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        {/* Site Markers */}
        {sites.map((site) => {
          const isSource = site.id === selectedSourceId;
          const isDest = site.id === selectedDestinationId;
          const isSelected = isSource || isDest;

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={createSiteIcon(site.site_type, isSelected)}
              eventHandlers={{
                click: () => onSelectSite && onSelectSite(site),
              }}
            >
              <Popup>
                <div className="p-1 text-slate-900 font-sans text-xs">
                  <div className="font-bold text-sm text-sky-900 mb-0.5">{site.site_name}</div>
                  <div className="font-mono text-[11px] text-slate-600 font-semibold mb-1">
                    [{site.site_code}] • {site.site_type}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    📍 {site.city}, {site.state}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 mt-1">
                    {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Saved Polyline Routes */}
        {routes.map((route) => {
          if (!route.geometry || route.geometry.length < 2) return null;
          const color = route.status === "UNFEASIBLE" ? "#ef4444" : "#10b981";
          return (
            <Polyline
              key={route.id}
              positions={route.geometry}
              pathOptions={{
                color: color,
                weight: 4,
                opacity: 0.8,
                dashArray: route.status === "UNFEASIBLE" ? "6, 6" : undefined,
              }}
            >
              <Popup>
                <div className="text-slate-900 text-xs">
                  <div className="font-bold text-slate-900">{route.route_name}</div>
                  <div className="font-mono text-[11px] text-slate-600">
                    Distance: {route.distance_km} km | Status: {route.status}
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Active Interactive Draw Points Polyline */}
        {interactivePoints.length >= 2 && (
          <Polyline
            positions={interactivePoints}
            pathOptions={{
              color: "#38bdf8",
              weight: 5,
              opacity: 0.9,
              dashArray: "4, 4",
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1.5 shadow-lg">
        <div className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-1">GIS Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
          <span className="text-slate-300">POP / Switch</span>
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block ml-2"></span>
          <span className="text-slate-300">Data Center</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Base Station</span>
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block ml-2"></span>
          <span className="text-slate-300">Customer Site</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="w-4 h-1 bg-emerald-500 rounded"></span>
          <span className="text-slate-300">Feasible Link</span>
          <span className="w-4 h-1 bg-rose-500 rounded ml-2"></span>
          <span className="text-slate-300">Unfeasible Link</span>
        </div>
      </div>
    </div>
  );
}
