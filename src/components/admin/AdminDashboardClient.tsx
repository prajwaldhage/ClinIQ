"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Shield, Activity, AlertTriangle,
  TrendingUp, Database, CheckCircle2, Clock, Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AdminDashboardClientProps {
  user: { id: string; name: string; email: string; role: string };
}

const MOCK_SYSTEM_HEALTH = [
  { label: "Supabase DB", status: "operational", uptime: 99.9 },
  { label: "Deepgram STT", status: "operational", uptime: 99.7 },
  { label: "Groq AI", status: "operational", uptime: 99.5 },
  { label: "Audit Chain", status: "operational", uptime: 100 },
];

const MOCK_RECENT_ALERTS = [
  { type: "drug_interaction", patient: "R. Patel", severity: "critical", time: "10:32 AM" },
  { type: "allergy", patient: "P. Sharma", severity: "high", time: "10:15 AM" },
  { type: "dosage", patient: "A. Verma", severity: "medium", time: "9:47 AM" },
];

export function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-[var(--bg)] min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Overview</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">System health, user activity, and compliance</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-[var(--border)] hover:bg-[var(--surface-elevated)]">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Consultations", value: "1,247", icon: Activity, color: "text-[#4A90E2]", bg: "bg-[#4A90E2]/10", delta: "+23 today" },
          { label: "Active Doctors", value: "18", icon: Users, color: "text-[#10B981]", bg: "bg-[#10B981]/10", delta: "12 online now" },
          { label: "Safety Alerts Today", value: "7", icon: Shield, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", delta: "3 unresolved" },
          { label: "Audit Events", value: "3,891", icon: Database, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", delta: "Chain intact ✓" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-[var(--surface)] border-[var(--border)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ borderRadius: "var(--radius)" }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1">{stat.delta}</p>
                    </div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System health */}
        <Card className="bg-[var(--surface)] border-[var(--border)]" style={{ borderRadius: "var(--radius)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <div className="w-8 h-8 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#4A90E2]" />
              </div>
              System Health
              <Badge className="ml-auto text-[9px] bg-[#10B981]/10 text-[#10B981] border-0">All Operational</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_SYSTEM_HEALTH.map((service, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-sm text-[var(--text-primary)] flex-1">{service.label}</span>
                <span className="text-xs text-[var(--text-secondary)]">{service.uptime}% uptime</span>
                <Progress value={service.uptime} className="w-16 h-1.5 bg-[var(--border)]" indicatorClassName="bg-[#10B981]" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent safety alerts */}
        <Card className="bg-[var(--surface)] border-[var(--border)]" style={{ borderRadius: "var(--radius)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              </div>
              Recent Safety Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_RECENT_ALERTS.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)]">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${
                  alert.severity === "critical" ? "text-[#EF4444]" :
                  alert.severity === "high" ? "text-[#F59E0B]" : "text-[#F59E0B]"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{alert.patient}</p>
                  <p className="text-xs text-[var(--text-secondary)] capitalize">{alert.type.replace("_", " ")}</p>
                </div>
                <div className="text-right">
                  <Badge className={`text-[9px] border-0 ${
                    alert.severity === "critical" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>
                    {alert.severity}
                  </Badge>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Compliance metrics */}
        <Card className="bg-[var(--surface)] border-[var(--border)]" style={{ borderRadius: "var(--radius)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              </div>
              Compliance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "ABDM Compliance", value: 100, color: "bg-[#10B981]" },
              { label: "ICD-10 Auto-coding Rate", value: 98, color: "bg-[#4A90E2]" },
              { label: "Consent Capture Rate", value: 94, color: "bg-[#8B5CF6]" },
              { label: "Audit Chain Integrity", value: 100, color: "bg-[#10B981]" },
            ].map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{m.label}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-2 bg-[var(--border)]" indicatorClassName={m.color} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent doctor activity */}
        <Card className="bg-[var(--surface)] border-[var(--border)]" style={{ borderRadius: "var(--radius)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--text-secondary)]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { event: "Consultation finalized", actor: "Dr. Sharma", time: "2m ago" },
              { event: "Safety alert acknowledged", actor: "Dr. Patel", time: "8m ago" },
              { event: "ICD codes mapped (E11.9, I10)", actor: "System", time: "12m ago" },
              { event: "Patient summary sent via WhatsApp", actor: "System", time: "15m ago" },
              { event: "Consent recorded for P. Kumar", actor: "Dr. Sharma", time: "22m ago" },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#4A90E2] shrink-0" />
                <p className="text-sm text-[var(--text-secondary)] flex-1">{event.event}</p>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[var(--text-primary)]">{event.actor}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{event.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
