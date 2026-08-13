"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Calculator,
  GitCompare,
  Building2,
  Sliders,
  CheckCircle2,
  History,
  FileText,
  FlaskConical,
  Settings,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Route Planner", href: "/route-planner", icon: MapPin },
  { label: "Link Budget", href: "/link-budget", icon: Calculator },
  { label: "Route Comparison", href: "/route-comparison", icon: GitCompare },
  { label: "Sites", href: "/sites", icon: Building2 },
  { label: "Fiber Profiles", href: "/fiber-profiles", icon: Sliders },
  { label: "Site Readiness", href: "/site-readiness", icon: CheckCircle2 },
  { label: "Calculation History", href: "/history", icon: History },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Simulation Scenarios", href: "/scenarios", icon: FlaskConical },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-sky-600/20 text-sky-400 rounded-lg border border-sky-500/30">
          <Zap className="w-6 h-6 text-sky-400 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-none">
            OFC LINK SIMULATOR
          </h1>
          <span className="text-[10px] text-sky-400 uppercase tracking-widest font-semibold">
            Network Decision Support
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-600 text-white shadow-md shadow-sky-900/40 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              <Icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Engine Status:</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE
          </span>
        </div>
        <div className="text-[10px] text-slate-600">v1.0.0 • ITU-T G.652/G.655 Spec</div>
      </div>
    </aside>
  );
}
