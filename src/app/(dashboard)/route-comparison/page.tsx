"use client";

import { useState, useEffect } from "react";
import { fetchRoutes } from "@/lib/supabase/client";
import { FiberRoute } from "@/lib/types/database";
import { rankRoutes, DEFAULT_RANKING_WEIGHTS, RankingWeights } from "@/lib/calculations/route-ranking";
import { calculateLinkBudget } from "@/lib/calculations/link-budget";
import { GitCompare, Trophy, Award, Sliders, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function RouteComparisonPage() {
  const [routes, setRoutes] = useState<FiberRoute[]>([]);
  const [weights, setWeights] = useState<RankingWeights>(DEFAULT_RANKING_WEIGHTS);

  useEffect(() => {
    async function load() {
      const r = await fetchRoutes();
      setRoutes(r);
    }
    load();
  }, []);

  // Compute calculated values for candidate comparison routes
  const candidateInputs = routes.map((r) => {
    const budget = calculateLinkBudget({
      fiberLength: r.distance_km,
      attenuation: 0.22,
      spliceCount: r.number_of_splices,
      spliceLoss: 0.1,
      connectorCount: r.number_of_connectors,
      connectorLoss: 0.5,
      additionalLoss: 1.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });

    return {
      id: r.id,
      name: r.route_name,
      distanceKm: r.distance_km,
      physicalLossDb: budget.physicalLoss,
      spliceCount: r.number_of_splices,
      connectorCount: r.number_of_connectors,
      estimatedCost: r.estimated_cost,
      feasible: budget.feasible,
      linkMarginDb: budget.linkMargin,
    };
  });

  const rankedResults = rankRoutes(candidateInputs, weights);
  const winner = rankedResults.length > 0 ? rankedResults[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <GitCompare className="w-3.5 h-3.5" /> Decision Support Matrix
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Route Comparison & Multi-Objective Ranking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate alternative fiber paths based on distance, optical attenuation, splice counts, and estimated deployment costs.
          </p>
        </div>
      </div>

      {/* Winner Recommendation Card */}
      {winner && (
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/40 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                RECOMMENDED OPTIMAL ROUTE (RANK #1)
              </div>
              <h3 className="text-lg font-extrabold text-slate-100 mt-0.5">{winner.routeName}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
                <span>Distance: <strong className="font-mono text-sky-400">{winner.distanceKm} km</strong></span>
                <span>Loss: <strong className="font-mono text-amber-400">{winner.physicalLossDb} dB</strong></span>
                <span>Margin: <strong className="font-mono text-emerald-400">{winner.linkMarginDb} dB</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono">SIMULATION SCORE</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">{winner.score} / 100</div>
            <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
              {winner.keyReasons.slice(0, 2).map((r, i) => (
                <div key={i}>{r}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weight Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-sky-400" />
          Ranking Algorithm Weight Configuration
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Distance Weight: <span className="font-mono font-bold text-sky-400">{Math.round(weights.distanceWeight * 100)}%</span></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.distanceWeight}
              onChange={(e) => setWeights({ ...weights, distanceWeight: Number(e.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Optical Loss Weight: <span className="font-mono font-bold text-amber-400">{Math.round(weights.lossWeight * 100)}%</span></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.lossWeight}
              onChange={(e) => setWeights({ ...weights, lossWeight: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Deployment Cost Weight: <span className="font-mono font-bold text-emerald-400">{Math.round(weights.costWeight * 100)}%</span></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.costWeight}
              onChange={(e) => setWeights({ ...weights, costWeight: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Splice Count Weight: <span className="font-mono font-bold text-purple-400">{Math.round(weights.spliceWeight * 100)}%</span></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.spliceWeight}
              onChange={(e) => setWeights({ ...weights, spliceWeight: Number(e.target.value) })}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="font-bold text-sm text-slate-100 mb-4">Route Matrix Comparative Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Route Identifier</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Physical Loss</th>
                <th className="py-3 px-3">Splices</th>
                <th className="py-3 px-3">Link Margin</th>
                <th className="py-3 px-3">Est. Deployment Cost</th>
                <th className="py-3 px-3">Feasibility</th>
                <th className="py-3 px-3">Decision Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rankedResults.map((r) => (
                <tr key={r.routeId} className={r.rank === 1 ? "bg-sky-950/30 border-l-4 border-sky-500" : "hover:bg-slate-800/40"}>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-400 text-sm">#{r.rank}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-100">{r.routeName}</td>
                  <td className="py-3.5 px-3 font-mono text-sky-300">{r.distanceKm} km</td>
                  <td className="py-3.5 px-3 font-mono text-amber-300">{r.physicalLossDb} dB</td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">{r.spliceCount}</td>
                  <td className="py-3.5 px-3 font-mono text-emerald-300">{r.linkMarginDb} dB</td>
                  <td className="py-3.5 px-3 font-mono text-slate-200">₹{r.estimatedCost.toLocaleString()}</td>
                  <td className="py-3.5 px-3">
                    {r.feasible ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
                        FEASIBLE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold text-[10px]">
                        NOT FEASIBLE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-extrabold text-sm text-sky-400">{r.score} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
