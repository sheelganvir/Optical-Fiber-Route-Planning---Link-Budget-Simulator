"use client";

import { useState, useEffect } from "react";
import { fetchCalculations, deleteCalculation } from "@/lib/supabase/client";
import { LinkCalculationRecord } from "@/lib/types/database";
import { History, Search, Play, Trash2, ShieldCheck, AlertOctagon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CalculationHistoryPage() {
  const [history, setHistory] = useState<LinkCalculationRecord[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await fetchCalculations();
    setHistory(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this calculation record?")) {
      await deleteCalculation(id);
      load();
    }
  };

  const handleRerun = (calc: LinkCalculationRecord) => {
    router.push(
      `/link-budget?length=${calc.fiber_length}&attenuation=${calc.attenuation}&splices=${calc.splice_count}&connectors=${calc.connector_count}&tx=${calc.tx_power}&rx=${calc.rx_sensitivity}`
    );
  };

  const filtered = history.filter((c) =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.fiber_length.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <History className="w-3.5 h-3.5" /> Calculation Execution Logs
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Optical Link Budget Calculation History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit history of physical loss, received power, link margin, and feasibility determinations.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by Calculation ID or distance..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Calc ID</th>
                <th className="py-3 px-3">Fiber Length</th>
                <th className="py-3 px-3">Attenuation</th>
                <th className="py-3 px-3">Splices</th>
                <th className="py-3 px-3">Connectors</th>
                <th className="py-3 px-3">Physical Loss</th>
                <th className="py-3 px-3">Rx Power</th>
                <th className="py-3 px-3">Remaining Margin</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((calc) => (
                <tr key={calc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3 font-mono text-sky-400 font-bold">{calc.id}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-200">{calc.fiber_length} km</td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{calc.attenuation} dB/km</td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{calc.splice_count}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{calc.connector_count}</td>
                  <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">{calc.physical_loss} dB</td>
                  <td className="py-3.5 px-3 font-mono text-slate-200">{calc.received_power} dBm</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-sky-300">{calc.remaining_margin} dB</td>
                  <td className="py-3.5 px-3">
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
                  <td className="py-3.5 px-3 text-right space-x-1">
                    <button
                      onClick={() => handleRerun(calc)}
                      className="px-2.5 py-1 bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 rounded text-[11px] font-semibold transition"
                      title="Re-run calculation in interactive engine"
                    >
                      Re-run
                    </button>
                    <button
                      onClick={() => handleDelete(calc.id)}
                      className="p-1 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20 transition"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
