"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const DEMO_ROLES = [
  { label: "Doctor", email: "demo.doctor@cliniq.app" },
  { label: "Patient", email: "demo.patient@cliniq.app" },
  { label: "Admin", email: "demo.admin@cliniq.app" },
  { label: "Reception", email: "demo.reception@cliniq.app" },
] as const;

const ROLE_PATHS: Record<string, string> = {
  doctor: "/doctor", nurse: "/doctor",
  patient: "/patient", admin: "/admin", research: "/research",
  receptionist: "/receptionist",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doLogin(e: string, p: string) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e, password: p }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Login failed"); setLoading(false); return; }
    router.push(ROLE_PATHS[data.user.role] ?? "/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#4A90E2] to-[#3CC2C2] p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            <span className="text-white">Clin</span>IQ
          </span>
        </div>

        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Every Word<br /><span className="text-white/80">Heals.</span>
          </h1>
          <p className="text-sm text-white/80 leading-relaxed max-w-xs">
            AI-powered ambient clinical documentation. Real-time ICD mapping. Safety guards. Built for Indian healthcare.
          </p>
        </div>

        <p className="relative z-10 text-[10px] text-white/60">ABDM Compliant · HIPAA Standards · ICD-10</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#3CC2C2] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              <span className="text-[var(--primary)]">Clin</span>IQ
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Sign in</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Access your clinical workspace</p>

          {/* Quick Demo Login */}
          <div className="mb-5 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <p className="text-[10px] text-[var(--text-secondary)] mb-3 font-medium uppercase tracking-wider">Quick demo — one click login</p>
            <div className="flex gap-2">
              {DEMO_ROLES.map(({ label, email: e }) => (
                <button key={label} onClick={() => doLogin(e, "demo123456")} disabled={loading}
                  className="flex-1 text-[11px] py-2.5 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--primary)] border border-[var(--border)] font-medium transition-all duration-200 disabled:opacity-40">
                  {loading ? "…" : label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={(ev) => { ev.preventDefault(); doLogin(email, password); }} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="doctor@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20">
                <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0" />
                <p className="text-xs text-[var(--danger)]">{error}</p>
              </motion.div>
            )}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-5 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
            <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed">
              demo.doctor@cliniq.app<br />
              demo.patient@cliniq.app<br />
              demo.admin@cliniq.app<br />
              demo.reception@cliniq.app<br />
              <span className="text-[var(--text-primary)] font-semibold">password: demo123456</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
