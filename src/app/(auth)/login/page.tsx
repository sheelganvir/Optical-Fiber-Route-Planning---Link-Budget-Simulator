"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Lock, Mail, Play, ArrowRight, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("engineer@telecom.org");
  const [password, setPassword] = useState("OpticalLink2026!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

    // Direct access to dashboard
    router.push("/dashboard");
  };

  const handleDemoAccess = () => {
    setEmail("demo.engineer@telecom.org");
    setPassword("DemoAccess2026!");
    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-sky-600/20 text-sky-400 rounded-2xl border border-sky-500/30 mb-2">
            <Zap className="w-8 h-8 text-sky-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Telecom Engineer Access
          </h1>
          <p className="text-xs text-slate-400">
            Optical-Fiber Route Planning & Link Budget Simulator
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Engineering Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Engineering Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-mono uppercase shrink-0">
            Interview Demo Quick Launch
          </span>
        </div>

        <button
          onClick={handleDemoAccess}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
        >
          <Play className="w-3.5 h-3.5 fill-current text-sky-400" /> Instant Demo Mode (No Credentials Needed)
        </button>
      </div>
    </div>
  );
}
