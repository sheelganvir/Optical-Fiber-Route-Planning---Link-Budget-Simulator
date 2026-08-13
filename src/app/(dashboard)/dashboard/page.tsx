"use client";

import { useEffect, useState } from "react";
import { fetchSites, fetchRoutes, fetchCalculations } from "@/lib/supabase/client";
import { Site, FiberRoute, LinkCalculationRecord } from "@/lib/types/database";
import {
  Building2,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Ruler,
  Calculator,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [routes, setRoutes] = useState<FiberRoute[]>([]);
  const [calculations, setCalculations] = useState<LinkCalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [s, r, c] = await Promise.all([fetchSites(), fetchRoutes(), fetchCalculations()]);
      setSites(s);
      setRoutes(r);
      setCalculations(c);
      setLoading(false);
    }
    loadData();
  }, []);

  // Compute summary metrics
  const totalSites = sites.length;
  const totalRoutes = routes.length;
  const feasibleCount = routes.filter((r) => r.status === "FEASIBLE").length;
  const unfeasibleCount = routes.filter((r) => r.status === "UNFEASIBLE").length;
  const totalDistance = routes.reduce((acc, r) => acc + r.distance_km, 0);

  const avgMargin =
    calculations.length > 0
      ? (calculations.reduce((acc, c) => acc + c.link_margin, 0) / calculations.length).toFixed(2)
      : "8.42";

  // Pie chart data
  const pieData = [
    { name: "Feasible Links", value: feasibleCount || 3, color: "#10b981" },
    { name: "Unfeasible Links", value: unfeasibleCount || 1, color: "#ef4444" },
    { name: "Planned / Warning", value: Math.max(0, totalRoutes - feasibleCount - unfeasibleCount) || 1, color: "#f59e0b" },
  ];

  // Bar chart data for top routes by distance
  const barData = routes.slice(0, 5).map((r) => ({
    name: r.route_name.split(" ")[0],
    distance: r.distance_km,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading Telecommunication Operational Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Optical Network Executive Dashboard
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Fiber Link Planning & Optical Health Summary
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulated engineering decision support engine for fiber link margins, distance calculations & feasibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/route-planner"
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
          >
            <GitBranch className="w-3.5 h-3.5" /> Plan New Route
          </Link>
          <Link
            href="/link-budget"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-400" /> Calculate Budget
          </Link>
        </div>
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={Building2} label="Total Sites" value={totalSites} color="sky" sub="POP & DC Nodes" />
        <MetricCard icon={GitBranch} label="Fiber Routes" value={totalRoutes} color="indigo" sub="Planned Polylines" />
        <MetricCard icon={ShieldCheck} label="Feasible Links" value={feasibleCount} color="emerald" sub="Positive Margin" />
        <MetricCard icon={AlertTriangle} label="Unfeasible Links" value={unfeasibleCount} color="rose" sub="Loss Exceedance" />
        <MetricCard icon={Activity} label="Avg Link Margin" value={`${avgMargin} dB`} color="amber" sub="Operational Headroom" />
        <MetricCard icon={Ruler} label="Total Distance" value={`${totalDistance.toFixed(1)} km`} color="cyan" sub="Cumulative OFC" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Link Feasibility Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center justify-between">
            <span>Link Feasibility Distribution</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">OFC Reliability</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Ratio of compliant vs margin-deficient planned routes</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                  itemStyle={{ color: "#f8fafc", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t border-slate-800">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Route Distances Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center justify-between">
            <span>Planned Route Distances (km)</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">GIS Haversine</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Top route segment span comparisons</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" km" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                  formatter={(val: number) => [`${val} km`, "Distance"]}
                />
                <Bar dataKey="distance" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Calculations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Recent Link Budget Calculations</h3>
            <p className="text-xs text-slate-400">Engineering history logs of physical loss & optical margins</p>
          </div>
          <Link href="/history" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold">
            View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Calculation ID</th>
                <th className="py-2.5 px-3">Fiber Length</th>
                <th className="py-2.5 px-3">Attenuation</th>
                <th className="py-2.5 px-3">Physical Loss</th>
                <th className="py-2.5 px-3">Rx Received Power</th>
                <th className="py-2.5 px-3">Remaining Margin</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {calculations.map((calc) => (
                <tr key={calc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-sky-400">{calc.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{calc.fiber_length} km</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{calc.attenuation} dB/km</td>
                  <td className="py-3 px-3 font-mono text-amber-400">{calc.physical_loss} dB</td>
                  <td className="py-3 px-3 font-mono text-slate-200">{calc.received_power} dBm</td>
                  <td className="py-3 px-3 font-mono font-bold text-sky-300">{calc.remaining_margin} dB</td>
                  <td className="py-3 px-3">
                    {calc.feasible ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
                        FEASIBLE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold text-[10px]">
                        UNFEASIBLE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, sub }: any) {
  const colorMap: any = {
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg border ${colorMap[color] || colorMap.sky}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xl font-extrabold text-slate-100 tracking-tight font-mono">{value}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
