"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Users,
  Shield,
  CreditCard,
  Stethoscope,
  CalendarDays,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  FileText,
  HeartPulse,
  Globe,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TriagePanel } from "@/components/doctor/TriagePanel";
import { FamilyHealthGraph } from "@/components/doctor/FamilyHealthGraph";
import { FlashbackCard } from "@/components/doctor/FlashbackCard";
import {
  ProtocolCreditBadge,
  GlobalRepositoryModal,
  useProtocolCredits,
} from "@/components/doctor/ProtocolCreditBadge";
import { formatDate, cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentType {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  time: string;
  type: string;
  complaint: string;
  lastVisit: string | null;
  status: string;
  urgency: string;
}

interface SafetyAlertSummary {
  drug: string;
  severity: string;
  patient: string;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  stat,
  index,
}: {
  stat: {
    label: string;
    value: string;
    icon: any;
    delta: string;
    color: string;
    bg: string;
  };
  index: number;
}) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="border-[var(--border)] bg-[var(--surface)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        style={{ borderRadius: "var(--radius)" }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {stat.value}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                {stat.delta}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                stat.bg,
              )}
            >
              <Icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Patient row ──────────────────────────────────────────────────────────────

function PatientRow({ appt, index }: { appt: AppointmentType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.04 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group",
        appt.status === "completed"
          ? "border-[var(--border)] opacity-60 bg-transparent"
          : appt.urgency === "high"
            ? "border-[#EF4444]/25 bg-[#EF4444]/5 hover:bg-[#EF4444]/10"
            : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] hover:shadow-sm",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-semibold shrink-0",
          appt.urgency === "high"
            ? "bg-[#EF4444]/20 text-[#EF4444]"
            : "bg-[#4A90E2]/20 text-[#4A90E2]",
        )}
      >
        {appt.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {appt.name}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {appt.age}
            {appt.gender}
          </span>
          {appt.urgency === "high" && (
            <Badge className="text-[9px] py-0 px-1.5 h-4 bg-[#EF4444]/10 text-[#EF4444] border-0">
              Urgent
            </Badge>
          )}
          {appt.status === "completed" && (
            <Badge className="text-[9px] py-0 px-1.5 h-4 bg-[#10B981]/10 text-[#10B981] border-0">
              Done
            </Badge>
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
          {appt.complaint}
        </p>
      </div>

      {/* Time & type */}
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-[var(--text-primary)]">
          {appt.time}
        </p>
        <p className="text-[10px] text-[var(--text-secondary)] capitalize">
          {appt.type}
        </p>
      </div>

      {/* Action */}
      {appt.status !== "completed" && (
        <Link
          href={`/doctor/consultation?id=new&patientId=${appt.patient_id}&patientName=${encodeURIComponent(appt.name)}`}
        >
          <Button
            size="sm"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl"
          >
            <Stethoscope className="w-3 h-3" />
            Start
          </Button>
        </Link>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DoctorDashboardClientProps {
  user: { id: string; name: string; email: string; role: string };
}

export function DoctorDashboardClient({ user }: DoctorDashboardClientProps) {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRepoModal, setShowRepoModal] = useState(false);
  const { credits, addCredits } = useProtocolCredits();

  // Calculate age from DOB
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = getSupabaseBrowserClient();

      try {
        const today = new Date().toISOString().split("T")[0];

        // Fetch today's appointments with patient info
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(
            `
            id, date, time_slot, status, appointment_type,
            patient:patients!appointments_patient_id_fkey(id, name, dob, gender)
          `,
          )
          .eq("date", today)
          .order("time_slot", { ascending: true });

        if (appointmentsData && appointmentsData.length > 0) {
          const mapped: AppointmentType[] = appointmentsData.map((a) => {
            const patient = a.patient as {
              id: string;
              name: string;
              dob: string;
              gender: string;
            } | null;
            return {
              id: a.id as string,
              patient_id: patient?.id ?? "",
              name: patient?.name ?? "Unknown Patient",
              age: patient?.dob ? calculateAge(patient.dob) : 0,
              gender: (patient?.gender ?? "M").charAt(0),
              time: a.time_slot ?? "—",
              type: a.appointment_type ?? "general",
              complaint: "—", // Can be added if complaint is stored
              lastVisit: null, // Can be fetched if needed
              status: a.status ?? "pending",
              urgency: "normal", // Can be calculated based on patient conditions
            };
          });
          setAppointments(mapped);
        }

        // Fetch recent safety alerts
        const { data: alertsData } = await supabase
          .from("safety_alerts")
          .select(
            `
            id, title, severity, drug_a, drug_b,
            consultation:consultations!safety_alerts_consultation_id_fkey(
              patient:patients!consultations_patient_id_fkey(name)
            )
          `,
          )
          .eq("acknowledged", false)
          .order("created_at", { ascending: false })
          .limit(3);

        if (alertsData && alertsData.length > 0) {
          const mappedAlerts: SafetyAlertSummary[] = alertsData.map((a) => {
            const consultation = a.consultation as {
              patient?: { name?: string };
            } | null;
            const patientName = consultation?.patient?.name ?? "Unknown";
            const initials = patientName
              .split(" ")
              .map((n) => n.charAt(0))
              .join(". ");

            return {
              drug: a.title ?? `${a.drug_a} + ${a.drug_b}`,
              severity: a.severity ?? "medium",
              patient: initials,
            };
          });
          setAlerts(mappedAlerts);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const filteredAppts = appointments.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.complaint.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = useMemo(() => {
    const todayTotal = appointments.length;
    const completed = appointments.filter(
      (a) => a.status === "completed",
    ).length;
    const pending = appointments.filter((a) => a.status === "pending").length;

    return [
      {
        label: "Today's Patients",
        value: todayTotal.toString(),
        icon: Users,
        delta: `${pending} waiting`,
        color: "text-[#4A90E2]",
        bg: "bg-[#4A90E2]/10",
      },
      {
        label: "Consultations Done",
        value: completed.toString(),
        icon: CheckCircle2,
        delta:
          todayTotal > 0
            ? `${Math.round((completed / todayTotal) * 100)}% complete`
            : "0%",
        color: "text-[#10B981]",
        bg: "bg-[#10B981]/10",
      },
      {
        label: "Safety Alerts",
        value: alerts.length.toString(),
        icon: Shield,
        delta: `${alerts.filter((a) => a.severity === "critical").length} critical`,
        color: "text-[#EF4444]",
        bg: "bg-[#EF4444]/10",
      },
      {
        label: "Queue Status",
        value: pending.toString(),
        icon: CreditCard,
        delta: "Pending consultations",
        color: "text-[#F59E0B]",
        bg: "bg-[#F59E0B]/10",
      },
    ];
  }, [appointments, alerts]);

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-[var(--bg)] min-h-screen">
      {/* Global Repository Modal */}
      <GlobalRepositoryModal
        isOpen={showRepoModal}
        onClose={() => setShowRepoModal(false)}
        onContribute={(points, description) => {
          addCredits(points, description);
          setShowRepoModal(false);
        }}
      />

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {greeting}, Dr. {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            {formatDate(new Date())} ·{" "}
            {appointments.filter((a) => a.status === "pending").length} patients
            waiting
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Protocol Credits compact badge */}
          <ProtocolCreditBadge credits={credits} compact />

          <button
            onClick={() => setShowRepoModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 transition-all duration-200 text-xs font-medium text-[#8B5CF6]"
          >
            <Globe className="w-3.5 h-3.5" />
            Repository
          </button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl border-[var(--border)] hover:bg-[var(--surface-elevated)]"
          >
            <FileText className="w-3.5 h-3.5" />
            All Records
          </Button>
          <Link href="/doctor/consultation?id=new">
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Consultation
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Stats grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Today's appointments ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Today&apos;s Queue
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 w-52 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            {appointments.length === 0 ? (
              <Card className="border-[var(--border)]">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    No appointments today
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Your schedule is clear for today
                  </p>
                </CardContent>
              </Card>
            ) : filteredAppts.length === 0 ? (
              <Card className="border-[var(--border)]">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="w-8 h-8 text-[var(--text-secondary)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No patients match your search
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAppts.map((appt, i) => (
                <PatientRow key={appt.id} appt={appt} index={i} />
              ))
            )}
          </div>
        </div>

        {/* ─── Right panel ───────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Safety alerts preview */}
          <Card
            className="bg-[var(--surface)] border-[var(--border)]"
            style={{ borderRadius: "var(--radius)" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#EF4444]" />
                </div>
                Active Alerts
                <Badge className="ml-auto text-[9px] bg-[#EF4444]/10 text-[#EF4444] border-0">
                  {alerts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <div className="text-center py-6">
                  <Shield className="w-8 h-8 mx-auto text-green-400 mb-2" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    No active safety alerts
                  </p>
                </div>
              ) : (
                alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-xl text-xs border",
                      alert.severity === "critical"
                        ? "bg-[#EF4444]/10 border-[#EF4444]/20"
                        : alert.severity === "high"
                          ? "bg-[#F59E0B]/10 border-[#F59E0B]/20"
                          : "bg-[#F59E0B]/5 border-[#F59E0B]/10",
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        alert.severity === "critical"
                          ? "text-[#EF4444]"
                          : alert.severity === "high"
                            ? "text-[#F59E0B]"
                            : "text-[#F59E0B]",
                      )}
                    />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {alert.drug}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        {alert.patient}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <Link href="/doctor/alerts">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs mt-2 gap-1 rounded-xl hover:bg-[var(--surface-elevated)]"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card
            className="bg-[var(--surface)] border-[var(--border)]"
            style={{ borderRadius: "var(--radius)" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                </div>
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Consultations", value: "—", icon: Stethoscope },
                { label: "Avg. Duration", value: "—", icon: Clock },
                { label: "Patient Satisfaction", value: "—", icon: HeartPulse },
                { label: "Coding Accuracy", value: "—", icon: Activity },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-xs text-[var(--text-secondary)]">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Triage panel */}
          {appointments.length > 0 && (
            <FlashbackCard
              patientId={appointments[0]?.patient_id}
              patientName={appointments[0]?.name}
            />
          )}
          <TriagePanel />
        </div>
      </div>

      {/* ─── Family Health Graph ──────────────────────────────────── */}
      {appointments.length > 0 && (
        <FamilyHealthGraph patientId={appointments[0]?.patient_id} />
      )}
    </div>
  );
}
