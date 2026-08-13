"use client";

import { useState, useEffect } from "react";
import { fetchScenarios } from "@/lib/supabase/client";
import { ScenarioPreset } from "@/lib/types/database";
import { calculateLinkBudget } from "@/lib/calculations/link-budget";
import { FlaskConical, Play, ShieldCheck, AlertOctagon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioPreset[]>([]);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await fetchScenarios();
    setScenarios(data);
  };

  const handleRunScenario = (sc: ScenarioPreset) => {
    const p = sc.scenario_params;
    router.push(
      `/link-budget?demo=true&length=${p.fiberLength}&attenuation=${p.attenuation}&splices=${p.spliceCount}&connectors=${p.connectorCount}&tx=${p.txPower}&rx=${p.rxSensitivity}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" /> Telecom Field Simulation Library
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Preset Fiber Deployment Engineering Scenarios
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Preconfigured optical field conditions demonstrating distance decay, splice degradation & wavelength upgrades.
          </p>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => {
          const result = calculateLinkBudget(sc.scenario_params);

          return (
            <div key={sc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">{sc.category}</span>
                    <h3 className="font-bold text-slate-100 text-sm mt-0.5">{sc.title}</h3>
                  </div>
                  {result.feasible ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> FEASIBLE
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> NOT FEASIBLE
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400">{sc.description}</p>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Distance</span>
                    <span className="font-bold text-slate-200">{sc.scenario_params.fiberLength} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Loss</span>
                    <span className="font-bold text-amber-400">{result.physicalLoss} dB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Margin</span>
                    <span className={`font-bold ${result.feasible ? "text-emerald-400" : "text-rose-400"}`}>
                      {result.remainingMargin} dB
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5 pt-1">
                  <span>Expected Outcome:</span>
                  <span className="text-sky-300 font-mono">{sc.expected_outcome}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleRunScenario(sc)}
                  className="w-full py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Scenario in Link Engine
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
