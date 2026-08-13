"use client";

import { useState, useEffect } from "react";
import { fetchFiberProfiles, saveFiberProfile } from "@/lib/supabase/client";
import { FiberProfile } from "@/lib/types/database";
import { Sliders, Plus, CheckCircle, Info, Sparkles } from "lucide-react";

export default function FiberProfilesPage() {
  const [profiles, setProfiles] = useState<FiberProfile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<FiberProfile>>({
    name: "Custom Ultra-Low-Loss Fiber (1550 nm)",
    fiber_type: "Single Mode G.654.E",
    wavelength_nm: 1550,
    attenuation_db_km: 0.17,
    description: "Custom ultra low attenuation profile engineered for long-haul DWDM links.",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const list = await fetchFiberProfiles();
    setProfiles(list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfile.name) return;
    await saveFiberProfile(newProfile as any);
    setModalOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" /> ITU-T Fiber Specifications
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Optical Fiber Cable Profiles & Wavelength Attenuations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure single-mode fiber types (G.652D, G.655, G.654.E) and operational transmission windows.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add Custom Fiber Profile
        </button>
      </div>

      {/* Engineering Disclaimer Alert Box */}
      <div className="p-4 bg-slate-900/80 border border-sky-500/30 rounded-xl flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-slate-300">
          <strong className="font-semibold text-slate-100">Engineering Simulation Disclaimer:</strong> Attenuation values (e.g. 0.35 dB/km @ 1310nm, 0.22 dB/km @ 1550nm) represent ITU-T industry standard assumptions for link planning. Actual deployed link loss varies depending on cable reel specs, environmental macrobending, and field OTDR measurement.
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">{p.fiber_type}</span>
                <h3 className="font-bold text-slate-100 text-sm mt-0.5">{p.name}</h3>
              </div>
              {p.is_default && (
                <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-mono font-bold">
                  DEFAULT
                </span>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Wavelength</span>
                <span className="font-bold text-amber-400 text-sm">{p.wavelength_nm} nm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Attenuation</span>
                <span className="font-bold text-emerald-400 text-sm">{p.attenuation_db_km} dB/km</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Custom Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">Add Custom Optical Fiber Specification</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Profile Name</label>
                <input
                  type="text"
                  required
                  value={newProfile.name || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Fiber Standard / Type</label>
                <input
                  type="text"
                  required
                  value={newProfile.fiber_type || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, fiber_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Wavelength (nm)</label>
                  <input
                    type="number"
                    required
                    value={newProfile.wavelength_nm || 1550}
                    onChange={(e) => setNewProfile({ ...newProfile, wavelength_nm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Attenuation (dB/km)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProfile.attenuation_db_km || 0.22}
                    onChange={(e) => setNewProfile({ ...newProfile, attenuation_db_km: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  value={newProfile.description || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
