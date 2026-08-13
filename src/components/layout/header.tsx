"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles, AlertTriangle, ShieldCheck, UserCheck, LogOut } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const handleRunDemo = () => {
    setIsDemoRunning(true);
    // Navigate directly to Link Budget with demo parameters preloaded
    setTimeout(() => {
      router.push("/link-budget?demo=true&length=25&wavelength=1550&attenuation=0.22&splices=10&connectors=4&tx=3&rx=-20&margin=3");
      setIsDemoRunning(false);
    }, 400);
  };

  const handleSimulateHighLoss = () => {
    router.push("/link-budget?demo=true&length=70&wavelength=1310&attenuation=0.35&splices=22&connectors=6&tx=3&rx=-20&margin=3");
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* System Status Banner */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[11px]">
            {isSupabaseConfigured ? "Supabase Connected" : "Local Simulation Engine (Offline Demo)"}
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden md:inline">
          ITU-T Fiber Attenuation Model Standard
        </span>
      </div>

      {/* Action Buttons: Demo Mode & High Loss Simulation */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSimulateHighLoss}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition"
          title="Load 70km high-loss simulation scenario"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate High Loss</span>
        </button>

        <button
          onClick={handleRunDemo}
          disabled={isDemoRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-900/40 transition active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isDemoRunning ? "Loading Demo..." : "Demo Mode"}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
        </button>

        <div className="h-4 w-px bg-slate-800 my-auto hidden sm:block" />

        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Engineer Session</span>
        </button>
      </div>
    </header>
  );
}
