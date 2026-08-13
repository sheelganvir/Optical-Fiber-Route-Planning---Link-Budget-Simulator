"use client";

import { useState } from "react";
import { generateEngineeringPDF } from "@/lib/reports/pdf-generator";
import { calculateLinkBudget } from "@/lib/calculations/link-budget";
import { FileText, Download, ShieldCheck, Printer, AlertOctagon } from "lucide-react";

export default function ReportsPage() {
  const [sourceSite, setSourceSite] = useState("BLR-POP-01 (MG Road Gateway)");
  const [destSite, setDestSite] = useState("BLR-SITE-04 (Whitefield Tech Hub)");
  const [routeName, setRouteName] = useState("Bengaluru Metro East Ring Alpha");
  const [fiberLength, setFiberLength] = useState(25);
  const [attenuation, setAttenuation] = useState(0.22);
  const [splices, setSplices] = useState(10);
  const [connectors, setConnectors] = useState(4);
  const [txPower, setTxPower] = useState(3);
  const [rxSens, setRxSens] = useState(-20);
  const [safetyMargin, setSafetyMargin] = useState(3);

  const input = {
    fiberLength,
    attenuation,
    spliceCount: splices,
    spliceLoss: 0.1,
    connectorCount: connectors,
    connectorLoss: 0.5,
    additionalLoss: 1.0,
    txPower,
    rxSensitivity: rxSens,
    safetyMargin,
  };

  const result = calculateLinkBudget(input);

  const handleDownload = () => {
    generateEngineeringPDF({
      projectName: routeName,
      sourceSite,
      destinationSite: destSite,
      routeName,
      fiberType: attenuation === 0.22 ? "Single Mode G.652D (1550 nm)" : "Single Mode G.652D (1310 nm)",
      wavelength: attenuation === 0.22 ? 1550 : 1310,
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
            <FileText className="w-3.5 h-3.5" /> Engineering PDF Report Generator
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Optical Fiber Link Analysis Report Compiler
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable engineering compliance documents summarizing optical link budgets, physical losses, and safety margins.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition"
        >
          <Download className="w-4 h-4" /> Download PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Customizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl text-xs">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3">Report Document Inputs</h3>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Route / Project Title</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Source Site (Tx Node)</label>
            <input
              type="text"
              value={sourceSite}
              onChange={(e) => setSourceSite(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Destination Site (Rx Node)</label>
            <input
              type="text"
              value={destSite}
              onChange={(e) => setDestSite(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Length (km)</label>
              <input
                type="number"
                value={fiberLength}
                onChange={(e) => setFiberLength(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Attenuation (dB/km)</label>
              <input
                type="number"
                step="0.01"
                value={attenuation}
                onChange={(e) => setAttenuation(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Report Sheet Preview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">LIVE DOCUMENT PREVIEW</span>
              <h3 className="font-extrabold text-slate-100 text-base">{routeName}</h3>
            </div>

            {result.feasible ? (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> LINK FEASIBLE
              </span>
            ) : (
              <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold text-xs rounded-full flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> LINK NOT FEASIBLE
              </span>
            )}
          </div>

          {/* Report Sections */}
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">1. Project Information</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Source: <span className="text-slate-100">{sourceSite}</span></div>
                <div>Destination: <span className="text-slate-100">{destSite}</span></div>
                <div>Distance: <span className="text-sky-400">{fiberLength} km</span></div>
                <div>Fiber Spec: <span className="text-amber-400">{attenuation === 0.22 ? "1550 nm (0.22 dB/km)" : "1310 nm (0.35 dB/km)"}</span></div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">2. Loss Budget Summary</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Fiber Attenuation Loss: <span className="text-amber-400">{result.fiberLoss} dB</span></div>
                <div>Splice Loss ({splices} splices): <span className="text-purple-400">{result.spliceLoss} dB</span></div>
                <div>Connector Loss ({connectors} conn): <span className="text-pink-400">{result.connectorLoss} dB</span></div>
                <div>Additional Loss: <span className="text-slate-400">{result.additionalLoss} dB</span></div>
                <div className="col-span-2 pt-2 border-t border-slate-800 text-sm font-bold text-slate-100">
                  Total Physical Link Loss: <span className="text-amber-400">{result.physicalLoss} dB</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">3. Optical Power & Safety Margins</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Tx Power: <span className="text-sky-400">{txPower} dBm</span></div>
                <div>Rx Received Power: <span className="text-emerald-400">{result.receivedPower} dBm</span></div>
                <div>Rx Sensitivity: <span className="text-rose-400">{rxSens} dBm</span></div>
                <div>Link Margin: <span className="text-sky-300">{result.linkMargin} dB</span></div>
                <div className="col-span-2 pt-2 border-t border-slate-800 text-sm font-bold text-slate-100">
                  Remaining Margin: <span className={result.feasible ? "text-emerald-400" : "text-rose-400"}>{result.remainingMargin} dB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
