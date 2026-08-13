"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Info, ShieldCheck, DollarSign } from "lucide-react";

export default function SettingsPage() {
  const [costPerKm, setCostPerKm] = useState(15000);
  const [costPerSplice, setCostPerSplice] = useState(500);
  const [costPerConnector, setCostPerConnector] = useState(1200);
  const [sitePrepCost, setSitePrepCost] = useState(50000);
  const [currency, setCurrency] = useState("INR");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <SettingsIcon className="w-3.5 h-3.5" /> Engine Configuration & Assumptions
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Deployment Cost & Engineering System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure unit cost baselines, currency standards & review optical simulation assumptions.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> System settings & cost baselines updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Cost Baselines Form */}
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl text-xs">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Deployment Unit Cost Estimates Baseline
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Currency Standard</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
            >
              <option value="INR">INR (Indian Rupee ₹)</option>
              <option value="USD">USD (US Dollar $)</option>
              <option value="EUR">EUR (Euro €)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Cost per km Fiber</label>
              <input
                type="number"
                value={costPerKm}
                onChange={(e) => setCostPerKm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Cost per Fusion Splice</label>
              <input
                type="number"
                value={costPerSplice}
                onChange={(e) => setCostPerSplice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Cost per Connector Port</label>
              <input
                type="number"
                value={costPerConnector}
                onChange={(e) => setCostPerConnector(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Site Prep / Civil Cost</label>
              <input
                type="number"
                value={sitePrepCost}
                onChange={(e) => setSitePrepCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs shadow-md flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> Save Default Settings
            </button>
          </div>
        </form>

        {/* Right Column: Section 32 Mandatory Engineering Assumptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl text-xs">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            Engineering Assumptions & Standards Credibility
          </h3>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            <p>
              <strong className="text-slate-100">1. Attenuation Coefficients:</strong> Default attenuation figures (0.35 dB/km @ 1310 nm, 0.22 dB/km @ 1550 nm) represent configurable simulation assumptions based on ITU-T G.652D standards.
            </p>
            <p>
              <strong className="text-slate-100">2. Fusion Splice & Connector Losses:</strong> Standard loss per fusion splice is set to 0.10 dB and connector insertion loss is set to 0.50 dB. Actual field values depend on splice alignment and clean connector end-faces.
            </p>
            <p>
              <strong className="text-slate-100">3. GIS Route Distance vs Cable Slack:</strong> Distance calculations use the Haversine formula over map polyline coordinates. Real field deployments require adding 3%–5% extra cable length for slack loops and vertical elevation drops.
            </p>
            <p>
              <strong className="text-slate-100">4. Decision Support Role:</strong> This simulator serves as a high-level network planning and decision-support tool. It does not replace field physical surveys, optical time-domain reflectometer (OTDR) testing, or vendor equipment commissioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
