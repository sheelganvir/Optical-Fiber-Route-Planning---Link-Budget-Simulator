"use client";

import { useState, useEffect } from "react";
import { fetchSites, fetchSiteReadiness, updateSiteReadiness } from "@/lib/supabase/client";
import { Site, SiteReadiness } from "@/lib/types/database";
import { CheckCircle2, AlertTriangle, ShieldAlert, Check, X, ShieldCheck } from "lucide-react";

export default function SiteReadinessPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [readinessList, setReadinessList] = useState<SiteReadiness[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [s, r] = await Promise.all([fetchSites(), fetchSiteReadiness()]);
    setSites(s);
    setReadinessList(r);
  };

  const handleToggle = async (record: SiteReadiness, field: keyof SiteReadiness) => {
    const updatedRecord = { ...record, [field]: !record[field] };

    // Calculate score
    const items = [
      updatedRecord.coordinates_confirmed,
      updatedRecord.power_availability,
      updatedRecord.equipment_space_available,
      updatedRecord.existing_duct_available,
      updatedRecord.fiber_termination_available,
      updatedRecord.access_permission,
      updatedRecord.safety_clearance,
    ];
    const checkedCount = items.filter(Boolean).length;
    const score = Math.round((checkedCount / 7) * 100);

    let status: "READY" | "PENDING" | "BLOCKED" = "PENDING";
    if (score === 100) status = "READY";
    else if (score < 50) status = "BLOCKED";

    updatedRecord.readiness_score = score;
    updatedRecord.status = status;

    await updateSiteReadiness(updatedRecord);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Site Infrastructure Readiness
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Site Deployment Readiness Checklist & Audit Scores
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit civil duct access, rack space, power availability, safety clearances & municipal permissions before fiber installation.
          </p>
        </div>
      </div>

      {/* Grid of Site Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sites.map((site) => {
          const rec = readinessList.find((r) => r.site_id === site.id) || {
            id: `sr-${site.id}`,
            site_id: site.id,
            coordinates_confirmed: true,
            power_availability: true,
            equipment_space_available: false,
            existing_duct_available: false,
            fiber_termination_available: false,
            access_permission: false,
            safety_clearance: false,
            readiness_score: 28,
            status: "PENDING",
            notes: "Pending infrastructure audit",
            updated_at: new Date().toISOString(),
          };

          return (
            <div key={site.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">{site.site_code}</span>
                  <h3 className="font-bold text-slate-100 text-sm">{site.site_name}</h3>
                  <div className="text-xs text-slate-400">{site.city}, {site.state} • {site.site_type}</div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold font-mono text-emerald-400">{rec.readiness_score}%</div>
                  {rec.status === "READY" && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> DEPLOYMENT READY
                    </span>
                  )}
                  {rec.status === "PENDING" && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> AUDIT PENDING
                    </span>
                  )}
                  {rec.status === "BLOCKED" && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> BLOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* 7 Readiness Checklist Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <CheckItem
                  label="Site coordinates confirmed"
                  checked={rec.coordinates_confirmed}
                  onClick={() => handleToggle(rec as any, "coordinates_confirmed")}
                />
                <CheckItem
                  label="Power availability (AC/DC)"
                  checked={rec.power_availability}
                  onClick={() => handleToggle(rec as any, "power_availability")}
                />
                <CheckItem
                  label="Equipment rack space"
                  checked={rec.equipment_space_available}
                  onClick={() => handleToggle(rec as any, "equipment_space_available")}
                />
                <CheckItem
                  label="Existing duct available"
                  checked={rec.existing_duct_available}
                  onClick={() => handleToggle(rec as any, "existing_duct_available")}
                />
                <CheckItem
                  label="Fiber termination point"
                  checked={rec.fiber_termination_available}
                  onClick={() => handleToggle(rec as any, "fiber_termination_available")}
                />
                <CheckItem
                  label="Site access permission"
                  checked={rec.access_permission}
                  onClick={() => handleToggle(rec as any, "access_permission")}
                />
                <CheckItem
                  label="Safety & ROW clearance"
                  checked={rec.safety_clearance}
                  onClick={() => handleToggle(rec as any, "safety_clearance")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-lg border text-left transition ${
        checked
          ? "bg-slate-950 border-emerald-500/40 text-slate-200"
          : "bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700"
      }`}
    >
      <span className="font-medium text-[11px]">{label}</span>
      <div className={`p-0.5 rounded ${checked ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"}`}>
        {checked ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
}
