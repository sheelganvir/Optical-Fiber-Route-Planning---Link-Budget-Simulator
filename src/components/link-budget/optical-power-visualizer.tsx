"use client";

import { LinkBudgetResult, LinkBudgetInput } from "@/lib/calculations/link-budget";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { ArrowDown, Radio, ShieldCheck, AlertOctagon } from "lucide-react";

interface VisualizerProps {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
}

export function OpticalPowerVisualizer({ input, result }: VisualizerProps) {
  // Generate step-by-step cascade stages for the power decay profile
  const txPower = input.txPower;
  const p1_afterFiber = Number((txPower - result.fiberLoss).toFixed(2));
  const p2_afterSplice = Number((p1_afterFiber - result.spliceLoss).toFixed(2));
  const p3_afterConnector = Number((p2_afterSplice - result.connectorLoss).toFixed(2));
  const p4_finalRx = result.receivedPower;

  const chartData = [
    { stage: "Transmitter (Tx)", power: txPower, loss: 0, desc: "Optical Launch Power" },
    { stage: "Fiber Attenuation", power: p1_afterFiber, loss: result.fiberLoss, desc: `${input.fiberLength} km @ ${input.attenuation} dB/km` },
    { stage: "Splice Points", power: p2_afterSplice, loss: result.spliceLoss, desc: `${input.spliceCount} splices @ ${input.spliceLoss} dB` },
    { stage: "Connector Ports", power: p3_afterConnector, loss: result.connectorLoss, desc: `${input.connectorCount} connectors @ ${input.connectorLoss} dB` },
    { stage: "Receiver Input (Rx)", power: p4_finalRx, loss: result.additionalLoss, desc: `Sensitivity limit: ${input.rxSensitivity} dBm` },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            Dynamic Optical Power Decay Cascade
          </h3>
          <p className="text-xs text-slate-400">
            Signal launch power vs attenuation stages from Tx laser to Rx photodiode
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result.feasible ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> LINK FEASIBLE (+{result.remainingMargin} dB)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
              <AlertOctagon className="w-3.5 h-3.5" /> UNFEASIBLE ({result.remainingMargin} dB Deficit)
            </span>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={result.feasible ? "#0284c7" : "#f43f5e"} stopOpacity={0.4} />
                <stop offset="95%" stopColor={result.feasible ? "#0284c7" : "#f43f5e"} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              unit=" dBm"
              domain={[(min: number) => Math.min(min, input.rxSensitivity - 5), (max: number) => Math.max(max, txPower + 3)]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
              labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
              formatter={(val: number) => [`${val} dBm`, "Optical Power"]}
            />
            <ReferenceLine
              y={input.rxSensitivity}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: `Rx Sensitivity (${input.rxSensitivity} dBm)`, fill: "#ef4444", fontSize: 11, position: "insideBottomRight" }}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke={result.feasible ? "#38bdf8" : "#fb7185"}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#powerGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {/* Stage 1: Tx Launch */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Tx Optical Power</div>
          <div className="text-lg font-bold font-mono text-sky-400 mt-1">{txPower > 0 ? `+${txPower}` : txPower} dBm</div>
          <div className="text-[10px] text-slate-400 mt-1">Laser Transmitter</div>
        </div>

        {/* Stage 2: Fiber Loss */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center relative">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Fiber Attenuation</div>
          <div className="text-sm font-bold font-mono text-amber-400 mt-1">-{result.fiberLoss} dB</div>
          <div className="text-[10px] text-slate-400 mt-1">After: <span className="font-mono text-slate-200">{p1_afterFiber} dBm</span></div>
        </div>

        {/* Stage 3: Splice Loss */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Splice Loss</div>
          <div className="text-sm font-bold font-mono text-purple-400 mt-1">-{result.spliceLoss} dB</div>
          <div className="text-[10px] text-slate-400 mt-1">After: <span className="font-mono text-slate-200">{p2_afterSplice} dBm</span></div>
        </div>

        {/* Stage 4: Connector Loss */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Connector Loss</div>
          <div className="text-sm font-bold font-mono text-pink-400 mt-1">-{result.connectorLoss} dB</div>
          <div className="text-[10px] text-slate-400 mt-1">After: <span className="font-mono text-slate-200">{p3_afterConnector} dBm</span></div>
        </div>

        {/* Stage 5: Rx Power */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Rx Received Power</div>
          <div className={`text-lg font-bold font-mono mt-1 ${result.feasible ? "text-emerald-400" : "text-rose-400"}`}>
            {result.receivedPower} dBm
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Limit: <span className="font-mono text-slate-300">{input.rxSensitivity} dBm</span></div>
        </div>
      </div>
    </div>
  );
}
