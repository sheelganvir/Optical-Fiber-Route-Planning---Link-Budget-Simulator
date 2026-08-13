"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { calculateLinkBudget, LinkBudgetInput } from "@/lib/calculations/link-budget";
import { OpticalPowerVisualizer } from "@/components/link-budget/optical-power-visualizer";
import { saveCalculation } from "@/lib/supabase/client";
import { generateEngineeringPDF } from "@/lib/reports/pdf-generator";
import { Calculator, Save, FileText, ShieldCheck, AlertOctagon } from "lucide-react";

export default function LinkBudgetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Initializing Optical Link Budget Calculator...</span>
        </div>
      }
    >
      <LinkBudgetCalculatorContent />
    </Suspense>
  );
}

function LinkBudgetCalculatorContent() {
  const searchParams = useSearchParams();

  // Parse URL query params for Demo Mode triggers
  const initialLength = Number(searchParams.get("length")) || 25.0;
  const initialAttenuation = Number(searchParams.get("attenuation")) || 0.22;
  const initialSplices = Number(searchParams.get("splices")) || 10;
  const initialConnectors = Number(searchParams.get("connectors")) || 4;
  const initialTx = Number(searchParams.get("tx")) || 3;
  const initialRx = Number(searchParams.get("rx")) || -20;

  const [input, setInput] = useState<LinkBudgetInput>({
    fiberLength: initialLength,
    attenuation: initialAttenuation,
    spliceCount: initialSplices,
    spliceLoss: 0.1,
    connectorCount: initialConnectors,
    connectorLoss: 0.5,
    additionalLoss: 1.0,
    txPower: initialTx,
    rxSensitivity: initialRx,
    safetyMargin: 3.0,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if searchParams change (e.g. from header Demo button)
  useEffect(() => {
    const l = searchParams.get("length");
    if (l) {
      setInput((prev) => ({
        ...prev,
        fiberLength: Number(l),
        attenuation: Number(searchParams.get("attenuation")) || prev.attenuation,
        spliceCount: Number(searchParams.get("splices")) || prev.spliceCount,
        connectorCount: Number(searchParams.get("connectors")) || prev.connectorCount,
      }));
    }
  }, [searchParams]);

  // Execute calculation engine deterministically
  const result = calculateLinkBudget(input);

  const handleInputChange = (field: keyof LinkBudgetInput, val: number) => {
    setInput((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSaveToHistory = async () => {
    setSaving(true);
    await saveCalculation({
      fiber_length: input.fiberLength,
      attenuation: input.attenuation,
      splice_count: input.spliceCount,
      splice_loss: input.spliceLoss,
      connector_count: input.connectorCount,
      connector_loss: input.connectorLoss,
      additional_loss: input.additionalLoss,
      tx_power: input.txPower,
      rx_sensitivity: input.rxSensitivity,
      physical_loss: result.physicalLoss,
      received_power: result.receivedPower,
      link_margin: result.linkMargin,
      safety_margin: result.safetyMargin,
      remaining_margin: result.remainingMargin,
      feasible: result.feasible,
    });
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportPDF = () => {
    generateEngineeringPDF({
      projectName: "Optical Fiber Link Budget Calculation",
      sourceSite: "BLR-POP-01",
      destinationSite: "BLR-SITE-04",
      routeName: `${input.fiberLength} km OFC Metro Link`,
      fiberType: input.attenuation === 0.22 ? "Single Mode G.652D (1550 nm)" : "Single Mode G.652D (1310 nm)",
      wavelength: input.attenuation === 0.22 ? 1550 : 1310,
      input,
      result,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" /> Core Optical Engineering Engine
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Optical Link Budget Calculator & Loss Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculates fiber attenuation, fusion splice losses, connector insertion losses, received optical power & link margin feasibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" /> Export PDF Report
          </button>
          <button
            onClick={handleSaveToHistory}
            disabled={saving}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Calculation"}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Calculation saved to persistent database history!
        </div>
      )}

      {/* Grid: Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Form Inputs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Link Parameter Inputs</span>
            <span className="text-[10px] font-mono text-sky-400">REAL-TIME ENGINE</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Fiber Span Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={input.fiberLength}
                onChange={(e) => handleInputChange("fiberLength", Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Fiber Attenuation Coefficient (dB/km)</label>
              <input
                type="number"
                step="0.01"
                value={input.attenuation}
                onChange={(e) => handleInputChange("attenuation", Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">1310 nm standard: 0.35 dB/km • 1550 nm low loss: 0.22 dB/km</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Splice Count</label>
                <input
                  type="number"
                  value={input.spliceCount}
                  onChange={(e) => handleInputChange("spliceCount", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Loss / Splice (dB)</label>
                <input
                  type="number"
                  step="0.05"
                  value={input.spliceLoss}
                  onChange={(e) => handleInputChange("spliceLoss", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Connector Count</label>
                <input
                  type="number"
                  value={input.connectorCount}
                  onChange={(e) => handleInputChange("connectorCount", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Loss / Conn (dB)</label>
                <input
                  type="number"
                  step="0.1"
                  value={input.connectorLoss}
                  onChange={(e) => handleInputChange("connectorLoss", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Additional System Loss (dB)</label>
              <input
                type="number"
                step="0.5"
                value={input.additionalLoss}
                onChange={(e) => handleInputChange("additionalLoss", Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tx Power (dBm)</label>
                <input
                  type="number"
                  value={input.txPower}
                  onChange={(e) => handleInputChange("txPower", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sky-400 font-mono font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rx Sens (dBm)</label>
                <input
                  type="number"
                  value={input.rxSensitivity}
                  onChange={(e) => handleInputChange("rxSensitivity", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Required Safety Margin (dB)</label>
              <input
                type="number"
                value={input.safetyMargin}
                onChange={(e) => handleInputChange("safetyMargin", Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-400 font-mono font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Calculation Sheet Table & Optical Power Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic Optical Power Decay Visualizer Chart */}
          <OpticalPowerVisualizer input={input} result={result} />

          {/* Section 13 Transparent Engineering Calculation Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>OPTICAL LINK BUDGET SHEET</span>
              <span className="font-mono text-xs text-slate-400">ITU-T COMPLIANT FORMULA</span>
            </h3>

            <div className="mt-4 font-mono text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Fiber Length</span>
                <span className="font-bold">{input.fiberLength.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Fiber Attenuation</span>
                <span className="font-bold">{input.attenuation.toFixed(2)} dB/km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-amber-400 font-bold">
                <span>Fiber Loss</span>
                <span>{result.fiberLoss.toFixed(2)} dB</span>
              </div>

              <div className="py-1"></div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Splices ({input.spliceCount} splices @ {input.spliceLoss} dB)</span>
                <span className="font-bold">{result.spliceLoss.toFixed(2)} dB</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Connectors ({input.connectorCount} connectors @ {input.connectorLoss} dB)</span>
                <span className="font-bold">{result.connectorLoss.toFixed(2)} dB</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Additional Loss</span>
                <span className="font-bold">{result.additionalLoss.toFixed(2)} dB</span>
              </div>

              <div className="flex justify-between py-2 border-t-2 border-slate-700 text-slate-100 text-sm font-bold bg-slate-950 px-3 rounded-lg">
                <span>Physical Link Loss</span>
                <span className="text-amber-400">{result.physicalLoss.toFixed(2)} dB</span>
              </div>

              <div className="py-1"></div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Tx Launch Power</span>
                <span className="text-sky-400 font-bold">{input.txPower > 0 ? `+${input.txPower}` : input.txPower} dBm</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Received Power (Rx)</span>
                <span className={`font-bold ${result.feasible ? "text-emerald-400" : "text-rose-400"}`}>{result.receivedPower.toFixed(2)} dBm</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Rx Sensitivity Threshold</span>
                <span className="text-rose-400 font-bold">{input.rxSensitivity.toFixed(2)} dBm</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Link Margin</span>
                <span className="text-sky-300 font-bold">{result.linkMargin.toFixed(2)} dB</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Required Safety Margin</span>
                <span className="font-bold text-amber-300">{result.safetyMargin.toFixed(2)} dB</span>
              </div>

              <div className="flex justify-between py-2.5 border-t-2 border-slate-700 text-sm font-bold bg-slate-950 px-3 rounded-lg">
                <span>Remaining Engineering Margin</span>
                <span className={result.feasible ? "text-emerald-400" : "text-rose-400"}>
                  {result.remainingMargin > 0 ? `+${result.remainingMargin.toFixed(2)}` : result.remainingMargin.toFixed(2)} dB
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-400 font-sans text-xs">FEASIBILITY STATUS:</span>
                {result.feasible ? (
                  <span className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-sans font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> ✓ LINK FEASIBLE
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-sans font-bold text-xs flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" /> ✕ LINK NOT FEASIBLE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
